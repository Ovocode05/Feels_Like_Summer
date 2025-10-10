"use client";
import * as React from "react";
import Link from "next/link";
import { Bell, BookOpen, LogOut, MessageSquare } from "lucide-react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useRouter } from "next/navigation"; // <-- Use next/navigation for app router

function MenubarStudent() {
  const router = useRouter();

  // Log out handler: remove token and redirect to login
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 lg:flex">
        <BookOpen className="h-6 w-6" />
        <span className="text-xl font-bold">ResearchConnect</span>
      </Link>
      <nav className="hidden flex-1 items-center justify-center lg:flex">
        <div className="flex gap-6">
          <Link
            href="/student/dashboard"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <Link
            href="/student/explore"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Explore
          </Link>
          <Link
            href="/student/resources"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Resources
          </Link>
          <Link
            href="/student/cv"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
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
        {/* Logout button, spaced like a menu item */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2 flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}

export default MenubarStudent;
