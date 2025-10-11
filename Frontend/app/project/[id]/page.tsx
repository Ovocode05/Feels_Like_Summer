import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  Clock,
  Download,
  FileText,
  GraduationCap,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
// import useAuth from "@/hooks/useAuth";

export default function ProjectDetails() {
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
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">ResearchConnect</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/project-listing"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Projects</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
                Quantum Computing Algorithms
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">Physics</Badge>
                <Badge variant="secondary">Quantum Computing</Badge>
                <Badge variant="outline">Open</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="Dr. Richard Williams"
                    />
                    <AvatarFallback>RW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Dr. Richard Williams</div>
                    <div className="text-sm text-muted-foreground">
                      Professor of Physics
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">MIT</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b pb-px">
                <TabsTrigger
                  value="description"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="requirements"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Requirements
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Resources
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4 space-y-4">
                <p className="leading-7">
                  This research project focuses on developing novel quantum
                  algorithms for optimization problems. We aim to explore new
                  approaches to quantum computing that can solve complex
                  optimization challenges more efficiently than classical
                  computers.
                </p>
                <p className="leading-7">
                  Our team is working on implementing these algorithms on the
                  latest quantum hardware platforms, and testing their
                  performance on real-world problems. The research has potential
                  applications in fields such as logistics, finance, drug
                  discovery, and artificial intelligence.
                </p>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">
                  Research Objectives
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Develop new quantum algorithms for combinatorial
                    optimization problems
                  </li>
                  <li>
                    Implement and test these algorithms on current quantum
                    computing platforms
                  </li>
                  <li>
                    Compare performance against classical algorithms and other
                    quantum approaches
                  </li>
                  <li>Investigate potential applications in various domains</li>
                  <li>
                    Contribute to the theoretical understanding of quantum
                    computing complexity
                  </li>
                </ul>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">
                  What You'll Learn
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Quantum computing principles and quantum information theory
                  </li>
                  <li>Quantum algorithm design and analysis</li>
                  <li>
                    Programming quantum computers using frameworks like Qiskit
                    or Cirq
                  </li>
                  <li>
                    Optimization problem formulation and solution methodologies
                  </li>
                  <li>
                    Research methodology and scientific publication writing
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="requirements" className="pt-4 space-y-4">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Required Qualifications
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Strong background in linear algebra and probability theory
                  </li>
                  <li>Programming experience in Python</li>
                  <li>Basic understanding of quantum mechanics</li>
                  <li>Strong analytical and problem-solving skills</li>
                  <li>Ability to work collaboratively in a research team</li>
                </ul>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">
                  Preferred Qualifications
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Previous experience with quantum computing frameworks
                    (Qiskit, Cirq, etc.)
                  </li>
                  <li>
                    Coursework in quantum information science or quantum
                    computing
                  </li>
                  <li>Experience with optimization algorithms</li>
                  <li>
                    Background in computer science or computational physics
                  </li>
                </ul>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">
                  Time Commitment
                </h3>
                <p className="leading-7">
                  This project requires a commitment of 10-15 hours per week for
                  a minimum of 6 months. Weekly team meetings are held on
                  Tuesdays at 2:00 PM.
                </p>
              </TabsContent>
              <TabsContent value="timeline" className="pt-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        1
                      </div>
                      <div className="w-px h-full bg-border"></div>
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-semibold">
                        Phase 1: Literature Review and Problem Formulation
                      </h3>
                      <p className="text-muted-foreground">June - July 2023</p>
                      <p className="mt-2">
                        Review existing quantum algorithms and identify specific
                        optimization problems to target.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        2
                      </div>
                      <div className="w-px h-full bg-border"></div>
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-semibold">
                        Phase 2: Algorithm Design and Theoretical Analysis
                      </h3>
                      <p className="text-muted-foreground">
                        August - September 2023
                      </p>
                      <p className="mt-2">
                        Develop new quantum algorithms and analyze their
                        theoretical performance and complexity.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        3
                      </div>
                      <div className="w-px h-full bg-border"></div>
                    </div>
                    <div className="pb-6">
                      <h3 className="text-lg font-semibold">
                        Phase 3: Implementation and Preliminary Testing
                      </h3>
                      <p className="text-muted-foreground">
                        October - November 2023
                      </p>
                      <p className="mt-2">
                        Implement algorithms on quantum simulators and
                        small-scale quantum hardware.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Phase 4: Performance Evaluation and Publication
                      </h3>
                      <p className="text-muted-foreground">
                        December 2023 - January 2024
                      </p>
                      <p className="mt-2">
                        Comprehensive testing, analysis of results, and
                        preparation of research papers.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="resources" className="pt-4 space-y-4">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  Recommended Reading
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    "Quantum Computation and Quantum Information" by Michael A.
                    Nielsen and Isaac L. Chuang
                  </li>
                  <li>
                    "Programming Quantum Computers: Essential Algorithms and
                    Code Samples" by Eric R. Johnston, Nic Harrigan, and
                    Mercedes Gimeno-Segovia
                  </li>
                  <li>
                    "Quantum Computing: A Gentle Introduction" by Eleanor G.
                    Rieffel and Wolfgang H. Polak
                  </li>
                </ul>
                <div className="flex items-center gap-4 mt-4">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Project Syllabus
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Reading List
                  </Button>
                </div>
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">
                  Online Resources
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      Qiskit Textbook
                    </Link>{" "}
                    - Comprehensive guide to quantum computing and Qiskit
                  </li>
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      MIT OpenCourseWare: Quantum Computing
                    </Link>{" "}
                    - Lecture notes and materials
                  </li>
                  <li>
                    <Link href="#" className="text-primary hover:underline">
                      Quantum Algorithm Zoo
                    </Link>{" "}
                    - Repository of quantum algorithms
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Key information about this research opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      Application Deadline
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>June 15, 2023</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Start Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>July 1, 2023</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Duration</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>6-12 months</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Positions</div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>2 openings</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Position Type</div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>Research Assistant</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Compensation</div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Paid / For Credit</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="text-sm font-medium">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Linear Algebra</Badge>
                    <Badge variant="outline">Python</Badge>
                    <Badge variant="outline">Quantum Mechanics</Badge>
                    <Badge variant="outline">Algorithm Design</Badge>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="text-sm font-medium">
                    Current Applications
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>18 applicants</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply for This Project</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professor Profile</CardTitle>
                <CardDescription>About the research supervisor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="/placeholder.svg?height=64&width=64"
                      alt="Dr. Richard Williams"
                    />
                    <AvatarFallback>RW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Dr. Richard Williams</div>
                    <div className="text-sm text-muted-foreground">
                      Professor of Physics
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Department of Physics, MIT
                    </div>
                  </div>
                </div>
                <p className="text-sm">
                  Dr. Williams specializes in quantum information theory and
                  quantum algorithms. His research focuses on developing new
                  quantum computing methods for solving complex problems.
                </p>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Research Interests</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Quantum Computing</Badge>
                    <Badge variant="outline">Quantum Algorithms</Badge>
                    <Badge variant="outline">Quantum Information Theory</Badge>
                  </div>
                </div>
                <div className="pt-2 text-sm">
                  <div className="font-medium mb-2">Current Projects</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Quantum Computing Algorithms (This project)</li>
                    <li>Quantum Error Correction Methods</li>
                    <li>Quantum Machine Learning Applications</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Similar Projects</CardTitle>
                <CardDescription>
                  You might also be interested in these
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Quantum Error Correction Methods",
                    professor: "Dr. Lisa Chen",
                    university: "Caltech",
                  },
                  {
                    title: "Quantum Machine Learning",
                    professor: "Dr. James Wilson",
                    university: "Stanford University",
                  },
                  {
                    title: "Quantum Cryptography Applications",
                    professor: "Dr. Michael Johnson",
                    university: "Princeton University",
                  },
                ].map((project, i) => (
                  <div
                    key={i}
                    className={`space-y-1 ${i < 2 ? "border-b pb-3" : ""}`}
                  >
                    <Link href="#" className="font-medium hover:underline">
                      {project.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {project.professor}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.university}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-lg font-semibold">ResearchConnect</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} ResearchConnect. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
