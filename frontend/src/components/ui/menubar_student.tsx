"use client";
import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, LogOut, Menu, X } from "lucide-react";

import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useRouter } from "next/navigation"; // <-- Use next/navigation for app router

function MenubarStudent() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Log out handler: remove token and redirect to login
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-4 flex h-16 items-center gap-4 md:mx-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg font-bold sm:text-xl">FLS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex gap-6">
            <Link
              href="/student/"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/student/projects"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Projects
            </Link>
            <Link
              href="/student/resources"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/student/profile"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Profile
            </Link>
          </div>
        </nav>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((s) => !s)}
            className="rounded-md p-2 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Desktop actions */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="ml-2 flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden">
          <nav className="absolute left-4 right-4 top-[64px] z-40 rounded-md border bg-background/95 p-4 shadow-md backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <Link
                href="/student/"
                className="block rounded px-2 py-2 text-sm font-medium hover:bg-muted/40"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/student/projects"
                className="block rounded px-2 py-2 text-sm font-medium hover:bg-muted/40"
                onClick={() => setMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/student/resources"
                className="block rounded px-2 py-2 text-sm font-medium hover:bg-muted/40"
                onClick={() => setMenuOpen(false)}
              >
                Resources
              </Link>

              <div className="mt-2 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Log out</span>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default MenubarStudent;
