"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  MessageSquare,
  Search,
  ThumbsDown,
  FileText,
  Users,
  Briefcase,
} from "lucide-react";
import Header from "@/components/ui/manual_navbar_prof";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import {
  getAllMyProjectApplications,
  updateApplicationStatus,
} from "@/api/api";
import { useToast } from "@/hooks/use-toast";

type ApplicationType = {
  id: number;
  uid: string;
  pid: string;
  name: string;
  email: string;
  timeCreated: string;
  status: string;
  availability: string;
  motivation: string;
  priorProjects: string;
  cvLink: string;
  publicationsLink: string;
  institution?: string;
  degree?: string;
  location?: string;
  dates?: string;
  workEx?: string;
  projects?: string[];
  skills?: string[];
  activities?: string[];
  resumeLink?: string;
  researchInterest?: string;
  intention?: string;
};

type ProjectType = {
  ID: number;
  name: string;
  pid: string;
  sdesc: string;
  ldesc: string;
  isActive: boolean;
  tags: string[];
  workingUsers: string[];
  creator: string;
};

type ProjectWithApplications = {
  project: ProjectType;
  applications: ApplicationType[];
  count: number;
};

export default function ProfessorApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationType | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [projectsWithApplications, setProjectsWithApplications] = useState<
    ProjectWithApplications[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // const [isAuth, setIsAuth] = useState(false);

  // replace fetchApplications with a stable useCallback so it can be added to useEffect deps
  const fetchApplications = useCallback(
    async (token: string) => {
      try {
        setIsLoading(true);
        const response = await getAllMyProjectApplications(token);
        setProjectsWithApplications(response.projects || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch applications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string };
    if (decoded.type !== "fac") {
      router.push("/login");
      return;
    }
    // setIsAuth(true);
    fetchApplications(token);
  }, [fetchApplications, router]);

  const updateStatus = async (
    projectId: string,
    applicationId: number,
    status: string
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await updateApplicationStatus(projectId, applicationId, status, token);

      // Update local state
      setProjectsWithApplications((prev) =>
        prev.map((project) => {
          if (project.project.pid === projectId) {
            return {
              ...project,
              applications: project.applications.map((app) =>
                app.id === applicationId ? { ...app, status } : app
              ),
            };
          }
          return project;
        })
      );

      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const sendFeedback = () => {
    if (!selectedApplication) return;
    // In a real application, you would send the feedback to the student
    console.log(
      `Sending feedback to ${selectedApplication.name}: ${feedbackText}`
    );
    toast({
      title: "Feedback Sent",
      description: `Feedback sent to ${selectedApplication.name}`,
    });
    setIsFeedbackDialogOpen(false);
    setFeedbackText("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_review":
        return <Badge variant="outline">Under Review</Badge>;
      case "interview":
        return <Badge variant="secondary">Interview Scheduled</Badge>;
      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "waitlisted":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Waitlisted
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Approved</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter applications based on active tab and search query
  const filteredProjects = projectsWithApplications
    .map((project) => {
      const filteredApps = (project.applications || []).filter((app) => {
        const matchesTab = activeTab === "all" || app.status === activeTab;
        const matchesSearch =
          searchQuery === "" ||
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.project.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      });

      return {
        ...project,
        applications: filteredApps,
        count: filteredApps.length,
      };
    })
    .filter((project) => project.count > 0);

  const totalApplications = projectsWithApplications.reduce(
    (sum, project) => sum + project.count,
    0
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage student applications for your research projects.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{totalApplications}</span>
              <span className="text-muted-foreground">Total Applications</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications or projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="waitlisted">Waitlisted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading applications...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((projectData) => (
              <Card key={projectData.project.pid} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {projectData.project.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">
                        {projectData.project.sdesc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.project.tags?.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {projectData.count} Application
                        {projectData.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {projectData.applications.map((application) => (
                      <div key={application.id} className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src="/placeholder.svg"
                                alt={application.name}
                              />
                              <AvatarFallback>
                                {application.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {application.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {application.email}
                              </p>
                              {application.institution && (
                                <p className="text-sm text-muted-foreground">
                                  {application.institution}
                                  {application.degree &&
                                    ` • ${application.degree}`}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Applied {formatDate(application.timeCreated)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:items-end">
                            <div>{getStatusBadge(application.status)}</div>
                            {application.skills &&
                              application.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-end">
                                  {application.skills
                                    .slice(0, 3)
                                    .map((skill, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  {application.skills.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{application.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedApplication(application);
                              setSelectedProject(projectData.project);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View Application
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setSelectedApplication(application);
                              setSelectedProject(projectData.project);
                              setIsFeedbackDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Send Feedback
                          </Button>
                          {application.cvLink && (
                            <a
                              href={application.cvLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View CV
                              </Button>
                            </a>
                          )}
                          {application.resumeLink && (
                            <a
                              href={application.resumeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Resume
                              </Button>
                            </a>
                          )}
                          {application.publicationsLink && (
                            <a
                              href={application.publicationsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Publications
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProjects.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No applications found
                </h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "You don't have any applications yet."
                    : `You don't have any ${activeTab.replace(
                        "_",
                        " "
                      )} applications.`}
                </p>
                <Link href="/professor/projects">
                  <Button>View My Projects</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* View Application Dialog */}
        {selectedApplication && selectedProject && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review the application from {selectedApplication.name} for the{" "}
                  {selectedProject.name} project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedApplication.name}
                    />
                    <AvatarFallback>
                      {selectedApplication.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedApplication.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.email}
                    </p>
                    {selectedApplication.institution && (
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.institution}
                        {selectedApplication.degree &&
                          ` • ${selectedApplication.degree}`}
                      </p>
                    )}
                  </div>
                </div>

                {selectedApplication.motivation && (
                  <div className="rounded-lg border p-4">
                    <div className="font-medium mb-2">Motivation</div>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplication.motivation}
                    </p>
                  </div>
                )}

                {selectedApplication.priorProjects && (
                  <div className="rounded-lg border p-4">
                    <div className="font-medium mb-2">Prior Projects</div>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplication.priorProjects}
                    </p>
                  </div>
                )}

                {selectedApplication.availability && (
                  <div className="rounded-lg border p-4">
                    <div className="font-medium mb-2">Availability</div>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedApplication.availability}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Application Date</div>
                    <div className="text-sm">
                      {formatDate(selectedApplication.timeCreated)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Status</div>
                    <div>{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  {selectedApplication.location && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Location</div>
                      <div className="text-sm">
                        {selectedApplication.location}
                      </div>
                    </div>
                  )}
                  {selectedApplication.workEx && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Work Experience</div>
                      <div className="text-sm">
                        {selectedApplication.workEx}
                      </div>
                    </div>
                  )}
                </div>

                {selectedApplication.skills &&
                  selectedApplication.skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedApplication.researchInterest && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Research Interest</div>
                    <div className="text-sm whitespace-pre-wrap">
                      {selectedApplication.researchInterest}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedApplication.cvLink && (
                    <a
                      href={selectedApplication.cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View CV
                      </Button>
                    </a>
                  )}
                  {selectedApplication.resumeLink && (
                    <a
                      href={selectedApplication.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resume
                      </Button>
                    </a>
                  )}
                  {selectedApplication.publicationsLink && (
                    <a
                      href={selectedApplication.publicationsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Publications
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  {selectedApplication.status !== "rejected" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateStatus(
                          selectedProject.pid,
                          selectedApplication.id,
                          "rejected"
                        )
                      }
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  {selectedApplication.status === "under_review" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateStatus(
                            selectedProject.pid,
                            selectedApplication.id,
                            "waitlisted"
                          )
                        }
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Waitlist
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateStatus(
                            selectedProject.pid,
                            selectedApplication.id,
                            "interview"
                          )
                        }
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </>
                  )}
                  {(selectedApplication.status === "under_review" ||
                    selectedApplication.status === "interview" ||
                    selectedApplication.status === "waitlisted") && (
                    <Button
                      onClick={() =>
                        updateStatus(
                          selectedProject.pid,
                          selectedApplication.id,
                          "accepted"
                        )
                      }
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Feedback Dialog */}
        {selectedApplication && selectedProject && (
          <Dialog
            open={isFeedbackDialogOpen}
            onOpenChange={setIsFeedbackDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  Send feedback to {selectedApplication.name} regarding their
                  application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedApplication.name}
                    />
                    <AvatarFallback>
                      {selectedApplication.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedApplication.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Application for {selectedProject.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="feedback" className="text-sm font-medium">
                    Feedback Message
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Write your feedback here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Message Template
                  </label>
                  <Select
                    onValueChange={(value) => {
                      if (!selectedApplication) return;
                      if (value === "accepted") {
                        setFeedbackText(
                          `Dear ${selectedApplication.name},\n\nI am pleased to inform you that your application for the "${selectedProject.name}" project has been accepted. Your qualifications and experience make you an excellent fit for this research opportunity.\n\nPlease let me know your availability for an onboarding meeting next week.\n\nBest regards`
                        );
                      } else if (value === "interview") {
                        setFeedbackText(
                          `Dear ${selectedApplication.name},\n\nThank you for your application to the "${selectedProject.name}" project. I would like to schedule an interview to discuss your application further.\n\nAre you available for a 30-minute meeting on Monday or Tuesday next week?\n\nBest regards`
                        );
                      } else if (value === "rejected") {
                        setFeedbackText(
                          `Dear ${selectedApplication.name},\n\nThank you for your interest in the "${selectedProject.name}" project. After careful consideration, I regret to inform you that we are unable to offer you a position at this time.\n\nI encourage you to apply for future research opportunities that match your interests and qualifications.\n\nBest regards`
                        );
                      } else if (value === "more-info") {
                        setFeedbackText(
                          `Dear ${selectedApplication.name},\n\nThank you for your application to the "${selectedProject.name}" project. I would like to request some additional information about your experience with [specific skill/technology].\n\nCould you please provide more details about your previous work in this area?\n\nBest regards`
                        );
                      } else if (value === "waitlisted") {
                        setFeedbackText(
                          `Dear ${selectedApplication.name},\n\nThank you for your application to the "${selectedProject.name}" project. Your qualifications are impressive, and we would like to keep your application on our waitlist.\n\nWe will contact you if a position becomes available.\n\nBest regards`
                        );
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accepted">
                        Acceptance Message
                      </SelectItem>
                      <SelectItem value="interview">
                        Interview Request
                      </SelectItem>
                      <SelectItem value="waitlisted">
                        Waitlist Message
                      </SelectItem>
                      <SelectItem value="rejected">
                        Rejection Message
                      </SelectItem>
                      <SelectItem value="more-info">
                        Request More Information
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsFeedbackDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={sendFeedback}>Send Feedback</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
