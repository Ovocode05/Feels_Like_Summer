"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, BookOpen, MessageSquare, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useRouter } from "next/navigation";

function Header() {
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
        <span className="text-xl font-bold">FLS</span>
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
        </div>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        {/* <Link href="/messages">
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button> */}
        <Link href="/professor/profile">
          <Avatar>
            <AvatarImage
              src="/placeholder.svg?height=32&width=32"
              alt="Professor"
            />
            <AvatarFallback>PD</AvatarFallback>
          </Avatar>
        </Link>
        {/* Log Out Button */}
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

export default Header;
