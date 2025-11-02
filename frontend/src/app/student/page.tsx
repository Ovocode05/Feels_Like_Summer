"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookmarkCheckIcon as BookMarkCheck,
  BookOpen,
  BookText,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  History,
  Rocket,
  Search,
  Star,
} from "lucide-react";
import MenubarStudent from "@/components/ui/menubar_student";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyApplications } from "@/api/api";

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
  sub: string;
  nbf?: number;
  iss?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  // moved decode to client-only state to avoid server-side localStorage access
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

    // Fetch applications
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
    // Optionally show a loading spinner here
    return null;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back {decode.name} . Track your research journey here.
            </p>
          </div>
          <Link href="/student/projects">
            <Button className="flex items-center gap-1">
              <Search className="h-4 w-4" /> Find Projects
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                Total applications submitted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Projects
              </CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">
                Active research participation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Interviews Scheduled
              </CardTitle>
              <BookMarkCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) => app.status.toLowerCase() === "interview"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Pending interviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Track the status of your research applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-4">
                    Loading applications...
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    You haven&apos;t applied to any projects yet.
                  </div>
                ) : (
                  applications.slice(0, 3).map((application) => (
                    <div
                      key={application.ID}
                      className="flex items-center justify-between space-x-4"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {application.User?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {application.Project?.project_name ||
                              "Unknown Project"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.User?.name || "Unknown Professor"}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Submitted {formatDate(application.time_created)}
                            </span>
                            <Badge
                              variant={getStatusVariant(application.status)}
                              className="text-xs"
                            >
                              {getStatusDisplay(application.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/project/${application.pid}`}>
                        <Button variant="ghost" size="sm">
                          View <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              {applications.length > 3 && (
                <Link href="/student/applications" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
              <CardDescription>
                Your selected fields and research interests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 font-medium">Primary Field</div>
                  <Badge className="mr-1" variant="secondary">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    Computer Science
                  </Badge>
                </div>
                <div>
                  <div className="mb-2 font-medium">Specialized Areas</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Machine Learning</Badge>
                    <Badge variant="outline">Quantum Computing</Badge>
                    <Badge variant="outline">Algorithm Design</Badge>
                    <Badge variant="outline">Data Science</Badge>
                    <Badge variant="outline">Natural Language Processing</Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">CV Completion</div>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[85%] rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/student/profile/edit">
                <Button variant="outline" className="w-full">
                  Update Interests
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Projects</CardTitle>
              <CardDescription>
                Based on your interests and qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Deep Learning for Medical Imaging",
                  professor: "Prof. Maria Garcia",
                  university: "Stanford University",
                  relevance: "98% match",
                },
                {
                  title: "Quantum Algorithms for Optimization",
                  professor: "Prof. David Lee",
                  university: "MIT",
                  relevance: "95% match",
                },
                {
                  title: "Natural Language Processing in Healthcare",
                  professor: "Prof. Elizabeth Chen",
                  university: "UC Berkeley",
                  relevance: "92% match",
                },
              ].map((project, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{project.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.professor}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.university}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Star className="mr-1 h-3 w-3 fill-primary text-primary" />{" "}
                      {project.relevance}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Link href="/student/projects">
                <Button variant="outline" className="w-full">
                  Browse More Projects
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>Roadmaps shared by professors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="flex gap-2">
                <Input placeholder="Search resources..." className="flex-1" />
                <Button variant="outline" size="icon">
                  {/* <Search className="h-4 w-4" /> */}
              {/* </Button> */}
              {/* </div> */}

              {[
                {
                  title: "Introduction to Quantum Computing",
                  type: "Course Roadmap",
                  icon: <BookText className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Machine Learning Fundamentals",
                  type: "Course Roadmap",
                  icon: <BookOpen className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Research Methodology in Computer Science",
                  type: "Course Roadmap",
                  icon: <History className="h-8 w-8 text-primary" />,
                },
              ].map((resource, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-4 rounded-lg border p-3"
                >
                  <div>{resource.icon}</div>
                  <div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {resource.type}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Link href="/student/resources">
                <Button variant="outline" className="w-full">
                  View All Resources
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">AI Research Symposium</h3>
                <p className="text-sm text-muted-foreground">
                  May 25, 2023 • Virtual Event
                </p>
                <p className="mt-2 text-sm">
                  Join leading AI researchers as they present their latest
                  findings and innovations in the field.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Register</Button>
                  <Button variant="outline" size="sm">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="hackathons" className="space-y-4">
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">Climate Data Hackathon</h3>
                <p className="text-sm text-muted-foreground">
                  June 10-12, 2023 • Online
                </p>
                <p className="mt-2 text-sm">
                  Develop innovative solutions to climate challenges using
                  real-world data sets.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Register</Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="workshops" className="space-y-4">
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium">
                  Research Paper Writing Workshop
                </h3>
                <p className="text-sm text-muted-foreground">
                  June 5, 2023 • 2:00 PM - 4:00 PM
                </p>
                <p className="mt-2 text-sm">
                  Learn effective strategies for writing and publishing research
                  papers in top journals.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Register</Button>
                  <Button variant="outline" size="sm">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
