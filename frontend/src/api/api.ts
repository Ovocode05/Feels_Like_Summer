import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { isTokenExpired, clearAuthData, getToken, setToken } from "@/lib/auth";

const url = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/v1";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: url,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - check token expiration before request
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && isTokenExpired(token)) {
      // Token is expired, try to refresh
      try {
        const newToken = await refreshToken();
        setToken(newToken);
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } catch (error) {
        // Refresh failed, clear auth and redirect to login
        clearAuthData();
        if (typeof window !== "undefined") {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(error);
      }
    } else if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't retry auth endpoints (login, register, etc.) - let them fail naturally
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');
    
    // If error is 401 and we haven't retried yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        setToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearAuthData();
        if (typeof window !== "undefined") {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  type: "stu" | "fac";
}

interface LoginUserData {
  email?: string;
  password?: string;
}

export type ProjectCreateType = {
  name: string;
  sdesc: string;
  ldesc: string;
  isActive: boolean;
  tags?: string[];
  working_users?: string[];
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

type booled = {
  isActive?: boolean;
  deadline?: string;
};

export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await axiosInstance.post("/auth/signup", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (data: LoginUserData) => {
  try {
    const response = await axiosInstance.post("/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data.token; // Assuming the response contains a token
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const response = await axiosInstance.get("/auth/me", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.post(
      `${url}/auth/refresh`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const createProject = async (data: ProjectCreateType, token: string) => {
  try {
    const response = await axiosInstance.post("/projects", data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const fetchProjects_active = async (token: string) => {
  try {
    const response = await axiosInstance.get("/projects", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// New endpoint for students - fetches projects visible to them (active + applied projects)
// Supports pagination
export const fetchProjectsForStudent = async (
  token: string,
  page: number = 1,
  pageSize: number = 20
) => {
  try {
    const response = await axiosInstance.get("/projects/student", {
      params: { page, pageSize },
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects for student:", error);
    throw error;
  }
};

export const fetchProjects_active_my = async (token: string) => {
  try {
    const response = await axiosInstance.get("/projects/my", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const deleteProject = async (projectId: string, token: string) => {
  try {
    const response = await axiosInstance.delete(`/projects/${projectId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const getProjectByPid = async (pid: string, token: string) => {
  try {
    const response = await axiosInstance.get(`/projects/${pid}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching project by pid:", error);
    throw error;
  }
};

export const updateProjectByPid = async (
  pid: string,
  data: booled,
  token: string
) => {
  try {
    const response = await axiosInstance.put(`/projects/${pid}`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating project by pid:", error);
    throw error;
  }
};

export const getProjectWorkingUsers = async (pid: string, token: string) => {
  try {
    const response = await axiosInstance.get(`/projects/${pid}/working-users`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching project working users:", error);
    throw error;
  }
};

export const removeWorkingUser = async (pid: string, uid: string, token: string) => {
  try {
    const response = await axiosInstance.delete(`/projects/${pid}/working-users/${uid}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing working user:", error);
    throw error;
  }
};

// Password Reset APIs
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/forgot-password",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const verifyResetToken = async (token: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/verify-reset-token",
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/reset-password",
      { token, new_password: newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Email Verification APIs
export const sendVerificationCode = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/send-verification-code",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

export const verifyCode = async (email: string, code: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/verify-code",
      { email, code },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/verify-email",
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

export const resendVerification = async (email: string) => {
  try {
    const response = await axiosInstance.post(
      "/auth/resend-verification",
      { email },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error;
  }
};

// Application APIs
export const getMyApplications = async (token: string) => {
  try {
    const response = await axiosInstance.get("/applications/my", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

export const getApplicationForProject = async (projectId: string, token: string) => {
  try {
    const response = await getMyApplications(token);
    if (response.applications && Array.isArray(response.applications)) {
      const application = response.applications.find((app: { PID: string }) => app.PID === projectId);
      return application || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching application for project:", error);
    return null;
  }
};

// New optimized endpoint - gets application status for a specific project with a single efficient query
export const getMyApplicationStatusForProject = async (projectId: string, token: string) => {
  try {
    const response = await axiosInstance.get(`/projects/${projectId}/application-status`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching application status for project:", error);
    throw error;
  }
};

// Get lightweight list of all projects the student has applied to (just PIDs and statuses)
export const getMyAppliedProjects = async (token: string) => {
  try {
    const response = await axiosInstance.get("/applications/my/applied-projects", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching applied projects:", error);
    throw error;
  }
};

export type ApplicationData = {
  availability: string;
  motivation: string;
  priorProjects: string;
  cvLink: string;
  publicationsLink: string;
};

export const applyToProject = async (
  projectId: string,
  applicationData: ApplicationData,
  token: string
) => {
  try {
    const response = await axiosInstance.post(
      `/projects/${projectId}/apply`,
      applicationData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying to project:", error);
    throw error;
  }
};

export const retractApplication = async (
  projectId: string,
  token: string
) => {
  try {
    const response = await axiosInstance.delete(
      `/projects/${projectId}/retract`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error retracting application:", error);
    throw error;
  }
};

// Profile APIs
export type StudentProfile = {
  uid?: string;
  institution?: string;
  degree?: string;
  location?: string;
  dates?: string;
  workEx?: string;
  projects?: string[];
  platformProjects?: number[];
  skills?: string[];
  activities?: string[];
  resumeLink?: string;
  publicationsLink?: string;
  researchInterest?: string;
  intention?: string;
  // New detailed fields
  educationDetails?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  experienceDetails?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  publicationsList?: Array<{
    title: string;
    authors: string;
    journal?: string;
    date?: string;
    link?: string;
  }>;
  projectsDetails?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    link?: string;
  }>;
  summary?: string;
  personalInfo?: string; // JSON string containing phone, linkedin, github, etc.
  discoveryEnabled?: boolean; // Controls visibility in explore section
};

export const getStudentProfile = async (token: string) => {
  try {
    const response = await axiosInstance.get("/profile/student", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

export const updateStudentProfile = async (
  profileData: StudentProfile,
  token: string
) => {
  try {
    const response = await axiosInstance.put("/profile/student", profileData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating student profile:", error);
    throw error;
  }
};

// Get all applications for all professor's projects
export const getAllMyProjectApplications = async (token: string) => {
  try {
    const response = await axiosInstance.get("/applications/all", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all project applications:", error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (
  projectId: string,
  applicationId: number,
  status: string,
  token: string
) => {
  try {
    const response = await axiosInstance.put(
      `/projects/${projectId}/applications/${applicationId}`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Send feedback to student
export const sendApplicationFeedback = async (
  projectId: string,
  applicationId: number,
  feedback: string,
  token: string
) => {
  try {
    const response = await axiosInstance.post(
      `/projects/${projectId}/applications/${applicationId}/feedback`,
      { feedback },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending feedback:", error);
    throw error;
  }
};

// Schedule interview with student
export const scheduleInterview = async (
  projectId: string,
  applicationId: number,
  interviewData: {
    interviewDate: string;
    interviewTime: string;
    interviewDetails?: string;
  },
  token: string
) => {
  try {
    const response = await axiosInstance.post(
      `/projects/${projectId}/applications/${applicationId}/schedule-interview`,
      interviewData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error scheduling interview:", error);
    throw error;
  }
};

// Get past applicants (accepted/rejected) for a project
export const getPastApplicantsForProject = async (
  projectId: string,
  token: string
) => {
  try {
    const response = await axiosInstance.get(
      `/projects/${projectId}/past-applicants`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching past applicants:", error);
    throw error;
  }
};

// Roadmap APIs
export type ResearchPreferences = {
  field_of_study: string;
  experience_level: string;
  current_year: number;
  goals: string;
  time_commitment: number;
  interest_areas: string;
  prior_experience?: string;
};

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  resources: string[];
  skills: string[];
  next_nodes: string[];
};

export type RoadmapStructure = {
  title: string;
  description: string;
  total_time: string;
  nodes: RoadmapNode[];
};

export const savePreferences = async (
  preferences: ResearchPreferences,
  token: string
) => {
  try {
    console.log("API call - savePreferences payload:", preferences);
    const response = await axiosInstance.post("/roadmap/preferences", preferences, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

export const getPreferences = async (token: string) => {
  try {
    const response = await axiosInstance.get("/roadmap/preferences", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

export const generateRoadmap = async (token: string) => {
  try {
    const response = await axiosInstance.post(
      "/roadmap/generate",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const getRoadmapHistory = async (token: string) => {
  try {
    const response = await axiosInstance.get("/roadmap/history", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmap history:", error);
    throw error;
  }
};

// Placement Roadmap APIs
export type PlacementPreferences = {
  timeline_weeks: number;
  time_commitment: number;
  intensity_type: string; // regular, intense, weekend
  prep_areas: string; // JSON array
  current_levels: string; // JSON object
  resources_started?: string; // JSON array
  target_companies?: string; // JSON array
  special_needs?: string;
  goals: string;
};

export const savePlacementPreferences = async (
  preferences: PlacementPreferences,
  token: string
) => {
  try {
    const response = await axiosInstance.post("/roadmap/placement/preferences", preferences, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving placement preferences:", error);
    throw error;
  }
};

export const getPlacementPreferences = async (token: string) => {
  try {
    const response = await axiosInstance.get("/roadmap/placement/preferences", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching placement preferences:", error);
    throw error;
  }
};

export const generatePlacementRoadmap = async (token: string) => {
  try {
    const response = await axiosInstance.post(
      "/roadmap/placement/generate",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating placement roadmap:", error);
    throw error;
  }
};

// Get recommended projects for student
export type RecommendedProject = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  pid: string;
  sdesc: string;
  ldesc: string;
  tags: string[];
  creator: string;
  isActive: boolean;
  workingUsers: string[];
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
  user: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    uid: string;
    name: string;
    email: string;
    type: string;
  };
  match_score: number;
  match_reasons: string[];
};

export const getRecommendedProjects = async (token: string) => {
  try {
    const response = await axiosInstance.get("/profile/student/recommendations", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended projects:", error);
    throw error;
  }
};

// Get any user's profile by UID (public profile view)
export type UserProfileData = {
  uid: string;
  name: string;
  email: string;
  type: string;
  student?: {
    institution: string;
    degree: string;
    location: string;
    dates: string;
    experience: string;
    projects: string[];
    skills: string[];
    activities: string[];
    resumeLink: string;
    publicationsLink: string;
    researchInterest: string;
  };
};

export const getUserProfileByUID = async (uid: string, token: string) => {
  try {
    const response = await axiosInstance.get(`/profile/user/${uid}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Explore users
export type ExploreUserData = {
  uid: string;
  name: string;
  email: string;
  type: string;
  institution?: string;
  degree?: string;
  location?: string;
  skills?: string[];
  researchInterest?: string;
};

export const exploreUsers = async (
  token: string,
  filters?: { type?: string; search?: string }
) => {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);

    const response = await axiosInstance.get(
      `/profile/explore${params.toString() ? `?${params.toString()}` : ""}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
