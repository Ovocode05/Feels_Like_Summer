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
import { ChevronDown, Search, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import MenubarStudent from "@/components/ui/menubar_student";
import { fetchProjects_active } from "@/api/api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

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
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

export default function ExplorePage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  // search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // filter states
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  const [durationValue, setDurationValue] = useState<number[]>([50]);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<string[]>([]);
  const [upcomingDeadlineOnly, setUpcomingDeadlineOnly] = useState(false);

  useEffect(() => {
    async function fetchAllProjects() {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      try {
        const res = await fetchProjects_active(token);
        if (res.projects && Array.isArray(res.projects)) {
          setProjects(res.projects);
          setFilteredProjects(res.projects);
        } else {
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setFilteredProjects([]);
      }
      setLoading(false);
    }

    fetchAllProjects();
  }, []);

  // Apply filters function
  const applyFilters = () => {
    let filtered = [...projects];

    // Apply search query
    if (searchQuery) {
      let pattern: RegExp | null = null;
      try {
        pattern = new RegExp(searchQuery, "i");
      } catch (err) {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pattern = new RegExp(escaped, "i");
      }

      filtered = filtered.filter((p) => {
        const haystack = [
          p.name || "",
          p.sdesc || "",
          p.ldesc || "",
          p.user?.name || "",
          (p.tags || []).join(" "),
        ].join(" ");
        if (pattern!.test(haystack)) return true;
        return (p.tags || []).some((t) => pattern!.test(t));
      });
    }

    // Apply field of study filter
    if (selectedField) {
      filtered = filtered.filter(
        (p) => p.fieldOfStudy?.toLowerCase() === selectedField.toLowerCase()
      );
    }

    // Apply specialization filter
    if (selectedSpecialization) {
      filtered = filtered.filter(
        (p) => p.specialization?.toLowerCase() === selectedSpecialization.toLowerCase()
      );
    }

    // Apply duration filter (0-33: short, 34-66: medium, 67-100: long)
    if (durationValue[0] !== 50) {
      filtered = filtered.filter((p) => {
        if (!p.duration) return false;
        const duration = p.duration.toLowerCase();
        
        if (durationValue[0] <= 33) {
          return duration.includes("short") || duration.includes("1-3 months") || duration.includes("< 3 months");
        } else if (durationValue[0] <= 66) {
          return duration.includes("medium") || duration.includes("3-6 months") || duration.includes("6 months");
        } else {
          return duration.includes("long") || duration.includes("> 6 months") || duration.includes("1 year") || duration.includes("year");
        }
      });
    }

    // Apply position type filter
    if (selectedPositionTypes.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.positionType || p.positionType.length === 0) return false;
        return selectedPositionTypes.some((selectedType) =>
          p.positionType!.some((pType) =>
            pType.toLowerCase().includes(selectedType.toLowerCase())
          )
        );
      });
    }

    // Apply upcoming deadline filter
    if (upcomingDeadlineOnly) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filtered = filtered.filter((p) => {
        if (!p.deadline) return false;
        const deadlineDate = new Date(p.deadline);
        return deadlineDate >= new Date() && deadlineDate <= thirtyDaysFromNow;
      });
    }

    setFilteredProjects(filtered);
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedField("");
    setSelectedSpecialization("");
    setDurationValue([50]);
    setSelectedPositionTypes([]);
    setUpcomingDeadlineOnly(false);
    setSearchQuery("");
  };

  // update filteredProjects when filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, projects, selectedField, selectedSpecialization, durationValue, selectedPositionTypes, upcomingDeadlineOnly]);

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string };
    if (decoded.type !== "stu") {
      router.push("/login");
      return;
    }
    setIsAuth(true);
  }, [router]);

  if (!isAuth) {
    // Optionally show a loading spinner here
    return null;
  }

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
                <Select value={selectedField} onValueChange={setSelectedField}>
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
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
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

              {/* <div className="space-y-2">
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
              </div> */}

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Short-term</span>
                  <span className="text-sm">Long-term</span>
                </div>
                <Slider 
                  value={durationValue} 
                  onValueChange={setDurationValue}
                  max={100} 
                  step={1} 
                />
              </div>

              <div className="space-y-2">
                <Label>Position Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="paid" 
                      checked={selectedPositionTypes.includes("paid")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPositionTypes([...selectedPositionTypes, "paid"]);
                        } else {
                          setSelectedPositionTypes(selectedPositionTypes.filter(t => t !== "paid"));
                        }
                      }}
                    />
                    <label
                      htmlFor="paid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Paid
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="volunteer" 
                      checked={selectedPositionTypes.includes("volunteer")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPositionTypes([...selectedPositionTypes, "volunteer"]);
                        } else {
                          setSelectedPositionTypes(selectedPositionTypes.filter(t => t !== "volunteer"));
                        }
                      }}
                    />
                    <label
                      htmlFor="volunteer"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-dowed peer-disabled:opacity-70"
                    >
                      Volunteer
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="credit" 
                      checked={selectedPositionTypes.includes("credit")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPositionTypes([...selectedPositionTypes, "credit"]);
                        } else {
                          setSelectedPositionTypes(selectedPositionTypes.filter(t => t !== "credit"));
                        }
                      }}
                    />
                    <label
                      htmlFor="credit"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      For Credit
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="thesis" 
                      checked={selectedPositionTypes.includes("thesis")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPositionTypes([...selectedPositionTypes, "thesis"]);
                        } else {
                          setSelectedPositionTypes(selectedPositionTypes.filter(t => t !== "thesis"));
                        }
                      }}
                    />
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
                  <Checkbox 
                    id="upcoming" 
                    checked={upcomingDeadlineOnly}
                    onCheckedChange={(checked) => setUpcomingDeadlineOnly(!!checked)}
                  />
                  <label
                    htmlFor="upcoming"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Upcoming deadlines (next 30 days)
                  </label>
                </div>
              </div>

              <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" className="w-full" onClick={resetFilters}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No projects found.
                  </div>
                ) : (
                  filteredProjects.map((project: ProjectType) => (
                    <Card key={project.pid} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {project.user?.name || "Unknown Professor"}
                            </CardDescription>
                          </div>
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
                        {(project.fieldOfStudy || project.specialization || project.duration || 
                          (project.positionType && project.positionType.length > 0) || project.deadline) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="font-semibold mb-2">Project Details</div>
                            <div className="grid gap-2 text-sm">
                              {project.fieldOfStudy && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Field:</span>
                                  <Badge variant="secondary">{project.fieldOfStudy}</Badge>
                                </div>
                              )}
                              {project.specialization && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Specialization:</span>
                                  <Badge variant="secondary">{project.specialization}</Badge>
                                </div>
                              )}
                              {project.duration && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Duration:</span>
                                  <Badge variant="secondary">{project.duration}</Badge>
                                </div>
                              )}
                              {project.positionType && project.positionType.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground">Position Type:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {project.positionType.map((type: string, idx: number) => (
                                      <Badge key={type + idx} variant="outline">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {project.deadline && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Deadline:</span>
                                  <Badge variant="destructive">
                                    {new Date(project.deadline).toLocaleDateString()}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                            <Button size="sm">View Details</Button>
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
