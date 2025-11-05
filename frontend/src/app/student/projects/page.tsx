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
import { fetchProjects_active, getMyApplications } from "@/api/api";
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

type ApplicationType = {
  ID: number;
  PID: string;
  status: string;
};

export default function ExplorePage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<string>>(new Set());

  // search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // filter states
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [durationSlider, setDurationSlider] = useState<number[]>([0]); // 0=any, 1=short, 2=medium, 3=long
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<string[]>(
    []
  );
  const [upcomingDeadlineOnly, setUpcomingDeadlineOnly] = useState(false);

  // Specialization options based on field of study
  const specializationsByField: Record<string, { value: string; label: string }[]> = {
    "": [
      { value: "all", label: "All Specializations" },
    ],
    physics: [
      { value: "all", label: "All Specializations" },
      { value: "quantum-mechanics", label: "Quantum Mechanics" },
      { value: "quantum-computing", label: "Quantum Computing" },
      { value: "astrophysics", label: "Astrophysics" },
      { value: "condensed-matter", label: "Condensed Matter Physics" },
      { value: "particle-physics", label: "Particle Physics" },
      { value: "optics", label: "Optics and Photonics" },
    ],
    chemistry: [
      { value: "all", label: "All Specializations" },
      { value: "organic-chemistry", label: "Organic Chemistry" },
      { value: "inorganic-chemistry", label: "Inorganic Chemistry" },
      { value: "physical-chemistry", label: "Physical Chemistry" },
      { value: "analytical-chemistry", label: "Analytical Chemistry" },
      { value: "biochemistry", label: "Biochemistry" },
    ],
    biology: [
      { value: "all", label: "All Specializations" },
      { value: "molecular-biology", label: "Molecular Biology" },
      { value: "genetics", label: "Genetics" },
      { value: "microbiology", label: "Microbiology" },
      { value: "ecology", label: "Ecology" },
      { value: "neuroscience", label: "Neuroscience" },
      { value: "bioinformatics", label: "Bioinformatics" },
    ],
    "computer-science": [
      { value: "all", label: "All Specializations" },
      { value: "machine-learning", label: "Machine Learning" },
      { value: "artificial-intelligence", label: "Artificial Intelligence" },
      { value: "computer-vision", label: "Computer Vision" },
      { value: "natural-language-processing", label: "Natural Language Processing" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "distributed-systems", label: "Distributed Systems" },
      { value: "human-computer-interaction", label: "Human-Computer Interaction" },
    ],
    "pure-mathematics": [
      { value: "all", label: "All Specializations" },
      { value: "algebra", label: "Algebra" },
      { value: "topology", label: "Topology" },
      { value: "number-theory", label: "Number Theory" },
      { value: "geometry", label: "Geometry" },
      { value: "analysis", label: "Analysis" },
    ],
    "applied-mathematics": [
      { value: "all", label: "All Specializations" },
      { value: "numerical-analysis", label: "Numerical Analysis" },
      { value: "mathematical-modeling", label: "Mathematical Modeling" },
      { value: "optimization", label: "Optimization" },
      { value: "dynamical-systems", label: "Dynamical Systems" },
    ],
    statistics: [
      { value: "all", label: "All Specializations" },
      { value: "statistical-learning", label: "Statistical Learning" },
      { value: "bayesian-statistics", label: "Bayesian Statistics" },
      { value: "data-science", label: "Data Science" },
      { value: "biostatistics", label: "Biostatistics" },
    ],
    engineering: [
      { value: "all", label: "All Specializations" },
      { value: "electrical-engineering", label: "Electrical Engineering" },
      { value: "mechanical-engineering", label: "Mechanical Engineering" },
      { value: "civil-engineering", label: "Civil Engineering" },
      { value: "chemical-engineering", label: "Chemical Engineering" },
      { value: "biomedical-engineering", label: "Biomedical Engineering" },
    ],
    "social-sciences": [
      { value: "all", label: "All Specializations" },
      { value: "psychology", label: "Psychology" },
      { value: "sociology", label: "Sociology" },
      { value: "economics", label: "Economics" },
      { value: "political-science", label: "Political Science" },
      { value: "anthropology", label: "Anthropology" },
    ],
    humanities: [
      { value: "all", label: "All Specializations" },
      { value: "history", label: "History" },
      { value: "philosophy", label: "Philosophy" },
      { value: "literature", label: "Literature" },
      { value: "linguistics", label: "Linguistics" },
    ],
    "environmental-science": [
      { value: "all", label: "All Specializations" },
      { value: "climate-science", label: "Climate Science" },
      { value: "conservation", label: "Conservation" },
      { value: "sustainability", label: "Sustainability" },
    ],
    "materials-science": [
      { value: "all", label: "All Specializations" },
      { value: "nanomaterials", label: "Nanomaterials" },
      { value: "polymers", label: "Polymers" },
      { value: "biomaterials", label: "Biomaterials" },
    ],
    "earth-sciences": [
      { value: "all", label: "All Specializations" },
      { value: "geology", label: "Geology" },
      { value: "geophysics", label: "Geophysics" },
      { value: "oceanography", label: "Oceanography" },
    ],
  };

  useEffect(() => {
    async function fetchAllProjects() {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      try {
        // Fetch all active projects
        const res = await fetchProjects_active(token);
        if (res.projects && Array.isArray(res.projects)) {
          setProjects(res.projects);
          setFilteredProjects(res.projects);
        } else {
          setProjects([]);
          setFilteredProjects([]);
        }

        // Fetch student's applications
        try {
          const applicationsRes = await getMyApplications(token);
          if (applicationsRes.applications && Array.isArray(applicationsRes.applications)) {
            const appliedIds = new Set<string>(
              applicationsRes.applications.map((app: ApplicationType) => app.PID)
            );
            setAppliedProjectIds(appliedIds);
          }
        } catch (appError) {
          console.error("Error fetching applications:", appError);
          // Continue even if applications fetch fails
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
      } catch {
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
    if (selectedSpecialization && selectedSpecialization !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.specialization?.toLowerCase() ===
          selectedSpecialization.toLowerCase()
      );
    }

    // Apply duration filter (0=any, 1=short-term, 2=medium-term, 3=long-term)
    if (durationSlider[0] !== 0) {
      filtered = filtered.filter((p) => {
        if (!p.duration) return false;
        const duration = p.duration.toLowerCase();
        
        if (durationSlider[0] === 1) {
          // Short-term (1-3 months)
          return duration.includes("short-term");
        } else if (durationSlider[0] === 2) {
          // Medium-term (3-6 months)
          return duration.includes("medium-term");
        } else if (durationSlider[0] === 3) {
          // Long-term (6+ months)
          return duration.includes("long-term");
        }
        return false;
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
    setSelectedSpecialization("all");
    setDurationSlider([0]); // Reset to "any duration"
    setSelectedPositionTypes([]);
    setUpcomingDeadlineOnly(false);
    setSearchQuery("");
  };

  // update filteredProjects when filters change
  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    projects,
    selectedField,
    selectedSpecialization,
    durationSlider,
    selectedPositionTypes,
    upcomingDeadlineOnly,
  ]);

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
                <Select value={selectedField} onValueChange={(value) => {
                  setSelectedField(value);
                  setSelectedSpecialization("all");
                }}>
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
                      <SelectItem value="environmental-science">
                        Environmental Science
                      </SelectItem>
                      <SelectItem value="materials-science">
                        Materials Science
                      </SelectItem>
                      <SelectItem value="earth-sciences">
                        Earth Sciences
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  key={selectedField}
                  value={selectedSpecialization}
                  onValueChange={setSelectedSpecialization}
                >
                  <SelectTrigger id="specialization">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {(specializationsByField[selectedField] || specializationsByField[""]).map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="duration">Duration</Label>
                <div className="space-y-3">
                  <Slider
                    id="duration"
                    value={durationSlider}
                    onValueChange={setDurationSlider}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
                    <div className={`text-center ${durationSlider[0] === 0 ? "font-semibold text-primary" : ""}`}>
                      <div>Any</div>
                      <div className="text-[10px]">&nbsp;</div>
                    </div>
                    <div className={`text-center ${durationSlider[0] === 1 ? "font-semibold text-primary" : ""}`}>
                      <div>Short</div>
                      <div className="text-[10px]">(1-3 mo)</div>
                    </div>
                    <div className={`text-center ${durationSlider[0] === 2 ? "font-semibold text-primary" : ""}`}>
                      <div>Medium</div>
                      <div className="text-[10px]">(3-6 mo)</div>
                    </div>
                    <div className={`text-center ${durationSlider[0] === 3 ? "font-semibold text-primary" : ""}`}>
                      <div>Long</div>
                      <div className="text-[10px]">(6+ mo)</div>
                    </div>
                  </div>
                </div>
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
                          setSelectedPositionTypes([
                            ...selectedPositionTypes,
                            "paid",
                          ]);
                        } else {
                          setSelectedPositionTypes(
                            selectedPositionTypes.filter((t) => t !== "paid")
                          );
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
                          setSelectedPositionTypes([
                            ...selectedPositionTypes,
                            "volunteer",
                          ]);
                        } else {
                          setSelectedPositionTypes(
                            selectedPositionTypes.filter(
                              (t) => t !== "volunteer"
                            )
                          );
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
                          setSelectedPositionTypes([
                            ...selectedPositionTypes,
                            "credit",
                          ]);
                        } else {
                          setSelectedPositionTypes(
                            selectedPositionTypes.filter((t) => t !== "credit")
                          );
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
                          setSelectedPositionTypes([
                            ...selectedPositionTypes,
                            "thesis",
                          ]);
                        } else {
                          setSelectedPositionTypes(
                            selectedPositionTypes.filter((t) => t !== "thesis")
                          );
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
                    onCheckedChange={(checked) =>
                      setUpcomingDeadlineOnly(!!checked)
                    }
                  />
                  <label
                    htmlFor="upcoming"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Upcoming deadlines (next 30 days)
                  </label>
                </div>
              </div>

              <Button className="w-full" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
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
                  filteredProjects.map((project: ProjectType) => {
                    const hasApplied = appliedProjectIds.has(project.pid);
                    return (
                    <Card key={project.pid} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>{project.name}</CardTitle>
                              {hasApplied && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  Applied
                                </Badge>
                              )}
                            </div>
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
                        {(project.fieldOfStudy ||
                          project.specialization ||
                          project.duration ||
                          (project.positionType &&
                            project.positionType.length > 0) ||
                          project.deadline) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="font-semibold mb-2">
                              Project Details
                            </div>
                            <div className="grid gap-2 text-sm">
                              {project.fieldOfStudy && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Field:
                                  </span>
                                  <Badge variant="secondary">
                                    {project.fieldOfStudy}
                                  </Badge>
                                </div>
                              )}
                              {project.specialization && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Specialization:
                                  </span>
                                  <Badge variant="secondary">
                                    {project.specialization}
                                  </Badge>
                                </div>
                              )}
                              {project.duration && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Duration:
                                  </span>
                                  <Badge variant="secondary">
                                    {project.duration}
                                  </Badge>
                                </div>
                              )}
                              {project.positionType &&
                                project.positionType.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground">
                                      Position Type:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {project.positionType.map(
                                        (type: string, idx: number) => (
                                          <Badge
                                            key={type + idx}
                                            variant="outline"
                                          >
                                            {type}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              {project.deadline && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    Deadline:
                                  </span>
                                  <Badge variant="destructive">
                                    {new Date(
                                      project.deadline
                                    ).toLocaleDateString()}
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
                  );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
