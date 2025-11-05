"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProjectByPid, updateProjectByPid, getMyApplicationStatusForProject, getProjectWorkingUsers, removeWorkingUser, retractApplication } from "@/api/api";
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
  UserMinus,
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
  const [removeUserConfirm, setRemoveUserConfirm] = useState<{ show: boolean; user: WorkingUserType | null }>({ show: false, user: null });
  const [removingUser, setRemovingUser] = useState(false);
  const [showExtendDeadlineModal, setShowExtendDeadlineModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");
  const [extendingDeadline, setExtendingDeadline] = useState(false);
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);
  const [showRetractConfirm, setShowRetractConfirm] = useState(false);
  const [retractingApplication, setRetractingApplication] = useState(false);

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

  const handleRemoveUser = async () => {
    if (!removeUserConfirm.user) return;
    
    setRemovingUser(true);
    try {
      const token = localStorage.getItem("token") || "";
      await removeWorkingUser(pid, removeUserConfirm.user.uid, token);
      
      toast({
        title: "Success!",
        description: `${removeUserConfirm.user.name} has been removed from the project.`,
      });
      
      // Refresh the working users list
      await fetchWorkingUsers();
      setRemoveUserConfirm({ show: false, user: null });
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from the project.",
        variant: "destructive",
      });
    } finally {
      setRemovingUser(false);
    }
  };

  const handleExtendDeadlineClick = () => {
    if (!newDeadline) {
      toast({
        title: "Error",
        description: "Please select a new deadline.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(newDeadline);
    const currentDeadline = project?.deadline ? new Date(project.deadline) : new Date();
    
    if (selectedDate <= currentDeadline) {
      toast({
        title: "Error",
        description: "New deadline must be after the current deadline.",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowExtendConfirm(true);
  };

  const handleExtendDeadline = async () => {
    setExtendingDeadline(true);
    try {
      const token = localStorage.getItem("token") || "";
      await updateProjectByPid(pid, { deadline: newDeadline } as any, token);
      
      toast({
        title: "Success!",
        description: "Project deadline has been extended.",
      });
      
      await fetchProject();
      setShowExtendDeadlineModal(false);
      setShowExtendConfirm(false);
      setNewDeadline("");
    } catch (error) {
      console.error("Error extending deadline:", error);
      toast({
        title: "Error",
        description: "Failed to extend deadline.",
        variant: "destructive",
      });
    } finally {
      setExtendingDeadline(false);
    }
  };

  const handleRetractApplication = async () => {
    setRetractingApplication(true);
    try {
      const token = localStorage.getItem("token") || "";
      await retractApplication(pid, token);
      
      toast({
        title: "Success!",
        description: "Your application has been retracted successfully.",
      });
      
      // Refresh application status
      setMyApplication(null);
      setShowRetractConfirm(false);
    } catch (error: any) {
      console.error("Error retracting application:", error);
      const errorMessage = error.response?.data?.error || "Failed to retract application.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRetractingApplication(false);
    }
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
                {/* Show PID for students, Set Inactive button for professors */}
                {isStudent ? (
                  <span className="text-xs text-black/60 font-mono">
                    PID: {project.pid}
                  </span>
                ) : (
                  <>
                    {project.isActive === true ? (
                      <Button
                        onClick={() => setShowInactiveConfirm(true)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-800 text-white hover:bg-red-900"
                      >
                        Set Inactive
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowActiveConfirm(true)}
                        disabled={updating}
                        variant="default"
                        size="sm"
                        className="bg-black text-white hover:bg-black/80"
                      >
                        {updating ? "Updating..." : "Set Active"}
                      </Button>
                    )}
                  </>
                )}
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

            {/* Project Details Section - Moved up */}
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
                      <div className="text-sm font-medium text-black/60 mb-2">
                        Application Deadline
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="destructive"
                          className="bg-red-800 text-white"
                        >
                          {new Date(project.deadline).toLocaleDateString()}
                        </Badge>
                        {!isStudent && (
                          <Button
                            onClick={() => setShowExtendDeadlineModal(true)}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-black text-black hover:bg-black hover:text-white flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Extend Deadline
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
          </div>

          {/* Sidebar: Professor Info & Application Status */}
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

            {/* Accepted Students Section - Moved to sidebar for professors */}
            {!isStudent && workingUsers.length > 0 && (
              <div className="rounded-xl bg-white shadow border border-black/10 p-6">
                <h2 className="text-lg font-semibold mb-4 text-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-black" />
                  Accepted Students ({workingUsers.length})
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {workingUsers.map((user) => (
                    <div
                      key={user.uid}
                      className="p-3 border border-black/10 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-black/60" />
                            <h3 className="font-semibold text-sm text-black">
                              {user.name}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setRemoveUserConfirm({ show: true, user })}
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-black/70">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.institution && (
                          <div className="text-xs text-black/70">
                            <strong>Institution:</strong> {user.institution}
                            {user.degree && ` • ${user.degree}`}
                          </div>
                        )}
                        {user.location && (
                          <div className="text-xs text-black/70">
                            <strong>Location:</strong> {user.location}
                          </div>
                        )}
                        {user.researchInterest && (
                          <div className="text-xs text-black/70">
                            <strong>Research:</strong> {user.researchInterest}
                          </div>
                        )}
                        {user.skills && user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.skills.slice(0, 3).map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] py-0 px-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {user.skills.length > 3 && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1">
                                +{user.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        {user.resumeLink && (
                          <a
                            href={user.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full flex items-center justify-center gap-1 h-8 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Resume
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Status Section - For students */}
            {isStudent && myApplication && (
              <div className="rounded-xl bg-white shadow border border-black/10 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                  <Info className="h-5 w-5 text-black" />
                  Application Status
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
                  <div className="flex flex-col gap-1 pb-3 border-b">
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
                      <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                        Interview Scheduled
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Calendar className="h-3 w-3" />
                          <span><strong>Date:</strong> {myApplication.interviewDate}</span>
                        </div>
                        {myApplication.interviewTime && (
                          <div className="flex items-center gap-2 text-blue-800">
                            <Clock className="h-3 w-3" />
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
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800">
                        🎉 Your application has been accepted. The professor will contact you with next steps.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "approved" && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800">
                        ✅ Your application has been approved! You'll receive further details soon.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "under_review" && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-800">
                        ⏳ Your application is under review. The professor will update you soon.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "waitlisted" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        🕐 You've been waitlisted. We'll notify you if a position becomes available.
                      </p>
                    </div>
                  )}
                  {myApplication.status === "rejected" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-800">
                        Your application was not accepted this time. Keep exploring other opportunities!
                      </p>
                    </div>
                  )}

                  {/* Retract Application Button - Only show for non-accepted/approved applications */}
                  {myApplication.status !== "accepted" && myApplication.status !== "approved" && (
                    <div className="mt-4 pt-4 border-t border-black/10">
                      <Button
                        onClick={() => setShowRetractConfirm(true)}
                        variant="outline"
                        size="sm"
                        className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Retract Application
                      </Button>
                      <p className="text-xs text-black/60 text-center mt-2">
                        Withdraw your application from this project
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

        {/* Remove User Confirmation Dialog */}
        {removeUserConfirm.show && removeUserConfirm.user && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-red-800 bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in max-w-md">
              <AlertTriangle className="h-6 w-6 text-red-800 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-1">
                  Remove Student
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to remove <strong>{removeUserConfirm.user.name}</strong> from this project? 
                  This will update their application status to rejected and they will no longer be listed as an accepted student.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setRemoveUserConfirm({ show: false, user: null })}
                    disabled={removingUser}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-800 text-white hover:bg-red-900"
                    onClick={handleRemoveUser}
                    disabled={removingUser}
                  >
                    {removingUser ? "Removing..." : "Remove Student"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extend Deadline Modal */}
        {showExtendDeadlineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg border border-black/10 bg-white px-8 py-6 shadow-xl max-w-md w-full mx-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-black" />
                <h2 className="text-xl font-semibold text-black">
                  Extend Application Deadline
                </h2>
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium text-black/70 mb-2 block">
                  Current Deadline: {project?.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}
                </label>
                <label className="text-sm font-medium text-black/70 mb-2 block">
                  New Deadline
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  min={project?.deadline || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-black/60 mt-2">
                  The new deadline must be after the current deadline.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-black text-black"
                  onClick={() => {
                    setShowExtendDeadlineModal(false);
                    setNewDeadline("");
                  }}
                  disabled={extendingDeadline}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-black text-white hover:bg-black/80"
                  onClick={handleExtendDeadlineClick}
                  disabled={extendingDeadline || !newDeadline}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Extend Deadline Confirmation Dialog */}
        {showExtendConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-black bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in max-w-md">
              <AlertTriangle className="h-6 w-6 text-black flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-black mb-1">
                  Confirm Deadline Extension
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to extend the deadline from <strong>{project?.deadline ? new Date(project.deadline).toLocaleDateString() : "current date"}</strong> to <strong>{new Date(newDeadline).toLocaleDateString()}</strong>? This will allow students more time to apply.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowExtendConfirm(false)}
                    disabled={extendingDeadline}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-black text-white hover:bg-black/80"
                    onClick={handleExtendDeadline}
                    disabled={extendingDeadline}
                  >
                    {extendingDeadline ? "Extending..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retract Application Confirmation Dialog */}
        {showRetractConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-red-800 bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in max-w-md">
              <AlertTriangle className="h-6 w-6 text-red-800 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-1">
                  Retract Application
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to retract your application for <strong>{project?.name}</strong>? This action cannot be undone, and you will need to reapply if you change your mind.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowRetractConfirm(false)}
                    disabled={retractingApplication}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-800 text-white hover:bg-red-900"
                    onClick={handleRetractApplication}
                    disabled={retractingApplication}
                  >
                    {retractingApplication ? "Retracting..." : "Retract Application"}
                  </Button>
                </div>
              </div>
            </div>
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
