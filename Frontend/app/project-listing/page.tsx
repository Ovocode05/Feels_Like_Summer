import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Bookmark, Filter, Search, Star, Users } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ProjectListing() {
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
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">ResearchConnect</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center md:flex">
          <Link
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search projects</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Research Projects
            </h1>
            <p className="text-muted-foreground">
              Discover and apply for research opportunities across universities.
            </p>
          </div>
          <div className="mt-4 flex space-x-2 md:mt-0">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Bookmark className="mr-2 h-4 w-4" />
              Saved
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Star className="mr-2 h-4 w-4" />
              Popular
            </Button>
            <Button size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Narrow down your research project search.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Field</div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="computer-science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Specialization</div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      <SelectItem value="quantum-mechanics">
                        Quantum Mechanics
                      </SelectItem>
                      <SelectItem value="numerical-analysis">
                        Numerical Analysis
                      </SelectItem>
                      <SelectItem value="machine-learning">
                        Machine Learning
                      </SelectItem>
                      <SelectItem value="genetics">Genetics</SelectItem>
                      <SelectItem value="organic-chemistry">
                        Organic Chemistry
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">University</div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      <SelectItem value="mit">MIT</SelectItem>
                      <SelectItem value="stanford">
                        Stanford University
                      </SelectItem>
                      <SelectItem value="harvard">
                        Harvard University
                      </SelectItem>
                      <SelectItem value="berkeley">UC Berkeley</SelectItem>
                      <SelectItem value="caltech">Caltech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Duration</div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="short">
                        Short-term (1-3 months)
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium-term (3-6 months)
                      </SelectItem>
                      <SelectItem value="long">
                        Long-term (6+ months)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Position Type</div>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select position type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="credit">For Credit</SelectItem>
                      <SelectItem value="thesis">
                        Thesis/Dissertation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="grid w-full items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search projects, professors, keywords..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" variant="ghost">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                {[
                  {
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
                  },
                  {
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
                  },
                  {
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
                  },
                  {
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
                  },
                  {
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
                  },
                ].map((project, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.professor} • {project.university}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="/placeholder.svg?height=32&width=32"
                            alt={project.professor}
                          />
                          <AvatarFallback>
                            {(project.professor.split(" ").pop() ?? "")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">
                          {project.professor}
                        </div>
                      </div>
                      <Link href={`/project/${i + 1}`}>
                        <Button>View Project</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="new" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Neuromorphic Computing Systems</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Lisa Park • University of Washington
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/placeholder.svg?height=32&width=32"
                          alt="Dr. Lisa Park"
                        />
                        <AvatarFallback>LP</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">Dr. Lisa Park</div>
                    </div>
                    <Button>View Project</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="popular" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>CRISPR Gene Editing for Diseases</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Robert Zhang • Johns Hopkins University
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Using CRISPR-Cas9 technology to develop treatments for
                      genetic diseases through precise gene editing.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Field:
                        </div>
                        <Badge variant="outline">Biology</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Specialization:
                        </div>
                        <Badge variant="outline">Genetic Engineering</Badge>
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
                        <span className="text-sm font-medium">4</span>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          42 applicants
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        CRISPR
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Gene Editing
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Medical Research
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/placeholder.svg?height=32&width=32"
                          alt="Dr. Robert Zhang"
                        />
                        <AvatarFallback>RZ</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">
                        Dr. Robert Zhang
                      </div>
                    </div>
                    <Button>View Project</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Quantum Field Theory Applications</CardTitle>
                        <CardDescription className="mt-1">
                          Dr. Thomas Wilson • Princeton University
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/placeholder.svg?height=32&width=32"
                          alt="Dr. Thomas Wilson"
                        />
                        <AvatarFallback>TW</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">
                        Dr. Thomas Wilson
                      </div>
                    </div>
                    <Button>View Project</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-center space-x-2">
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
