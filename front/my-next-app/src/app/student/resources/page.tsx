"use client";

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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  BookText,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  History,
  Lightbulb,
  Menu,
  MessageSquare,
  Route,
  Search,
  Star,
  Trophy,
  Video,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import MenubarStudent from "@/components/ui/menubar_student";

export default function ResourcesPage() {
  const { loading, authorized } = useAuth("student");
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Unauthorized
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Research Resources
            </h1>
            <p className="text-muted-foreground">
              Learning materials, roadmaps, and tools to help you succeed in
              your research journey.
            </p>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-8 w-full md:w-[260px]"
            />
          </div>
        </div>

        <Tabs defaultValue="roadmaps" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roadmaps" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Research Roadmaps</span>
              <span className="inline sm:hidden">Roadmaps</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <BookText className="h-4 w-4" />
              <span className="hidden sm:inline">Learning Materials</span>
              <span className="inline sm:hidden">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="hackathons" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Past Hackathons</span>
              <span className="inline sm:hidden">Hackathons</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Research Tools</span>
              <span className="inline sm:hidden">Tools</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="roadmaps" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Quantum Computing Research Path",
                  description:
                    "A comprehensive guide to becoming a quantum computing researcher.",
                  author: "Dr. Richard Williams",
                  university: "MIT",
                  level: "Intermediate",
                  duration: "12-18 months",
                  field: "Physics",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Machine Learning in Research",
                  description:
                    "Step-by-step guide to applying machine learning techniques in scientific research.",
                  author: "Dr. Sarah Lee",
                  university: "Stanford University",
                  level: "Beginner to Advanced",
                  duration: "6-12 months",
                  field: "Computer Science",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Number Theory Research Roadmap",
                  description:
                    "A structured path to becoming proficient in number theory research.",
                  author: "Dr. James Chen",
                  university: "Harvard University",
                  level: "Advanced",
                  duration: "24 months",
                  field: "Mathematics",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Computational Biology Research Path",
                  description:
                    "Guide to developing skills for computational biology and bioinformatics research.",
                  author: "Dr. Emily Rodriguez",
                  university: "UC Berkeley",
                  level: "Intermediate",
                  duration: "12 months",
                  field: "Biology",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Organic Chemistry Research Fundamentals",
                  description:
                    "Essential knowledge and techniques for organic chemistry research.",
                  author: "Dr. Michael Johnson",
                  university: "Caltech",
                  level: "Beginner to Intermediate",
                  duration: "9 months",
                  field: "Chemistry",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Neural Networks Research Progression",
                  description:
                    "From basics to cutting-edge research in neural networks and deep learning.",
                  author: "Dr. Lisa Park",
                  university: "University of Washington",
                  level: "Beginner to Advanced",
                  duration: "18 months",
                  field: "Computer Science",
                  icon: <Route className="h-8 w-8 text-primary" />,
                },
              ].map((roadmap, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">{roadmap.field}</Badge>
                        <CardTitle>{roadmap.title}</CardTitle>
                        <CardDescription>{roadmap.description}</CardDescription>
                      </div>
                      <div>{roadmap.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Created by {roadmap.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{roadmap.university}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{roadmap.level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{roadmap.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Roadmap</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="materials" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Introduction to Quantum Computing",
                  type: "Course",
                  author: "Dr. Richard Williams",
                  university: "MIT",
                  format: "Video Lectures",
                  duration: "10 hours",
                  field: "Physics",
                  icon: <Video className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Machine Learning Fundamentals",
                  type: "Reading List",
                  author: "Dr. Sarah Lee",
                  university: "Stanford University",
                  format: "PDF Collection",
                  duration: "Self-paced",
                  field: "Computer Science",
                  icon: <BookText className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Research Methodology in Computer Science",
                  type: "Workshop",
                  author: "Dr. James Chen",
                  university: "Harvard University",
                  format: "Interactive Sessions",
                  duration: "8 weeks",
                  field: "Computer Science",
                  icon: <History className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Statistical Methods for Research",
                  type: "Course",
                  author: "Dr. Emily Rodriguez",
                  university: "UC Berkeley",
                  format: "Video Lectures & Exercises",
                  duration: "12 hours",
                  field: "Mathematics",
                  icon: <Video className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Scientific Writing for Publications",
                  type: "Guide",
                  author: "Dr. Michael Johnson",
                  university: "Caltech",
                  format: "PDF Guide",
                  duration: "Self-paced",
                  field: "General",
                  icon: <FileText className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Deep Learning for Computer Vision",
                  type: "Course",
                  author: "Dr. Lisa Park",
                  university: "University of Washington",
                  format: "Video Lectures & Code Labs",
                  duration: "15 hours",
                  field: "Computer Science",
                  icon: <Video className="h-8 w-8 text-primary" />,
                },
              ].map((material, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">{material.field}</Badge>
                        <CardTitle>{material.title}</CardTitle>
                        <CardDescription>{material.type}</CardDescription>
                      </div>
                      <div>{material.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">By {material.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{material.university}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{material.format}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{material.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Access
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="hackathons" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Climate Data Hackathon",
                  description:
                    "Develop innovative solutions to climate challenges using real-world data sets.",
                  organizer: "Stanford University",
                  date: "June 10-12, 2023",
                  participants: 120,
                  field: "Environmental Science",
                  problemStatements: 5,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
                {
                  title: "AI for Healthcare Hackathon",
                  description:
                    "Create AI solutions to improve healthcare delivery and patient outcomes.",
                  organizer: "MIT",
                  date: "May 15-17, 2023",
                  participants: 150,
                  field: "Healthcare",
                  problemStatements: 4,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Quantum Computing Challenge",
                  description:
                    "Solve complex optimization problems using quantum algorithms.",
                  organizer: "IBM & Caltech",
                  date: "April 22-24, 2023",
                  participants: 80,
                  field: "Quantum Computing",
                  problemStatements: 3,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Sustainable Energy Hackathon",
                  description:
                    "Develop solutions for renewable energy storage and distribution.",
                  organizer: "UC Berkeley",
                  date: "March 18-20, 2023",
                  participants: 100,
                  field: "Energy",
                  problemStatements: 4,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Genomics Data Challenge",
                  description:
                    "Analyze genomic data to identify patterns related to disease risk.",
                  organizer: "Harvard University",
                  date: "February 25-27, 2023",
                  participants: 90,
                  field: "Genomics",
                  problemStatements: 3,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Smart Cities Hackathon",
                  description:
                    "Create innovative solutions for urban challenges using IoT and data analytics.",
                  organizer: "University of Washington",
                  date: "January 20-22, 2023",
                  participants: 110,
                  field: "Urban Planning",
                  problemStatements: 5,
                  icon: <Trophy className="h-8 w-8 text-primary" />,
                },
              ].map((hackathon, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">{hackathon.field}</Badge>
                        <CardTitle>{hackathon.title}</CardTitle>
                        <CardDescription>
                          {hackathon.description}
                        </CardDescription>
                      </div>
                      <div>{hackathon.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Organized by {hackathon.organizer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{hackathon.date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {hackathon.problemStatements} Problem Statements
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {hackathon.participants} Participants
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Problem Statements</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Research Paper Finder",
                  description:
                    "Advanced search tool for finding relevant research papers across multiple databases.",
                  category: "Literature Review",
                  pricing: "Free",
                  rating: 4.8,
                  reviews: 245,
                  icon: <Search className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Citation Manager",
                  description:
                    "Organize and format citations for your research papers and publications.",
                  category: "Writing",
                  pricing: "Free / Premium",
                  rating: 4.7,
                  reviews: 320,
                  icon: <FileText className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Data Visualization Suite",
                  description:
                    "Create professional charts, graphs, and visualizations for your research data.",
                  category: "Data Analysis",
                  pricing: "Free Trial",
                  rating: 4.6,
                  reviews: 189,
                  icon: <BarChart className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Statistical Analysis Tool",
                  description:
                    "Comprehensive statistical analysis package for research data.",
                  category: "Data Analysis",
                  pricing: "Free / Premium",
                  rating: 4.9,
                  reviews: 276,
                  icon: <PieChart className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Research Project Manager",
                  description:
                    "Organize your research workflow, tasks, and collaborations.",
                  category: "Project Management",
                  pricing: "Free",
                  rating: 4.5,
                  reviews: 152,
                  icon: <ClipboardList className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Lab Notebook",
                  description:
                    "Digital lab notebook for documenting experiments and research findings.",
                  category: "Documentation",
                  pricing: "Free / Premium",
                  rating: 4.7,
                  reviews: 198,
                  icon: <BookText className="h-8 w-8 text-primary" />,
                },
              ].map((tool, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline">{tool.category}</Badge>
                        <CardTitle>{tool.title}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </div>
                      <div>{tool.icon}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{tool.pricing}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">
                          {tool.rating} ({tool.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Learn More</Button>
                    <Button>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Access Tool
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Featured Research Guides
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How to Write a Research Proposal
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <p>
                    A well-crafted research proposal is essential for securing
                    funding, approval, and support for your research project.
                    This guide walks you through the key components of an
                    effective research proposal.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Components:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Title and Abstract</li>
                      <li>Introduction and Background</li>
                      <li>Research Questions and Objectives</li>
                      <li>Literature Review</li>
                      <li>Methodology</li>
                      <li>Timeline and Resources</li>
                      <li>Expected Outcomes and Significance</li>
                      <li>References</li>
                    </ul>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Guide
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Effective Literature Review Techniques
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <p>
                    A comprehensive literature review is the foundation of good
                    research. This guide provides strategies for conducting
                    efficient and thorough literature reviews.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">What You'll Learn:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Defining your search scope and parameters</li>
                      <li>Using academic databases effectively</li>
                      <li>Organizing and categorizing literature</li>
                      <li>Critical analysis of research papers</li>
                      <li>Identifying research gaps</li>
                      <li>Synthesizing information across multiple sources</li>
                    </ul>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Guide
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Research Data Management Best Practices
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <p>
                    Proper data management is crucial for research integrity and
                    reproducibility. Learn how to effectively collect, store,
                    and manage research data.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Topics Covered:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Data collection planning</li>
                      <li>Storage and backup strategies</li>
                      <li>Data organization and documentation</li>
                      <li>Data security and privacy</li>
                      <li>Version control</li>
                      <li>Data sharing and publication</li>
                    </ul>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Guide
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Publishing Your First Research Paper
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <p>
                    Navigate the process of publishing your research in academic
                    journals with this comprehensive guide for first-time
                    authors.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Guide Contents:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Selecting the right journal</li>
                      <li>Understanding journal requirements</li>
                      <li>Structuring your paper</li>
                      <li>Writing clear and concise abstracts</li>
                      <li>Navigating the peer review process</li>
                      <li>Responding to reviewer comments</li>
                      <li>Publication ethics</li>
                    </ul>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Guide
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Recommended by Professors
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Essential Papers in Quantum Computing",
                description:
                  "A curated collection of foundational and recent papers in quantum computing.",
                professor: "Dr. Richard Williams",
                university: "MIT",
                type: "Reading List",
                items: 15,
                field: "Physics",
              },
              {
                title: "Machine Learning Research Methodology",
                description:
                  "Comprehensive guide to research methods in machine learning and AI.",
                professor: "Dr. Sarah Lee",
                university: "Stanford University",
                type: "Course Materials",
                items: 8,
                field: "Computer Science",
              },
              {
                title: "Mathematical Proofs: Techniques and Examples",
                description:
                  "Learn essential proof techniques used in mathematical research.",
                professor: "Dr. James Chen",
                university: "Harvard University",
                type: "Tutorial Series",
                items: 12,
                field: "Mathematics",
              },
            ].map((resource, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src="/placeholder.svg?height=24&width=24"
                          alt={resource.professor}
                        />
                        <AvatarFallback>
                          {(resource.professor.split(" ").pop() ?? "")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{resource.professor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{resource.university}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{resource.field}</Badge>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Resource</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function PieChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function Tag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
