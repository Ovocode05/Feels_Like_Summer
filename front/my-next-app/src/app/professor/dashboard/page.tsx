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
import Header from "@/components/ui/manual_navbar_prof";
import { useEffect, useState } from "react";
import { fetchProjects_active, fetchProjects_active_my } from "@/api/api"; // Make sure this API returns all projects for the professor

export default function ProfessorDashboard() {
  // const { loading, authorized } = useAuth("prof");
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       Loading...
  //     </div>
  //   );
  // }
  // if (!authorized) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       Unauthorized
  //     </div>
  //   );
  // }

  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);

  // Fetch all projects and count active ones
  async function fetchAndCountProjects() {
    const token = localStorage.getItem("token") || "";
    const res = await fetchProjects_active_my(token);

    if (res.count != 0) {
      setActiveProjectsCount(res.count);
    } else {
      setActiveProjectsCount(0);
    }
  }

  useEffect(() => {
    fetchAndCountProjects();
    const onFocus = () => fetchAndCountProjects();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, Professor Davis. Here's an overview of your research
              activity.
            </p>
          </div>
        </div>

        <div className="grid gap-[200px] md:grid-cols-2 lg:grid-cols-4 ml-[250px]">
          <Card className="w-[300px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjectsCount}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          <Card className="w-[300px]">
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
          <Card className="w-[300px]">
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
          {/* <Card>
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
          </Card> */}
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
