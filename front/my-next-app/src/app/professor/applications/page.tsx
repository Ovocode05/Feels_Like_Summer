"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Download,
  ExternalLink,
  Eye,
  Filter,
  GraduationCap,
  MessageSquare,
  Search,
  ThumbsDown,
  FileText,
} from "lucide-react";
import Header from "@/components/ui/manual_navbar_prof";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type ApplicationType = {
  id: number;
  student: {
    id: number;
    name: string;
    avatar: string;
    university: string;
    major: string;
    year: string;
    gpa: string;
  };
  project: {
    id: number;
    title: string;
    field: string;
    specialization: string;
  };
  date: string;
  status: string;
  coverLetter: string;
  cv: string;
};

export default function ProfessorApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [applications, setApplications] = useState<ApplicationType[]>([
    {
      id: 1,
      student: {
        id: 1,
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "MIT",
        major: "Computer Science",
        year: "Junior",
        gpa: "3.8/4.0",
      },
      project: {
        id: 1,
        title: "Quantum Computing Algorithms",
        field: "Physics",
        specialization: "Quantum Computing",
      },
      date: "May 12, 2023",
      status: "pending",
      coverLetter:
        "I am writing to express my interest in the Quantum Computing Algorithms research project. With a strong background in quantum mechanics and algorithm design, I believe I can contribute significantly to this project. I have completed coursework in quantum computing and have experience with Qiskit and other quantum computing frameworks.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 2,
      student: {
        id: 2,
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "Stanford University",
        major: "Physics",
        year: "Senior",
        gpa: "3.9/4.0",
      },
      project: {
        id: 1,
        title: "Quantum Computing Algorithms",
        field: "Physics",
        specialization: "Quantum Computing",
      },
      date: "May 10, 2023",
      status: "interview",
      coverLetter:
        "I am excited to apply for the Quantum Computing Algorithms research project. My background in theoretical physics and quantum information theory has prepared me well for this opportunity. I have conducted previous research on quantum error correction and have published a paper on quantum algorithm optimization.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 3,
      student: {
        id: 3,
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "Caltech",
        major: "Applied Physics",
        year: "Graduate Student",
        gpa: "3.95/4.0",
      },
      project: {
        id: 1,
        title: "Quantum Computing Algorithms",
        field: "Physics",
        specialization: "Quantum Computing",
      },
      date: "May 8, 2023",
      status: "pending",
      coverLetter:
        "I am applying for the Quantum Computing Algorithms research project. My research focus has been on quantum algorithms for optimization problems, which aligns perfectly with this project. I have experience with quantum simulation and have worked with IBM's quantum computers through their cloud access program.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 4,
      student: {
        id: 4,
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "UC Berkeley",
        major: "Computer Science",
        year: "Senior",
        gpa: "3.7/4.0",
      },
      project: {
        id: 2,
        title: "Machine Learning for Climate Data",
        field: "Computer Science",
        specialization: "Machine Learning",
      },
      date: "May 5, 2023",
      status: "accepted",
      coverLetter:
        "I am writing to express my interest in the Machine Learning for Climate Data research project. With a strong background in machine learning and data analysis, I believe I can contribute significantly to this project. I have completed coursework in machine learning, deep learning, and climate science, and have experience with TensorFlow and PyTorch.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 5,
      student: {
        id: 5,
        name: "David Lee",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "Harvard University",
        major: "Environmental Science",
        year: "Graduate Student",
        gpa: "3.85/4.0",
      },
      project: {
        id: 2,
        title: "Machine Learning for Climate Data",
        field: "Computer Science",
        specialization: "Machine Learning",
      },
      date: "May 3, 2023",
      status: "accepted",
      coverLetter:
        "I am excited to apply for the Machine Learning for Climate Data research project. My background in environmental science and data analysis has prepared me well for this opportunity. I have conducted previous research on climate modeling and have experience with machine learning techniques for environmental data analysis.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 6,
      student: {
        id: 6,
        name: "Jessica Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "Princeton University",
        major: "Mathematics",
        year: "Junior",
        gpa: "3.9/4.0",
      },
      project: {
        id: 3,
        title: "Algebraic Topology Applications",
        field: "Mathematics",
        specialization: "Algebraic Topology",
      },
      date: "April 28, 2023",
      status: "accepted",
      coverLetter:
        "I am applying for the Algebraic Topology Applications research project. My strong background in pure mathematics, particularly in topology and algebra, makes me a suitable candidate for this project. I have completed advanced coursework in algebraic topology and have experience with computational methods in topology.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 7,
      student: {
        id: 7,
        name: "Ryan Taylor",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "MIT",
        major: "Mathematics",
        year: "Graduate Student",
        gpa: "4.0/4.0",
      },
      project: {
        id: 3,
        title: "Algebraic Topology Applications",
        field: "Mathematics",
        specialization: "Algebraic Topology",
      },
      date: "April 25, 2023",
      status: "accepted",
      coverLetter:
        "I am writing to express my interest in the Algebraic Topology Applications research project. My research focus has been on applications of algebraic topology in data analysis, which aligns perfectly with this project. I have published papers on topological data analysis and have experience with software tools for computational topology.",
      cv: "/path/to/cv.pdf",
    },
    {
      id: 8,
      student: {
        id: 8,
        name: "Olivia Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        university: "Stanford University",
        major: "Computer Science",
        year: "Senior",
        gpa: "3.75/4.0",
      },
      project: {
        id: 2,
        title: "Machine Learning for Climate Data",
        field: "Computer Science",
        specialization: "Machine Learning",
      },
      date: "April 20, 2023",
      status: "rejected",
      coverLetter:
        "I am interested in the Machine Learning for Climate Data research project. I have a background in computer science with a focus on machine learning and have completed relevant coursework. I am eager to apply my skills to climate data analysis and contribute to this important research area.",
      cv: "/path/to/cv.pdf",
    },
  ]);

  const [isAuth, setIsAuth] = useState(false);

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
    setIsAuth(true);
  }, []);

  if (!isAuth) {
    // Optionally show a loading spinner here
    return null;
  }

  const updateApplicationStatus = (id: number, status: string) => {
    setApplications(
      applications.map((app) => {
        if (app.id === id) {
          return { ...app, status };
        }
        return app;
      })
    );
    setIsViewDialogOpen(false);
  };

  const sendFeedback = () => {
    if (!selectedApplication) return;
    // In a real application, you would send the feedback to the student
    console.log(
      `Sending feedback to ${selectedApplication.student.name}: ${feedbackText}`
    );
    setIsFeedbackDialogOpen(false);
    setFeedbackText("");
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending Review</Badge>;
      case "interview":
        return <Badge variant="secondary">Interview Scheduled</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-8"
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
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={application.student.avatar || "/placeholder.svg"}
                        alt={application.student.name}
                      />
                      <AvatarFallback>
                        {application.student.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {application.student.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {application.student.university} &bull;{" "}
                        {application.student.major}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Applied {application.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <div className="text-sm font-medium">
                      {application.project.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {application.project.field} &bull;{" "}
                      {application.project.specialization}
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Year
                    </div>
                    <div className="text-sm">{application.student.year}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      GPA
                    </div>
                    <div className="text-sm">{application.student.gpa}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Application ID
                    </div>
                    <div className="text-sm">
                      #{application.id.toString().padStart(4, "0")}
                    </div>
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
                    View Application
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      setSelectedApplication(application);
                      setIsFeedbackDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Feedback
                  </Button>
                  <Link href={`/student/profile/${application.student.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <GraduationCap className="h-4 w-4" />
                      View Profile
                    </Button>
                  </Link>
                  <Link href={application.cv}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No applications found
              </h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {activeTab === "all"
                  ? "You don&apos;t have any applications yet."
                  : `You don&apos;t have any ${activeTab} applications.`}
              </p>
              <Link href="/professor/projects">
                <Button>View My Projects</Button>
              </Link>
            </div>
          )}
        </div>

        {/* View Application Dialog */}
        {selectedApplication && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review the application from {selectedApplication.student.name}{" "}
                  for the {selectedApplication.project.title} project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        selectedApplication.student.avatar || "/placeholder.svg"
                      }
                      alt={selectedApplication.student.name}
                    />
                    <AvatarFallback>
                      {selectedApplication.student.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedApplication.student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.student.university} &bull;{" "}
                      {selectedApplication.student.major} &bull;{" "}
                      {selectedApplication.student.year}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-2">Cover Letter</div>
                  <p className="text-sm">{selectedApplication.coverLetter}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">GPA</div>
                    <div className="text-sm">
                      {selectedApplication.student.gpa}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Application Date</div>
                    <div className="text-sm">{selectedApplication.date}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Project</div>
                    <div className="text-sm">
                      {selectedApplication.project.title}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Status</div>
                    <div>{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={selectedApplication.cv}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </Button>
                  </Link>
                  <Link
                    href={`/student/profile/${selectedApplication.student.id}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-0">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  {selectedApplication.status !== "rejected" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateApplicationStatus(
                          selectedApplication.id,
                          "rejected"
                        )
                      }
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  {selectedApplication.status === "pending" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateApplicationStatus(
                          selectedApplication.id,
                          "interview"
                        )
                      }
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                  )}
                  {(selectedApplication.status === "pending" ||
                    selectedApplication.status === "interview") && (
                    <Button
                      onClick={() =>
                        updateApplicationStatus(
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
        {selectedApplication && (
          <Dialog
            open={isFeedbackDialogOpen}
            onOpenChange={setIsFeedbackDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  Send feedback to {selectedApplication.student.name} regarding
                  their application.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        selectedApplication.student.avatar || "/placeholder.svg"
                      }
                      alt={selectedApplication.student.name}
                    />
                    <AvatarFallback>
                      {selectedApplication.student.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedApplication.student.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Application for {selectedApplication.project.title}
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
                          `Dear ${selectedApplication.student.name},\n\nI am pleased to inform you that your application for the &quot;${selectedApplication.project.title}&quot; project has been accepted. Your qualifications and experience make you an excellent fit for this research opportunity.\n\nPlease let me know your availability for an onboarding meeting next week.\n\nBest regards,\nProfessor Davis`
                        );
                      } else if (value === "interview") {
                        setFeedbackText(
                          `Dear ${selectedApplication.student.name},\n\nThank you for your application to the &quot;${selectedApplication.project.title}&quot; project. I would like to schedule an interview to discuss your application further.\n\nAre you available for a 30-minute meeting on Monday or Tuesday next week?\n\nBest regards,\nProfessor Davis`
                        );
                      } else if (value === "rejected") {
                        setFeedbackText(
                          `Dear ${selectedApplication.student.name},\n\nThank you for your interest in the &quot;${selectedApplication.project.title}&quot; project. After careful consideration, I regret to inform you that we are unable to offer you a position at this time.\n\nI encourage you to apply for future research opportunities that match your interests and qualifications.\n\nBest regards,\nProfessor Davis`
                        );
                      } else if (value === "more-info") {
                        setFeedbackText(
                          `Dear ${selectedApplication.student.name},\n\nThank you for your application to the &quot;${selectedApplication.project.title}&quot; project. I would like to request some additional information about your experience with [specific skill/technology].\n\nCould you please provide more details about your previous work in this area?\n\nBest regards,\nProfessor Davis`
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
