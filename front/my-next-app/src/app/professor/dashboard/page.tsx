"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, ClipboardList, FileText } from "lucide-react";
import Header from "@/components/ui/manual_navbar_prof";
import { useEffect, useState } from "react";
import { fetchProjects_active_my } from "@/api/api";

export default function ProfessorDashboard() {
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);

  useEffect(() => {
    async function fetchAndCountProjects() {
      const token = localStorage.getItem("token") || "";
      const res = await fetchProjects_active_my(token);

      if (res.count !== 0) {
        setActiveProjectsCount(res.count);
      } else {
        setActiveProjectsCount(0);
      }
    }

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
              Welcome back, Professor Davis. Here is an overview of your
              research activity.
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">7 new this week</p>
            </CardContent>
          </Card>
          <Card className="w-[300px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active research collaborations
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
