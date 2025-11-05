"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { getMyApplications } from "@/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MenubarStudent from "@/components/ui/menubar_student";
import {
  Clock,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Hourglass,
  Video,
} from "lucide-react";

interface Application {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  time_created: string;
  status: string;
  uid: string;
  pid: string;
  availability?: string;
  motivation?: string;
  prior_projects?: string;
  cv_link?: string;
  publications_link?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDetails?: string;
  Project: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    project_name: string;
    project_id: string;
    short_desc: string;
    long_desc: string;
    tags: string[];
    creator_id: string;
    is_active: boolean;
    working_users: string[];
    field_of_study?: string;
    specialization?: string;
    duration?: string;
    position_type?: string[];
    deadline?: string;
  };
  User: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    uid: string;
    name: string;
    email: string;
    type: string;
  };
}

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  type: string;
  iat: number;
  exp: number;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [decode, setDecode] = useState<DecodedToken | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token") || "";
    if (!token) return;
    try {
      setDecode(jwtDecode(token) as DecodedToken);
    } catch (e) {
      console.error("Invalid token decode", e);
      setDecode(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string };
    if (decoded.type !== "stu") {
      router.push("/login");
      return;
    }
    setIsAuth(true);

    const fetchApplications = async () => {
      try {
        const response = await getMyApplications(token);
        setApplications(response.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return "default";
      case "interview":
        return "default";
      case "under_review":
        return "secondary";
      case "rejected":
        return "destructive";
      case "waitlisted":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return "bg-green-600 hover:bg-green-700 text-white border-green-600";
      case "interview":
        return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600";
      case "under_review":
        return "bg-white hover:bg-gray-50 text-black border-black";
      case "rejected":
        return "bg-red-600 hover:bg-red-700 text-white border-red-600";
      case "waitlisted":
        return "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600";
      default:
        return "bg-muted hover:bg-muted/80 border-muted";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "interview":
        return "Interview Scheduled";
      case "waitlisted":
        return "Waitlisted";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "interview":
        return <Video className="h-5 w-5 text-blue-600" />;
      case "under_review":
        return <Hourglass className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "waitlisted":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              My Applications
            </h1>
            <p className="text-muted-foreground mt-2">
              Track the status of all your research project applications.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) => app.status.toLowerCase() === "under_review"
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) => app.status.toLowerCase() === "interview"
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) =>
                      app.status.toLowerCase() === "accepted" ||
                      app.status.toLowerCase() === "approved"
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Applications Yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                You haven&apos;t applied to any projects yet. Start exploring
                projects and submit your applications.
              </p>
              <Link href="/student/projects">
                <Button>Explore Projects</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4">
              {applications.map((application) => (
                <Card
                  key={application.ID}
                  className="hover:shadow-lg transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {application.User?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">
                            {application.Project?.project_name ||
                              "Unknown Project"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {application.User?.name || "Unknown Professor"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusIcon(application.status)}
                        <Badge
                          className={`whitespace-nowrap ${getStatusBadgeClass(application.status)}`}
                        >
                          {getStatusDisplay(application.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {application.Project?.short_desc || "No description"}
                    </p>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Submitted
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(application.time_created)}
                          </p>
                        </div>
                      </div>
                      {application.Project?.field_of_study && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Field
                            </p>
                            <p className="text-sm font-medium">
                              {application.Project.field_of_study}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.Project?.duration && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Duration
                            </p>
                            <p className="text-sm font-medium">
                              {application.Project.duration}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interview Information */}
                    {application.status === "interview" &&
                      (application.interviewDate ||
                        application.interviewTime) && (
                        <div className="p-3 rounded-md border bg-muted/50">
                          <p className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Video className="h-4 w-4" />
                            Interview Scheduled
                          </p>
                          <div className="space-y-1">
                            {application.interviewDate && (
                              <p className="text-sm text-muted-foreground">
                                📅 {application.interviewDate}
                              </p>
                            )}
                            {application.interviewTime && (
                              <p className="text-sm text-muted-foreground">
                                🕐 {application.interviewTime}
                              </p>
                            )}
                            {application.interviewDetails && (
                              <p className="text-sm mt-2">
                                {application.interviewDetails}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Tags */}
                    {application.Project?.tags &&
                      application.Project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {application.Project.tags.slice(0, 5).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {application.Project.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.Project.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                    {/* Action Button */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/project/${application.pid}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          View Project Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
