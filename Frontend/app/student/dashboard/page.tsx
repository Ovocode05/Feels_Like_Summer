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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MessageSquare,
  Rocket,
  Search,
  Star,
} from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-5 lg:flex">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold ">ResearchConnect</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex gap-6">
            <Link
              href="/student/dashboard"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/student/explore"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Explore
            </Link>
            {/* <Link
              href="/student/applications"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              My Applications
            </Link> */}
            <Link
              href="/student/resources"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/student/cv"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              My CV
            </Link>
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                2
              </span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/student/profile">
            <Avatar>
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Student"
              />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Krrish. Track your research journey here.
            </p>
          </div>
          <Link href="/student/explore">
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
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Submitted in the last 30 days
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
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Active research participation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Projects
              </CardTitle>
              <BookMarkCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">In your watchlist</p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profile Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Professors viewed your profile
              </p>
            </CardContent>
          </Card> */}
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
                {[
                  {
                    professor: "Prof. Richard Williams",
                    project: "Quantum Computing Algorithms",
                    date: "Submitted May 12, 2023",
                    status: "Under Review",
                  },
                  {
                    professor: "Prof. Sarah Lee",
                    project: "Neural Networks for Image Recognition",
                    date: "Submitted May 5, 2023",
                    status: "Interview Scheduled",
                  },
                  {
                    professor: "Prof. James Chen",
                    project: "Statistical Models for Climate Data",
                    date: "Submitted Apr 28, 2023",
                    status: "Pending",
                  },
                ].map((application, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between space-x-4"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt={application.professor}
                        />
                        <AvatarFallback>
                          {application.professor.split(" ").pop()?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {application.project}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.professor}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {application.date}
                          </span>
                          <Badge
                            variant={
                              application.status === "Interview Scheduled"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Link href={`/student/applications/${i + 1}`}>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/student/applications">
                <Button variant="outline" className="w-full">
                  View All Applications
                </Button>
              </Link>
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
              <Link href="/student/explore">
                <Button variant="outline" className="w-full">
                  Browse More Projects
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Roadmaps and materials shared by professors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Search resources..." className="flex-1" />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {[
                {
                  title: "Introduction to Quantum Computing",
                  author: "Prof. Richard Williams",
                  type: "Course Roadmap",
                  icon: <BookText className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Machine Learning Fundamentals",
                  author: "Prof. Sarah Lee",
                  type: "Reading List",
                  icon: <BookOpen className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Research Methodology in Computer Science",
                  author: "Prof. James Chen",
                  type: "Video Lectures",
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
                    <p className="text-sm text-muted-foreground">
                      {resource.author}
                    </p>
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

interface BellProps extends React.SVGProps<SVGSVGElement> {}

function Bell(props: BellProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Eye(props: BellProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
