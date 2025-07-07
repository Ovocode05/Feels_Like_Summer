"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuth from "@/hooks/useAuth";

export default function ExplorePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<number[]>([]);

  const toggleSaveProject = (id: number) => {
    if (savedProjects.includes(id)) {
      setSavedProjects(savedProjects.filter((projectId) => projectId !== id));
    } else {
      setSavedProjects([...savedProjects, id]);
    }
  };

  const { loading, authorized } = useAuth("prof");
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
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Explore
            </Link>
            {/* <Link href="/student/applications" className="text-sm font-medium underline-offset-4 hover:underline">
              My Applications
            </Link> */}
            <Link
              href="/student/resources"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/student/cv"
              className="text-sm font-medium underline-offset-4 hover:underline"
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
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Explore Projects
            </h1>
            <p className="text-muted-foreground">
              Find research opportunities that match your interests and
              qualifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student/explore/saved">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <BookmarkCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Saved Projects</span>
                <span className="inline sm:hidden">Saved</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Filters</span>
              <span className="inline sm:hidden">Filters</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Collapsible
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
            className="md:col-span-1 space-y-4 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <CollapsibleTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent
              className="space-y-4"
              forceMount={true}
              hidden={!isFilterOpen && window.innerWidth < 768}
            >
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Select>
                  <SelectTrigger id="field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sciences</SelectLabel>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="computer-science">
                        Computer Science
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Mathematics</SelectLabel>
                      <SelectItem value="pure-mathematics">
                        Pure Mathematics
                      </SelectItem>
                      <SelectItem value="applied-mathematics">
                        Applied Mathematics
                      </SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Other</SelectLabel>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="social-sciences">
                        Social Sciences
                      </SelectItem>
                      <SelectItem value="humanities">Humanities</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select>
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantum-mechanics">
                      Quantum Mechanics
                    </SelectItem>
                    <SelectItem value="quantum-computing">
                      Quantum Computing
                    </SelectItem>
                    <SelectItem value="machine-learning">
                      Machine Learning
                    </SelectItem>
                    <SelectItem value="artificial-intelligence">
                      Artificial Intelligence
                    </SelectItem>
                    <SelectItem value="numerical-analysis">
                      Numerical Analysis
                    </SelectItem>
                    <SelectItem value="organic-chemistry">
                      Organic Chemistry
                    </SelectItem>
                    <SelectItem value="molecular-biology">
                      Molecular Biology
                    </SelectItem>
                    <SelectItem value="genetics">Genetics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select>
                  <SelectTrigger id="university">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mit">MIT</SelectItem>
                    <SelectItem value="stanford">
                      Stanford University
                    </SelectItem>
                    <SelectItem value="harvard">Harvard University</SelectItem>
                    <SelectItem value="caltech">Caltech</SelectItem>
                    <SelectItem value="berkeley">UC Berkeley</SelectItem>
                    <SelectItem value="princeton">
                      Princeton University
                    </SelectItem>
                    <SelectItem value="oxford">Oxford University</SelectItem>
                    <SelectItem value="cambridge">
                      Cambridge University
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Short-term</span>
                  <span className="text-sm">Long-term</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>

              <div className="space-y-2">
                <Label>Position Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="paid" />
                    <label
                      htmlFor="paid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Paid
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="volunteer" />
                    <label
                      htmlFor="volunteer"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Volunteer
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="credit" />
                    <label
                      htmlFor="credit"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      For Credit
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="thesis" />
                    <label
                      htmlFor="thesis"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Thesis/Dissertation
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skill Match</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="skill-match" />
                  <Label htmlFor="skill-match" className="text-sm">
                    Show only projects matching my skills
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deadline</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="upcoming" />
                  <label
                    htmlFor="upcoming"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Upcoming deadlines (next 30 days)
                  </label>
                </div>
              </div>

              <Button className="w-full">Apply Filters</Button>
              <Button variant="outline" className="w-full">
                Reset
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects, professors, keywords..."
                  className="pl-8"
                />
              </div>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="deadline">Deadline (soonest)</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                All Fields
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Computer Science
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Physics
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Mathematics
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Biology
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Chemistry
              </Badge>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="deadline">Upcoming Deadlines</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {[
                  {
                    id: 1,
                    title: "Quantum Computing Algorithms",
                    description:
                      "Research on novel quantum algorithms for optimization problems and their practical implementations.",
                    field: "Physics",
                    specialization: "Quantum Computing",
                    professor: "Dr. Richard Williams",
                    university: "MIT",
                    deadline: "June 15, 2023",
                    positions: 2,
                    applicants: 18,
                    tags: [
                      "Quantum Physics",
                      "Algorithm Design",
                      "Optimization",
                    ],
                    match: 98,
                  },
                  {
                    id: 2,
                    title: "Advanced Machine Learning for Climate Models",
                    description:
                      "Developing machine learning models to improve climate prediction accuracy and identify patterns in climate data.",
                    field: "Computer Science",
                    specialization: "Machine Learning",
                    professor: "Dr. Sarah Lee",
                    university: "Stanford University",
                    deadline: "June 30, 2023",
                    positions: 3,
                    applicants: 24,
                    tags: ["AI", "Climate Science", "Data Analysis"],
                    match: 95,
                  },
                  {
                    id: 3,
                    title: "Number Theory in Cryptography",
                    description:
                      "Exploring applications of number theory in modern cryptographic protocols and security systems.",
                    field: "Mathematics",
                    specialization: "Number Theory",
                    professor: "Dr. James Chen",
                    university: "Harvard University",
                    deadline: "July 5, 2023",
                    positions: 1,
                    applicants: 12,
                    tags: ["Number Theory", "Cryptography", "Security"],
                    match: 87,
                  },
                  {
                    id: 4,
                    title: "Neural Networks for Speech Recognition",
                    description:
                      "Improving speech recognition accuracy through advanced neural network architectures and training methods.",
                    field: "Computer Science",
                    specialization: "Neural Networks",
                    professor: "Dr. Emily Rodriguez",
                    university: "UC Berkeley",
                    deadline: "July 10, 2023",
                    positions: 2,
                    applicants: 15,
                    tags: ["Speech Recognition", "Neural Networks", "NLP"],
                    match: 92,
                  },
                  {
                    id: 5,
                    title:
                      "Genetically Modified Organisms for Sustainable Agriculture",
                    description:
                      "Researching genetic modifications that can improve crop yield and resistance to environmental stressors.",
                    field: "Biology",
                    specialization: "Genetics",
                    professor: "Dr. Michael Johnson",
                    university: "Caltech",
                    deadline: "July 15, 2023",
                    positions: 3,
                    applicants: 10,
                    tags: ["Genetics", "Agriculture", "Sustainability"],
                    match: 78,
                  },
                ].map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.professor} • {project.university}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSaveProject(project.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {savedProjects.includes(project.id) ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            Field:
                          </div>
                          <Badge variant="outline">{project.field}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            Specialization:
                          </div>
                          <Badge variant="outline">
                            {project.specialization}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            Deadline:
                          </div>
                          <span className="text-sm font-medium">
                            {project.deadline}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">
                            Positions:
                          </div>
                          <span className="text-sm font-medium">
                            {project.positions}
                          </span>
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project.applicants} applicants
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map((tag, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-background flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{project.match}% match</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/project/${project.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/student/apply/${project.id}`}>
                          <Button size="sm">Apply</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="recommended" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Deep Learning for Medical Imaging</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Maria Garcia • Stanford University
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Developing advanced deep learning models for medical image
                      analysis to improve disease diagnosis and treatment
                      planning.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Field:
                        </div>
                        <Badge variant="outline">Computer Science</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Specialization:
                        </div>
                        <Badge variant="outline">Deep Learning</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Deadline:
                        </div>
                        <span className="text-sm font-medium">
                          July 20, 2023
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Positions:
                        </div>
                        <span className="text-sm font-medium">2</span>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          8 applicants
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Deep Learning
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Medical Imaging
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Healthcare
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-background flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>98% match</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="new" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Neuromorphic Computing Systems</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Lisa Park • University of Washington
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Developing computing architectures inspired by the human
                      brain to enable more efficient AI processing.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Field:
                        </div>
                        <Badge variant="outline">Computer Engineering</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Specialization:
                        </div>
                        <Badge variant="outline">Neuromorphic Computing</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Deadline:
                        </div>
                        <span className="text-sm font-medium">
                          August 1, 2023
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Positions:
                        </div>
                        <span className="text-sm font-medium">2</span>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          5 applicants
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Neuromorphic
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        AI Hardware
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Computing Architecture
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-background flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>85% match</span>
                      </Badge>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="deadline" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Quantum Field Theory Applications</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Thomas Wilson • Princeton University
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Exploring applications of quantum field theory in
                      condensed matter physics and high-energy experiments.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Field:
                        </div>
                        <Badge variant="outline">Physics</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Specialization:
                        </div>
                        <Badge variant="outline">Quantum Field Theory</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Deadline:
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Tomorrow
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Positions:
                        </div>
                        <span className="text-sm font-medium">2</span>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          14 applicants
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Quantum Physics
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Field Theory
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Condensed Matter
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-background flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>82% match</span>
                      </Badge>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center space-x-2 pt-4">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                1
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                2
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface BellProps extends React.SVGProps<SVGSVGElement> {}

function Bell(props: BellProps) {
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
