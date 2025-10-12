"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProjectByPid, updateProjectByPid } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  User2,
  BookOpen,
  ChevronLeft,
  FileText,
} from "lucide-react";

type ProjectType = {
  ID: number;
  pid: string;
  name: string;
  sdesc: string; // alternative short description field
  ldesc: string; // alternative long description field
  tags: string[];
  isActive: boolean;
  uid: string;
  user: {
    name: string;
    email: string;
    type: string;
    ID: number;
  };
};

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const [showActiveConfirm, setShowActiveConfirm] = useState(false); // NEW
  const [showUpdatedPopup, setShowUpdatedPopup] = useState(false);
  const pid = params?.id as string;

  useEffect(() => {
    if (pid) fetchProject();
  }, [pid]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const data = await getProjectByPid(pid, token);
      setProject(data);
    } catch (error) {
      setProject(null);
    }
    setLoading(false);
  };

  // Handle update active status
  const handleUpdateActive = async () => {
    if (!project) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token") || "";
      await updateProjectByPid(pid, { isActive: !project.isActive }, token);
      setShowUpdatedPopup(true);
      await fetchProject();
      setTimeout(() => setShowUpdatedPopup(false), 2000);
    } catch (error) {
      // Optionally show error
      console.error("Error updating project status:", error);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        Loading...
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-black/10 bg-white px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-black" />
          <span className="text-xl font-bold text-black">ResearchConnect</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-black hover:bg-black/10">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-black text-white hover:bg-black/80">
              Sign up
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="inline-flex items-center gap-1 text-black/60 hover:text-black"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Project Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl bg-white shadow-lg border border-black/10 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  {project.name}
                  <Badge
                    className={
                      project.isActive === true
                        ? "bg-black text-white"
                        : "bg-white border border-black text-black"
                    }
                  >
                    {project.isActive === true ? "Active" : "Inactive"}
                  </Badge>
                </h1>
                <span className="text-xs text-black/60 font-mono">
                  PID: {project.pid}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* If you have tags, display here */}
                {project.tags?.map((tag: string, idx: number) => (
                  <Badge
                    key={tag + idx}
                    className="bg-black/90 text-white border border-black"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-white shadow border border-black/10 p-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-black" />
                Short Description
              </h2>
              <p className="mb-6 text-base text-black/80">{project.sdesc}</p>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-black" />
                Long Description
              </h2>
              <p className="text-base text-black/80">{project.ldesc}</p>
            </div>
          </div>

          {/* Sidebar: Professor Info */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white shadow border border-black/10 p-6 flex flex-col items-center">
              <User2 className="h-12 w-12 text-black mb-2" />
              <div className="text-lg font-semibold mb-1 text-black">
                {project.user?.name || "Unknown Professor"}
              </div>
              <div className="flex items-center gap-2 text-black/70 mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{project.user?.email}</span>
              </div>
              <Badge className="bg-black text-white">
                {project.user?.type === "fac" ? "Faculty" : "User"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Set Inactive Button at the end */}
        <div className="flex justify-end mt-8">
          {project.isActive === true ? (
            <Button
              onClick={() => setShowInactiveConfirm(true)}
              disabled={updating}
              variant="destructive"
              className="bg-red-800 text-white px-8 py-2 rounded-lg shadow hover:bg-red-900"
            >
              Set Inactive
            </Button>
          ) : (
            <Button
              onClick={() => setShowActiveConfirm(true)}
              disabled={updating}
              variant="default"
              className="bg-black text-white px-8 py-2 rounded-lg shadow hover:bg-black/80"
            >
              {updating ? "Updating..." : "Set Active"}
            </Button>
          )}
        </div>

        {/* Inactive Confirmation Pop-up (side/end) */}
        {showInactiveConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-red-800 bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in">
              <AlertTriangle className="h-6 w-6 text-red-800" />
              <div>
                <div className="font-semibold text-red-800 mb-1">
                  Confirm Inactivation
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to set this project as inactive? This
                  will prevent new applications.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowInactiveConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-800 text-white"
                    onClick={async () => {
                      setShowInactiveConfirm(false);
                      await handleUpdateActive();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Confirmation Pop-up (side/end) */}
        {showActiveConfirm && (
          <div className="fixed right-8 bottom-8 z-50 flex flex-col items-end">
            <div className="rounded-lg border border-black bg-white px-6 py-4 shadow-xl flex items-center gap-4 animate-fade-in">
              <AlertTriangle className="h-6 w-6 text-black" />
              <div>
                <div className="font-semibold text-black mb-1">
                  Confirm Activation
                </div>
                <div className="text-sm text-black mb-2">
                  Are you sure you want to set this project as active? This will
                  allow new applications.
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black"
                    onClick={() => setShowActiveConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-black text-white"
                    onClick={async () => {
                      setShowActiveConfirm(false);
                      await handleUpdateActive();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Updated Popup */}
        {showUpdatedPopup && (
          <div className="fixed right-8 bottom-24 z-50 flex items-center gap-3 rounded-lg border border-black bg-white px-6 py-3 text-black shadow-xl animate-fade-in">
            <CheckCircle2 className="h-6 w-6 text-black" />
            <span className="font-semibold">Project status updated.</span>
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-8 bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-black" />
            <span className="text-lg font-semibold text-black">
              ResearchConnect
            </span>
          </div>
          <p className="text-center text-sm text-black/60 md:text-left">
            &copy; {new Date().getFullYear()} ResearchConnect. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
