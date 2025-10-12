"use client";

import { useEffect, useState } from "react";
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
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import MenubarStudent from "@/components/ui/menubar_student";
import { fetchProjects_active } from "@/api/api";

type ProjectType = {
  ID: number;
  pid: string;
  name: string;
  sdesc: string; // alternative short description field
  ldesc: string; // alternative long description field
  tags: string[];
  isActive: boolean | string;
  uid: string;
  user: {
    name: string;
    email: string;
    type: string;
  };
};

export default function ExplorePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<number[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProjects() {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetchProjects_active(token);
        if (res.projects && Array.isArray(res.projects)) {
          setProjects(res.projects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      }
      setLoading(false);
    }

    fetchAllProjects();
  }, []);

  const toggleSaveProject = (id: number) => {
    if (savedProjects.includes(id)) {
      setSavedProjects(savedProjects.filter((projectId) => projectId !== id));
    } else {
      setSavedProjects([...savedProjects, id]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
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
          {/* Sidebar Filters */}
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
              hidden={
                !isFilterOpen &&
                typeof window !== "undefined" &&
                window.innerWidth < 768
              }
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
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-dowed peer-disabled:opacity-70"
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

          {/* Main Project List */}
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
                {/* You can add more tabs if you want */}
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading projects...
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No projects found.
                  </div>
                ) : (
                  projects.map((project: ProjectType) => (
                    <Card key={project.pid} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {project.user?.name || "Unknown Professor"}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveProject(project.ID)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {savedProjects.includes(project.ID) ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground mb-4">
                          {project.sdesc}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Status:
                            </div>
                            <Badge
                              variant={
                                project.isActive ? "secondary" : "outline"
                              }
                            >
                              {project.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              Tags:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(project.tags || []).map(
                                (tag: string, idx: number) => (
                                  <Badge
                                    key={tag + idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="font-semibold mb-1">
                            Long Description
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {project.ldesc}
                          </div>
                        </div>
                      </CardContent>
                      <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-background flex items-center gap-1"
                          >
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>
                              {project.isActive ? "Active" : "Inactive"}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/project/${project.pid}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/student/apply/${project.pid}`}>
                            <Button size="sm">Apply</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
