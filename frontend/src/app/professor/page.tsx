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
import {
  fetchProjects_active_my,
  getAllMyProjectApplications,
} from "@/api/api"; // added
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function ProfessorDashboard() {
  const router = useRouter();
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0); // added

  useEffect(() => {
    async function fetchAndCountProjects() {
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetchProjects_active_my(token);
        setActiveProjectsCount(res?.count ? res.count : 0);
      } catch (err) {
        console.error("Failed to fetch active projects", err);
        setActiveProjectsCount(0);
      }

      // fetch total applications across professor projects
      try {
        const appsRes = await getAllMyProjectApplications(token);
        const projects = appsRes.projects || [];
        const total = projects.reduce(
          (sum: number, p: { applications?: unknown[]; count?: number }) =>
            sum +
            (Array.isArray(p.applications)
              ? p.applications.length
              : p.count ?? 0),
          0
        );
        setTotalApplications(total);
      } catch (err) {
        console.error("Failed to fetch applications count", err);
        setTotalApplications(0);
      }
    }

    fetchAndCountProjects();
    const onFocus = () => fetchAndCountProjects();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

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
  }, [router]); // added router to deps to satisfy react-hooks/exhaustive-deps

  if (!isAuth) {
    // Optionally show a loading spinner here
    return null;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Welcome back, Professor Davis. Here is an overview of your
                research activity.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/professor/projects">
                <Button size="sm">New Project</Button>
              </Link>
              <Link href="/professor/applications">
                <Button size="sm" variant="outline">
                  Applications
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI cards - responsive */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="w-full">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {activeProjectsCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +1 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Applications
                </CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {totalApplications}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  new this week
                </p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active research collaborations
                </p>
              </CardContent>
            </Card>

            {/* Optional placeholder for additional KPI on large screens */}
            <div className="hidden lg:block" />
          </div>

          {/* Main content area: recent applications + availability */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <Card className="col-span-1 md:col-span-2 lg:col-span-4 w-full">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Students who recently applied to your research projects.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex">
                <Link href="/professor/applications" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="col-span-1 md:col-span-2 lg:col-span-3 w-full">
              <CardHeader>
                <CardTitle>Your Availability</CardTitle>
                <CardDescription>
                  Current office hours and meeting slots.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/professor/calendar" className="w-full">
                  <Button variant="outline" className="w-full">
                    Manage Availability
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
