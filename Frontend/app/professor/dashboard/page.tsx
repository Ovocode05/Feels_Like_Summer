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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  User,
  Users,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ProfessorDashboard() {
  const { loading, authorized } = useAuth("prof");
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 lg:flex">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">ResearchConnect</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex gap-6">
            <Link
              href="/professor/dashboard"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/professor/projects"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              My Projects
            </Link>
            <Link
              href="/professor/applications"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Applications
            </Link>
            <Link
              href="/professor/resources"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/professor/calendar"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Availability
            </Link>
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/professor/profile">
            <Avatar>
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Professor"
              />
              <AvatarFallback>PD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Professor Davis. Here's an overview of your research
              activity.
            </p>
          </div>
          <Link href="/professor/projects/new">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">7 new this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Active research collaborations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Meetings
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Next: Tomorrow at 2:00 PM
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Students who recently applied to your research projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    name: "Alex Johnson",
                    project: "Quantum Computing Algorithms",
                    date: "2 days ago",
                    status: "New",
                  },
                  {
                    name: "Sarah Williams",
                    project: "Machine Learning for Climate Data",
                    date: "4 days ago",
                    status: "Reviewed",
                  },
                  {
                    name: "Michael Chen",
                    project: "Algebraic Topology Applications",
                    date: "6 days ago",
                    status: "New",
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
                          alt={application.name}
                        />
                        <AvatarFallback>
                          {application.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {application.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.project}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {application.date}
                          </span>
                          {application.status === "New" && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/professor/applications/${i + 1}`}>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/professor/applications">
                <Button variant="outline" className="w-full">
                  View All Applications
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Availability</CardTitle>
              <CardDescription>
                Current office hours and meeting slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    day: "Monday",
                    slots: ["10:00 AM - 12:00 PM", "2:00 PM - 3:00 PM"],
                  },
                  { day: "Wednesday", slots: ["1:00 PM - 4:00 PM"] },
                  { day: "Friday", slots: ["9:00 AM - 11:00 AM"] },
                ].map((schedule, i) => (
                  <div key={i} className="space-y-2">
                    <div className="font-medium">{schedule.day}</div>
                    <div className="space-y-1">
                      {schedule.slots.map((slot, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 rounded-md border p-2 text-sm"
                        >
                          <CalendarClock className="h-4 w-4 text-muted-foreground" />
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/professor/calendar">
                <Button variant="outline" className="w-full">
                  Manage Availability
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Quantum Computing Algorithms",
                  description:
                    "Developing novel quantum algorithms for optimization problems.",
                  students: 3,
                  applications: 5,
                  startDate: "Jan 15, 2023",
                },
                {
                  title: "Machine Learning for Climate Data",
                  description:
                    "Using machine learning to analyze and predict climate patterns.",
                  students: 2,
                  applications: 4,
                  startDate: "Mar 10, 2023",
                },
                {
                  title: "Algebraic Topology Applications",
                  description:
                    "Exploring applications of algebraic topology in data analysis.",
                  students: 2,
                  applications: 3,
                  startDate: "Feb 5, 2023",
                },
              ].map((project, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {project.students} Students
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {project.applications} Applications
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Started {project.startDate}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/professor/projects/${i + 1}`}>
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                    </Link>
                    <Link href={`/professor/projects/${i + 1}/applications`}>
                      <Button size="sm">Review Applications</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Neural Networks in Robotics</CardTitle>
                  <CardDescription>
                    Implementing neural networks for robotic control systems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Awaiting approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Positions: 2</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button size="sm">Submit</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Statistical Mechanics Models</CardTitle>
                  <CardDescription>
                    Developed new statistical mechanics models for complex
                    systems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">4 Students Participated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Jan 2022 - Dec 2022</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="#">
                    <Button variant="outline" size="sm">
                      View Results
                    </Button>
                  </Link>
                  <Link href="#">
                    <Button variant="outline" size="sm">
                      Publications
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
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
