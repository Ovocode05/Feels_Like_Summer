"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calendar, FileText, Search } from "lucide-react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<"fac" | "stu" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  // decode token safely whenever it changes
  useEffect(() => {
    if (!token) {
      setUserType(null);
      return;
    }
    try {
      const decoded = jwtDecode(token) as { type?: string } | null;
      if (decoded?.type === "fac") setUserType("fac");
      else if (decoded?.type === "stu") setUserType("stu");
      else setUserType(null);
    } catch {
      setUserType(null);
    }
  }, [token]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      setToken(null);
      setUserType(null);
      router.push("/login");
    }
  };

  const dashboardHref = userType === "fac" ? "/professor/" : "/student/";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="pl-5 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold pl-1">FLS</span>
          </div>
          <div className="flex items-center gap-4 pr-5">
            {!token ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-[14pxs]">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-[14px]">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={dashboardHref}>
                  <Button variant="ghost" className="text-[14pxs]">
                    {userType === "fac" ? "Professor Dashboard" : "Dashboard"}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-[14px]"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
          <div className="container md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4 ">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl pl-7">
                    {userType === "fac"
                      ? "Manage your research and recruit student collaborators"
                      : "Connecting Students with Research Opportunities"}
                  </h1>
                  <p className="text-muted-foreground md:text-xl pl-7">
                    {userType === "fac"
                      ? "Post projects, review applications, and find motivated students quickly."
                      : "Find the right professor, project, and field for your academic research journey. Save time and focus on what matters most - your research."}
                  </p>
                </div>

                {/* CTA variations */}
                {!token ? (
                  <div className="flex flex-col gap-2 sm:flex-row pl-7">
                    <Link href="/register?role=student">
                      <Button size="lg" className="gap-1.5">
                        Join as Student <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/register?role=professor">
                      <Button size="lg" variant="outline">
                        Join as Professor
                      </Button>
                    </Link>
                  </div>
                ) : userType === "fac" ? (
                  <div className="flex flex-col gap-2 sm:flex-row pl-7">
                    <Link href="/professor/projects">
                      <Button size="lg" className="gap-1.5">
                        Post a Project
                      </Button>
                    </Link>
                    <Link href="/professor/applications">
                      <Button size="lg" variant="outline">
                        View Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row pl-7">
                    <Link href="/student/projects">
                      <Button size="lg" className="gap-1.5">
                        Explore Projects
                      </Button>
                    </Link>
                    <Link href="/student/">
                      <Button size="lg" variant="outline">
                        My Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mx-auto flex w-full max-w-[520px] items-center justify-center lg:justify-end">
                <div className="w-full h-[360px]  rounded-xl flex items-center justify-center">
                  <Image
                    src="/image3.png"
                    alt="Research collaboration"
                    width={320}
                    height={160}
                    className="overflow-hidden rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Optimized for Academic Success
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform bridges the gap between students seeking research
                  opportunities and professors looking for passionate
                  collaborators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-8 md:py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Start Your Journey</h3>
                <p className="text-muted-foreground">
                  Discover professors and projects in your specific field of
                  interest, from mathematics to physics to specialized
                  subfields.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">
                  Apply to projects that interest you
                </h3>
                <p className="text-muted-foreground">
                  Eliminating the need for back-and-forth emails and appointment
                  scheduling.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">RoadMaps</h3>
                <p className="text-muted-foreground">
                  Visualize your research journey with customizable roadmaps,
                  track milestones, set goals, and receive tailored next-step
                  recommendations to stay on course.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A simple and efficient process to connect students with
                  research opportunities.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-8 md:py-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="flex flex-col space-y-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Create Your Profile</h3>
                  <p className="text-muted-foreground">
                    Students: Highlight your academic background, interests, and
                    skills. Professors: Showcase your research areas, ongoing
                    projects, and student requirements.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Browse Opportunities</h3>
                  <p className="text-muted-foreground">
                    Search for professors or projects by field, university, or
                    specific research interests. Explore project descriptions,
                    requirements, and professor availability.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Apply with Confidence</h3>
                  <p className="text-muted-foreground">
                    Generate or upload your CV, write a tailored application,
                    and submit it directly through the platform. Track your
                    application status and receive notifications on updates.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full h-[400px] bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/image.png"
                    width={600}
                    height={400}
                    alt="Platform workflow"
                    className="object-cover h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Your Research Journey?
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students and professors already
                  collaborating on groundbreaking research.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {!token && (
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="gap-1.5">
                      Register Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-black border-primary-foreground hover:text-primary hover:bg-primary-foreground"
                  >
                    Explore Projects
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 pl-5">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">Feels like Summer</span>
            </div>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8 pr-10">
              <div className="space-y-3 pl-4">
                <h4 className="text-sm font-medium">For Students</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/student/"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/projects"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Find Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/resources"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Roadmaps
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">For Professors</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="professor/"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="professor/projects"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Post Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="professor/applications"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Applications
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3 pl-4 sm:pl-0">
                <h4 className="text-sm font-medium">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/student/resources"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Roadmaps
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t pt-6 pl-5">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Feels Like Summer. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
