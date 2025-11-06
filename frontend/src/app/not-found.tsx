"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header to maintain consistency */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Search className="h-6 w-6" />
            <span className="text-xl font-bold">FLS</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center py-12">
            {/* 404 Number */}
            <div className="space-y-4">
              <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-muted-foreground/20">
                404
              </h1>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Page Not Found
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/student/projects">
                <Button size="lg" variant="outline" className="gap-2">
                  <Search className="h-4 w-4" />
                  Explore Projects
                </Button>
              </Link>
            </div>

            {/* Additional Help Text */}
            <div className="pt-8 border-t max-w-[600px] w-full">
              <p className="text-sm text-muted-foreground">
                Looking for something specific? Try visiting:
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link href="/login" className="text-sm text-primary hover:underline">
                  Login
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/register" className="text-sm text-primary hover:underline">
                  Register
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/student/" className="text-sm text-primary hover:underline">
                  Student Dashboard
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="/professor/" className="text-sm text-primary hover:underline">
                  Professor Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
