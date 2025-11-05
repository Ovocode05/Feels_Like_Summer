"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProjectByPid, updateProjectByPid, getMyApplicationStatusForProject, getProjectWorkingUsers } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  User2,
  BookOpen,
  ChevronLeft,
  FileText,
  LogOut,
  Clock,
  Calendar,
  Info,
  Users,
  ExternalLink,
  History,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { ApplyModal } from "@/components/apply-modal";
import { useToast } from "@/hooks/use-toast";

type ProjectType = {
  ID: number;
  pid: string;
  name: string;
  sdesc: string; // alternative short description field
  ldesc: string; // alternative long description field
  tags: string[];
  isActive: boolean;
  uid: string;
  user: {
    name: string;
    email: string;
    type: string;
    ID: number;
  };
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

type ApplicationType = {
  ID: number;
  status: string;
  time_created: string;
  availability: string;
  motivation: string;
  priorProjects: string;
  cvLink: string;
  publicationsLink: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDetails?: string;
};

type WorkingUserType = {
  uid: string;
  name: string;
  email: string;
  institution?: string;
  degree?: string;
  location?: string;
  skills?: string[];
  researchInterest?: string;
  resumeLink?: string;
};

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const [showActiveConfirm, setShowActiveConfirm] = useState(false); // NEW
  const [showUpdatedPopup, setShowUpdatedPopup] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [myApplication, setMyApplication] = useState<ApplicationType | null>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [workingUsers, setWorkingUsers] = useState<WorkingUserType[]>([]);
  const [workingUsersLoading, setWorkingUsersLoading] = useState(false);

  const pid = params?.id as string;

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const data = await getProjectByPid(pid, token);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [pid]);

  const fetchMyApplication = useCallback(async () => {
    if (!isStudent) return;
    setApplicationLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await getMyApplicationStatusForProject(pid, token);
      
      if (response.hasApplied && response.application) {
        setMyApplication(response.application);
      } else {
        setMyApplication(null);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      setMyApplication(null);
    } finally {
      setApplicationLoading(false);
    }
  }, [pid, isStudent]);

  const fetchWorkingUsers = useCallback(async () => {
    if (isStudent) return; // Only fetch for professors
    setWorkingUsersLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await getProjectWorkingUsers(pid, token);
      setWorkingUsers(response.workingUsers || []);
    } catch (error) {
      console.error("Error fetching working users:", error);
      setWorkingUsers([]);
    } finally {
      setWorkingUsersLoading(false);
    }
  }, [pid, isStudent]);

  useEffect(() => {
    if (pid) fetchProject();
  }, [pid, fetchProject]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: "fac" | "stu" };
    if (decoded.type === "stu") {
      setIsStudent(true);
    } else {
      setIsStudent(false);
    }
    setIsAuth(true);
  }, [router]);

  useEffect(() => {
    if (isAuth && isStudent && pid) {
      fetchMyApplication();
    }
  }, [isAuth, isStudent, pid, fetchMyApplication]);

  useEffect(() => {
    if (isAuth && !isStudent && pid) {
      fetchWorkingUsers();
    }
  }, [isAuth, isStudent, pid, fetchWorkingUsers]);

  if (!isAuth) {
    return null;
  }

  // Handle update active status
  const handleUpdateActive = async () => {
    if (!project) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token") || "";
      await updateProjectByPid(pid, { isActive: !project.isActive }, token);
      setShowUpdatedPopup(true);
      await fetchProject();
      setTimeout(() => setShowUpdatedPopup(false), 2000);
    } catch (error) {
      // Optionally show error
      console.error("Error updating project status:", error);
    }
    setUpdating(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleApplicationSuccess = () => {
    toast({
      title: "Success!",
      description: "Your application has been submitted successfully.",
    });
    // Refresh the application status
    fetchMyApplication();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "approved":
        return "bg-green-600 text-white hover:bg-green-700";
      case "rejected":
        return "bg-red-600 text-white hover:bg-red-700";
      case "interview":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "waitlisted":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "under_review":
      default:
        return "bg-gray-600 text-white hover:bg-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "interview":
        return "Interview Scheduled";
      case "waitlisted":
        return "Waitlisted";
      case "under_review":
        return "Under Review";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-50 flex h-16 justify-between gap-4 border-b border-black/10 bg-white px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-black" />
          <span className="text-xl font-bold text-black">FLS</span>
        </Link>
        <div className="ml-2">
          <Button
            variant="outline"
            className="flex mt-4 items-center gap-2 text-black border-black"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 text-black/60 hover:text-black"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Project Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl bg-white shadow-lg border border-black/10 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  {project.name}
                  <Badge
                    className={
                      project.isActive === true
                        ? "bg-black text-white"
                        : "bg-white border border-black text-black"
                    }
                  >
                    {project.isActive === true ? "Active" : "Inactive"}
                  </Badge>
                  {myApplication && (
                    <Badge className={getStatusBadgeColor(myApplication.status)}>
                      ✓ Applied
                    </Badge>
                  )}
                </h1>
                <span className="text-xs text-black/60 font-mono">
                  PID: {project.pid}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* If you have tags, display here */}
                {project.tags?.map((tag: string, idx: number) => (
                  <Badge
                    key={tag + idx}
                    className="bg-black/90 text-white border border-black"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-black" />
                Short Description
              </h2>
              <p className="mb-6 text-base text-black/80">{project.sdesc}</p>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-black" />
                Long Description
              </h2>
              <p className="text-base text-black/80">{project.ldesc}</p>
            </div>

            {/* Application Status Section - Only for students who have applied */}
            {isStudent && myApplication && (
              <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-black">
                  <Info className="h-5 w-5 text-black" />
                  Your Application Status
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-sm font-medium text-black/70">
                      Status
                    </span>
                    <Badge className={getStatusBadgeColor(myApplication.status)}>
                      {getStatusLabel(myApplication.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-sm font-medium text-black/70">
                      Applied On
                    </span>
                    <span className="text-sm text-black flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(myApplication.time_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Interview Details if available */}
                  {myApplication.status === "interview" && myApplication.interviewDate && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Interview Scheduled
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Calendar className="h-4 w-4" />
                          <span><strong>Date:</strong> {myApplication.interviewDate}</span>
                        </div>
                        {myApplication.interviewTime && (
                          <div className="flex items-center gap-2 text-blue-800">
                            <Clock className="h-4 w-4" />
                            <span><strong>Time:</strong> {myApplication.interviewTime}</span>
                          </div>
                        )}
                        {myApplication.interviewDetails && (
                          <div className="mt-2 text-blue-800">
                            <strong>Details:</strong>
                            <p className="mt-1">{myApplication.interviewDetails}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status-specific messages */}
                  {myApplication.status === "accepted" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        🎉 Congratulations! Your application has been accepted. The professor will contact you with next steps.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "approved" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Your application has been approved! You'll receive further details soon.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "under_review" && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-800">
                        ⏳ Your application is currently under review. The professor will update you soon.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "waitlisted" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        🕐 You've been waitlisted for this project. We'll notify you if a position becomes available.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "rejected" && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        Unfortunately, your application was not accepted this time. Keep exploring other opportunities!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Details Section */}
            {(project.fieldOfStudy ||
              project.specialization ||
              project.duration ||
              (project.positionType && project.positionType.length > 0) ||
              project.deadline) && (
              <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Project Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.fieldOfStudy && (
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-1">
                        Field of Study
                      </div>
                      <Badge className="bg-black text-white">
                        {project.fieldOfStudy}
                      </Badge>
                    </div>
                  )}
                  {project.specialization && (
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-1">
                        Specialization
                      </div>
                      <Badge className="bg-black text-white">
                        {project.specialization}
                      </Badge>
                    </div>
                  )}
                  {project.duration && (
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-1">
                        Duration
                      </div>
                      <Badge className="bg-black text-white">
                        {project.duration}
                      </Badge>
                    </div>
                  )}
                  {project.positionType && project.positionType.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-1">
                        Position Type
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.positionType.map(
                          (type: string, idx: number) => (
                            <Badge
                              key={type + idx}
                              className="bg-black text-white"
                            >
                              {type}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {project.deadline && (
                    <div>
                      <div className="text-sm font-medium text-black/60 mb-1">
                        Application Deadline
                      </div>
                      <Badge
                        variant="destructive"
                        className="bg-red-800 text-white"
                      >
                        {new Date(project.deadline).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Past Applicants Button for Professors */}
            {!isStudent && (
              <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-black flex items-center gap-2">
                      <History className="h-5 w-5 text-black" />
                      Application History
                    </h2>
                    <p className="text-sm text-black/60 mt-1">
                      View past applicants who were accepted or rejected
                    </p>
                  </div>
                  <Link href={`/professor/project/${project.pid}/past-applicants`}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white"
                    >
                      <History className="h-4 w-4" />
                      View Past Applicants
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Accepted Students Section - Only for Professors */}
            {!isStudent && workingUsers.length > 0 && (
              <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
                <h2 className="text-xl font-semibold mb-4 text-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-black" />
                  Accepted Students ({workingUsers.length})
                </h2>
                <div className="space-y-4">
                  {workingUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="p-4 border border-black/10 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User2 className="h-5 w-5 text-black/60" />
                            <h3 className="font-semibold text-black">
                              {user.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-black/70 mb-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.institution && (
                            <div className="text-sm text-black/70 mb-1">
                              <strong>Institution:</strong> {user.institution}
                              {user.degree && ` • ${user.degree}`}
                            </div>
                          )}
                          {user.location && (
                            <div className="text-sm text-black/70 mb-1">
                              <strong>Location:</strong> {user.location}
                            </div>
                          )}
                          {user.researchInterest && (
                            <div className="text-sm text-black/70 mb-2">
                              <strong>Research Interest:</strong>{" "}
                              {user.researchInterest}
                            </div>
                          )}
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.skills.slice(0, 5).map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {user.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {user.resumeLink && (
                          <a
                            href={user.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Resume
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Professor Info */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white shadow border border-black/10 p-6 flex flex-col items-center">
              <User2 className="h-12 w-12 text-black mb-2" />
              <div className="text-lg font-semibold mb-1 text-black">
                {project.user?.name || "Unknown Professor"}
              </div>
              <div className="flex items-center gap-2 text-black/70 mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{project.user?.email}</span>
              </div>
              <Badge className="bg-black text-white">
                {project.user?.type === "fac" ? "Faculty" : "User"}
              </Badge>
            </div>

            {/* Apply Button for Students */}
            {isStudent && project.isActive && !myApplication && (
              <div className="rounded-xl bg-white shadow border border-black/10 p-6">
                <Button
                  onClick={() => setApplyModalOpen(true)}
                  className="w-full bg-black text-white hover:bg-black/80"
                  size="lg"
                >
                  Apply to This Project
                </Button>
                <p className="text-xs text-black/60 text-center mt-3">
                  Submit your application and profile information
                </p>
              </div>
            )}

            {isStudent && project.isActive && myApplication && (
              <div className="rounded-xl bg-white shadow border border-black/10 p-6">
                <Button
                  disabled
                  className="w-full bg-gray-400 text-white cursor-not-allowed"
                  size="lg"
                >
                  Already Applied
                </Button>
                <p className="text-xs text-black/60 text-center mt-3">
                  Your application is {getStatusLabel(myApplication.status).toLowerCase()}
                </p>
              </div>
            )}

            {isStudent && !project.isActive && (
              <div className="rounded-xl bg-white shadow border border-black/10 p-6">
                <Button disabled className="w-full" size="lg" variant="outline">
                  Project Inactive
                </Button>
                <p className="text-xs text-black/60 text-center mt-3">
                  This project is not accepting applications
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          {!isStudent && (
            <>
              {project.isActive === true ? (
                <Button
                  onClick={() => setShowInactiveConfirm(true)}
                  // disabled={updating || isStudent}
                  variant="destructive"
                  className="bg-red-800 text-white px-8 py-2 rounded-lg shadow hover:bg-red-900"
                >
                  Set Inactive
                </Button>
              ) : (
                <Button
                  onClick={() => setShowActiveConfirm(true)}
                  disabled={updating || isStudent}
                  variant="default"
                  className="bg-black text-white px-8 py-2 rounded-lg shadow hover:bg-black/80"
                >
                  {updating ? "Updating..." : "Set Active"}
                </Button>
              )}
            </>
          )}
        </div>

        {showAuthPopup && (
          <div className="fixed right-8 bottom-8 z-50 flex items-center gap-3 rounded-lg border border-yellow-500 bg-yellow-50 px-6 py-3 text-yellow-900 shadow-xl animate-fade-in">
            <AlertTriangle className="h-6 w-6 text-yellow-900" />
            <span className="font-semibold">
              You are not authenticated to perform this action.
            </span>
            <button
              className="ml-2 text-yellow-900 hover:text-yellow-600"
              onClick={() => setShowAuthPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        {/* Inactive Confirmation Pop-up (side/end) */}
        {showInactiveConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-red-800 bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in">
              <AlertTriangle className="h-6 w-6 text-red-800" />
              <div>
                <div className="font-semibold text-red-800 mb-1">
                  Confirm Inactivation
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to set this project as inactive? This
                  will prevent new applications.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowInactiveConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-800 text-white"
                    onClick={async () => {
                      setShowInactiveConfirm(false);
                      await handleUpdateActive();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Active Confirmation Pop-up (side/end) */}
        {showActiveConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-black bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in">
              <AlertTriangle className="h-6 w-6 text-black" />
              <div>
                <div className="font-semibold text-black mb-1">
                  Confirm Activation
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to set this project as active? This will
                  allow new applications.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowActiveConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-black text-white"
                    onClick={async () => {
                      setShowActiveConfirm(false);
                      await handleUpdateActive();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Updated Popup */}
        {showUpdatedPopup && (
          <div className="fixed right-8 bottom-24 z-50 flex items-center gap-3 rounded-lg border border-black bg-white px-6 py-3 text-black shadow-xl animate-fade-in">
            <CheckCircle2 className="h-6 w-6 text-black" />
            <span className="font-semibold">Project status updated.</span>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {project && (
        <ApplyModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          projectId={project.pid}
          projectName={project.name}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}
