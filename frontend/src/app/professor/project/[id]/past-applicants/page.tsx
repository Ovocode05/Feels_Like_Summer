"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  ChevronLeft,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  History,
  Search,
  Users,
} from "lucide-react";
import Header from "@/components/ui/manual_navbar_prof";
import { jwtDecode } from "jwt-decode";
import { getPastApplicantsForProject } from "@/api/api";
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
  interviewDate?: string;
  interviewTime?: string;
  interviewDetails?: string;
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
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

export default function PastApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "accepted" | "rejected">("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationType | null>(null);
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const pid = params?.id as string;

  const fetchPastApplicants = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token") || "";
      const response = await getPastApplicantsForProject(pid, token);
      setProject(response.project);
      setApplications(response.applications || []);
    } catch (error) {
      console.error("Error fetching past applicants:", error);
      toast({
        title: "Error",
        description: "Failed to fetch past applicants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pid, toast]);

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
    fetchPastApplicants();
  }, [fetchPastApplicants, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
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
  const filteredApplications = applications.filter((app) => {
    const matchesTab = 
      activeTab === "all" || 
      app.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const acceptedCount = applications.filter((app) => app.status === "accepted").length;
  const rejectedCount = applications.filter((app) => app.status === "rejected").length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            className="inline-flex items-center gap-1 text-black/60 hover:text-black"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8" />
              Past Applicants
            </h1>
            {project && (
              <p className="text-muted-foreground mt-1">
                Application history for <span className="font-semibold">{project.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{applications.length}</span>
              <span className="text-muted-foreground">Total</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <Badge className="bg-green-500 text-white">{acceptedCount}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedCount} Students</div>
              <p className="text-xs text-muted-foreground">
                Successfully accepted to the project
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <Badge variant="destructive">{rejectedCount}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount} Students</div>
              <p className="text-xs text-muted-foreground">
                Applications that were not accepted
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applicants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "accepted" | "rejected")}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading past applicants...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-6">
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
                        <h3 className="font-medium">{application.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.email}
                        </p>
                        {application.institution && (
                          <p className="text-sm text-muted-foreground">
                            {application.institution}
                            {application.degree && ` • ${application.degree}`}
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
                      {application.skills && application.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {application.skills.slice(0, 3).map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {application.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
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
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
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
                </CardContent>
              </Card>
            ))}

            {filteredApplications.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No past applicants found
                </h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "No accepted or rejected applications yet."
                    : `No ${activeTab} applications yet.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* View Application Dialog */}
        {selectedApplication && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Reviewing past application from {selectedApplication.name}
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
                    <div className="font-medium mb-3">
                      Education, Experience & Projects
                    </div>
                    {(() => {
                      const parts = selectedApplication.priorProjects.split(/===\s+([^=]+)\s+===/);
                      const sections: { title: string; content: string }[] = [];
                      
                      for (let i = 1; i < parts.length; i += 2) {
                        const title = parts[i].trim();
                        const content = parts[i + 1] ? parts[i + 1].trim() : '';
                        if (title && content) {
                          sections.push({ title, content });
                        }
                      }
                      
                      if (sections.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            No additional information provided
                          </p>
                        );
                      }
                      
                      return (
                        <Accordion 
                          type="multiple" 
                          className="w-full" 
                          defaultValue={sections.map((_, idx) => `section-${idx}`)}
                        >
                          {sections.map((section, idx) => (
                            <AccordionItem key={idx} value={`section-${idx}`} className="border-b last:border-b-0">
                              <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline py-3">
                                {section.title}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pl-4 border-l-2 border-muted pt-2 pb-3 text-sm whitespace-pre-wrap">
                                  {section.content}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      );
                    })()}
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

                {selectedApplication.skills && selectedApplication.skills.length > 0 && (
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
              <DialogFooter>
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
      </main>
    </div>
  );
}
