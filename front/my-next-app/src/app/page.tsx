import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Calendar, FileText, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="pl-5 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold pl-1">Feels-Like-Summer</span>
          </div>
          <div className="flex items-center gap-4 pr-5">
            <Link href="/login">
              <Button variant="ghost" className="text-[14pxs]">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="text-[14px]">Register</Button>
            </Link>
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
                    Connecting Students with Research Opportunities
                  </h1>
                  <p className="text-muted-foreground md:text-xl pl-7">
                    Find the right professor, project, and field for your
                    academic research journey. Save time and focus on what
                    matters most - your research.
                  </p>
                </div>
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
              </div>
              <div className="mx-auto flex w-full max-w-[520px] items-center justify-center lg:justify-end">
                <div className="w-full h-[360px]  rounded-xl flex items-center justify-center">
                  <img
                    src="image3.png"
                    alt="Research collaboration"
                    className=" overflow-hidden rounded-xl object-cover"
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
                <h3 className="text-xl font-bold">Find Perfect Matches</h3>
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
                <h3 className="text-xl font-bold">Professor Availability</h3>
                <p className="text-muted-foreground">
                  See professor availability in real-time, eliminating the need
                  for back-and-forth emails and appointment scheduling.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">CV Management</h3>
                <p className="text-muted-foreground">
                  Generate and manage your CV directly on the platform, keeping
                  track of all your applications to research projects.
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
                  <img
                    src="image.png"
                    alt="Platform workflow"
                    className="object-cover h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section
          id="testimonials"
          className="w-full py-12 md:py-24 bg-background"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Testimonials
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from students and professors who have found success on
                  our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 md:py-12 lg:grid-cols-2">
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=64&width=64"
                    alt="Student profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">Emily Chen</h4>
                    <p className="text-sm text-muted-foreground">
                      Ph.D. Student, Quantum Physics
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  "Before ResearchConnect, I spent months trying to find a
                  professor who specialized in quantum entanglement. Within a
                  week of joining, I found my perfect match and now I'm working
                  on groundbreaking research!"
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=64&width=64"
                    alt="Professor profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">
                      Prof. James Wilson
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Mathematics Department, Stanford University
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  "As a professor with multiple research projects, finding the
                  right students was always challenging. This platform has
                  streamlined my recruitment process, helping me find students
                  who are truly passionate about my field."
                </p>
              </div>
            </div>
          </div>
        </section> */}

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
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Register Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
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
              <span className="text-xl font-bold">ResearchConnect</span>
            </div>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8 pr-10">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">For Students</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/student/dashboard"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/explore"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Find Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/cv"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      CV Builder
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/student/resources"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">For Professors</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="professor/dashboard"
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
                  {/* <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Resource Sharing
                    </Link>
                  </li> */}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/student/resources"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Hackathon Archives
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Research Roadmaps
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Field Guides
                    </Link>
                  </li> */}
                </ul>
              </div>
              {/* <div className="space-y-3">
                <h4 className="text-sm font-medium">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div> */}
            </nav>
          </div>
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 border-t pt-6 pl-5">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ResearchConnect. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 pr-5">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
