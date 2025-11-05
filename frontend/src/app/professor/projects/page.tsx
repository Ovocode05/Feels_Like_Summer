"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ClipboardList,
  Filter,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import Header from "@/components/ui/manual_navbar_prof";
import {
  createProject,
  deleteProject,
  fetchProjects_active_my,
} from "@/api/api";
import { jwtDecode } from "jwt-decode";

const projectFormSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  sdesc: z.string().min(1, { message: "Short description is required" }),
  ldesc: z.string().min(1, { message: "Long description is required" }),
  isActive: z.boolean(),
  tags: z.array(z.string()).optional(),
  working_users: z.array(z.string()).optional(),
  fieldOfStudy: z.string().optional(),
  specialization: z.string().optional(),
  duration: z.string().optional(),
  positionType: z.array(z.string()).optional(),
  deadline: z.string().optional().refine(
    (date) => {
      if (!date) return true; // Allow empty deadline
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "Application deadline cannot be a past date" }
  ),
});

type Project_type = {
  ID: number;
  name: string;
  sdesc: string;
  ldesc: string;
  isActive: boolean;
  tags?: string[];
  working_users?: string[];
  pid: string;
  uid: string;
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

export default function ProfessorProjectsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [projects, setProjects] = useState<Project_type[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<null | Project_type>(
    null
  );
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [showDeletedPopup, setShowDeletedPopup] = useState(false);
  const deletedPopupTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [selectedFieldInForm, setSelectedFieldInForm] = useState("");

  // Specialization options based on field of study
  const specializationsByField: Record<string, { value: string; label: string }[]> = {
    physics: [
      { value: "quantum-mechanics", label: "Quantum Mechanics" },
      { value: "quantum-computing", label: "Quantum Computing" },
      { value: "astrophysics", label: "Astrophysics" },
      { value: "condensed-matter", label: "Condensed Matter Physics" },
      { value: "particle-physics", label: "Particle Physics" },
      { value: "optics", label: "Optics and Photonics" },
    ],
    chemistry: [
      { value: "organic-chemistry", label: "Organic Chemistry" },
      { value: "inorganic-chemistry", label: "Inorganic Chemistry" },
      { value: "physical-chemistry", label: "Physical Chemistry" },
      { value: "analytical-chemistry", label: "Analytical Chemistry" },
      { value: "biochemistry", label: "Biochemistry" },
    ],
    biology: [
      { value: "molecular-biology", label: "Molecular Biology" },
      { value: "genetics", label: "Genetics" },
      { value: "microbiology", label: "Microbiology" },
      { value: "ecology", label: "Ecology" },
      { value: "neuroscience", label: "Neuroscience" },
      { value: "bioinformatics", label: "Bioinformatics" },
    ],
    "computer-science": [
      { value: "machine-learning", label: "Machine Learning" },
      { value: "artificial-intelligence", label: "Artificial Intelligence" },
      { value: "computer-vision", label: "Computer Vision" },
      { value: "natural-language-processing", label: "Natural Language Processing" },
      { value: "cybersecurity", label: "Cybersecurity" },
      { value: "distributed-systems", label: "Distributed Systems" },
      { value: "human-computer-interaction", label: "Human-Computer Interaction" },
    ],
    "pure-mathematics": [
      { value: "algebra", label: "Algebra" },
      { value: "topology", label: "Topology" },
      { value: "number-theory", label: "Number Theory" },
      { value: "geometry", label: "Geometry" },
      { value: "analysis", label: "Analysis" },
    ],
    "applied-mathematics": [
      { value: "numerical-analysis", label: "Numerical Analysis" },
      { value: "mathematical-modeling", label: "Mathematical Modeling" },
      { value: "optimization", label: "Optimization" },
      { value: "dynamical-systems", label: "Dynamical Systems" },
    ],
    statistics: [
      { value: "statistical-learning", label: "Statistical Learning" },
      { value: "bayesian-statistics", label: "Bayesian Statistics" },
      { value: "data-science", label: "Data Science" },
      { value: "biostatistics", label: "Biostatistics" },
    ],
    engineering: [
      { value: "electrical-engineering", label: "Electrical Engineering" },
      { value: "mechanical-engineering", label: "Mechanical Engineering" },
      { value: "civil-engineering", label: "Civil Engineering" },
      { value: "chemical-engineering", label: "Chemical Engineering" },
      { value: "biomedical-engineering", label: "Biomedical Engineering" },
    ],
    "social-sciences": [
      { value: "psychology", label: "Psychology" },
      { value: "sociology", label: "Sociology" },
      { value: "economics", label: "Economics" },
      { value: "political-science", label: "Political Science" },
      { value: "anthropology", label: "Anthropology" },
    ],
    "earth-sciences": [
      { value: "geology", label: "Geology" },
      { value: "geophysics", label: "Geophysics" },
      { value: "oceanography", label: "Oceanography" },
    ],
    "environmental-science": [
      { value: "climate-science", label: "Climate Science" },
      { value: "conservation", label: "Conservation" },
      { value: "sustainability", label: "Sustainability" },
    ],
    "materials-science": [
      { value: "nanomaterials", label: "Nanomaterials" },
      { value: "polymers", label: "Polymers" },
      { value: "biomaterials", label: "Biomaterials" },
    ],
  };

  useEffect(() => {
    if (!searchQuery) setSearchActive(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      sdesc: "",
      ldesc: "",
      isActive: false,
      tags: [],
      working_users: [],
      fieldOfStudy: "",
      specialization: "",
      duration: "",
      positionType: [],
      deadline: "",
    },
  });

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string };
    if (decoded.type !== "fac") {
      router.push("/login");
      return;
    }
    setIsAuth(true);
  }, [router]);

  if (!isAuth) {
    // Optionally show a loading spinner here
    return null;
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!form.getValues("tags")?.includes(tagInput.trim())) {
        form.setValue("tags", [
          ...(form.getValues("tags") || []),
          tagInput.trim(),
        ]);
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    form.setValue(
      "tags",
      (form.getValues("tags") || []).filter((t) => t !== tag)
    );
  }

  function handleTogglePositionType(type: string) {
    const current = form.getValues("positionType") || [];
    if (current.includes(type)) {
      form.setValue(
        "positionType",
        current.filter((t) => t !== type)
      );
    } else {
      form.setValue("positionType", [...current, type]);
    }
  }

  async function onSubmit(values: z.infer<typeof projectFormSchema>) {
    const token = localStorage.getItem("token") || "";
    console.log("Creating project:", values);
    const res = await createProject(
      {
        name: values.name,
        sdesc: values.sdesc,
        ldesc: values.ldesc,
        isActive: values.isActive,
        tags: values.tags ?? [],
        working_users: values.working_users ?? [],
        fieldOfStudy: values.fieldOfStudy,
        specialization: values.specialization,
        duration: values.duration,
        positionType: values.positionType ?? [],
        deadline: values.deadline,
      },
      token
    );

    if (!res) return;
    await fetchProjects();
    form.reset();
    setIsCreateDialogOpen(false);
  }

  async function fetchProjects() {
    const token = localStorage.getItem("token") || "";
    const res = await fetchProjects_active_my(token);
    setProjects(res.projects);
  }

  const filteredProjects = projects?.filter((project) =>
    activeTab === "active" ? project.isActive : !project.isActive
  );

  const handleDeleteClick = (project: Project_type) => {
    setProjectToDelete(project);
    setDeleteConfirmInput("");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete?.pid) return;
    const token = localStorage.getItem("token") || "";
    try {
      await deleteProject(projectToDelete.pid, token);
      setProjects(projects.filter((p) => p.pid !== projectToDelete.pid));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setDeleteConfirmInput("");
      setShowDeletedPopup(true);
      if (deletedPopupTimeout.current)
        clearTimeout(deletedPopupTimeout.current);
      deletedPopupTimeout.current = setTimeout(
        () => setShowDeletedPopup(false),
        2000
      );
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.trim().length === 0) return text;
    const regex = new RegExp(`\\b(${query})\\b`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() && query.trim() !== "" ? (
            <span key={i} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const searchedProjects =
    searchActive && searchQuery
      ? (filteredProjects ?? []).filter(
          (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.sdesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.ldesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.tags &&
              project.tags.some((tag: string) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
              ))
        )
      : filteredProjects;

  const handleProjectClick = (pid: string) => {
    router.push(`/project/${pid}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-3xl font-semibold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground text-sm">
              Manage your research projects and track applications
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 h-10 px-5">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New Project</DialogTitle>
                <DialogDescription className="text-sm">
                  Fill in the details below to create a new research project
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sdesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Short description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ldesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
                          <div className="space-y-0">
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              Active Project
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Make project visible for applications
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm">Tags</FormLabel>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {(form.getValues("tags") || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                            >
                              {tag}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveTag(tag)}
                                tabIndex={-1}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Add a tag and press Enter"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={handleAddTag}
                              className="flex-1 h-9"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-9"
                            onClick={() => {
                              if (tagInput.trim() && !form.getValues("tags")?.includes(tagInput.trim())) {
                                form.setValue("tags", [
                                  ...(form.getValues("tags") || []),
                                  tagInput.trim(),
                                ]);
                                setTagInput("");
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <FormDescription className="text-xs">
                          Keywords for subject or research field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fieldOfStudy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedFieldInForm(value);
                            form.setValue("specialization", "");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field of study" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Sciences</SelectLabel>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="chemistry">
                                Chemistry
                              </SelectItem>
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
                              <SelectItem value="statistics">
                                Statistics
                              </SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Other</SelectLabel>
                              <SelectItem value="engineering">
                                Engineering
                              </SelectItem>
                              <SelectItem value="social-sciences">
                                Social Sciences
                              </SelectItem>
                              <SelectItem value="humanities">
                                Humanities
                              </SelectItem>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                        <Select
                          key={selectedFieldInForm}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedFieldInForm}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                selectedFieldInForm 
                                  ? "Select specialization" 
                                  : "Select field of study first"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedFieldInForm && specializationsByField[selectedFieldInForm]?.map((spec) => (
                              <SelectItem key={spec.value} value={spec.value}>
                                {spec.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="short-term">
                            Short-term (1-3 months)
                          </SelectItem>
                          <SelectItem value="medium-term">
                            Medium-term (3-6 months)
                          </SelectItem>
                          <SelectItem value="long-term">
                            Long-term (6+ months)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  <FormField
                    control={form.control}
                    name="positionType"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm">Position Type</FormLabel>
                        <FormDescription className="text-xs mb-2">
                          Select all that apply
                        </FormDescription>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2 rounded-md border p-2.5 bg-muted/20">
                            <Checkbox
                              id="paid"
                              checked={(
                                form.getValues("positionType") || []
                              ).includes("paid")}
                              onCheckedChange={() =>
                                handleTogglePositionType("paid")
                              }
                            />
                            <label
                              htmlFor="paid"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              Paid
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border p-2.5 bg-muted/20">
                            <Checkbox
                              id="volunteer"
                              checked={(
                                form.getValues("positionType") || []
                              ).includes("volunteer")}
                              onCheckedChange={() =>
                                handleTogglePositionType("volunteer")
                              }
                            />
                            <label
                              htmlFor="volunteer"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              Volunteer
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border p-2.5 bg-muted/20">
                            <Checkbox
                              id="credit"
                              checked={(
                                form.getValues("positionType") || []
                              ).includes("credit")}
                              onCheckedChange={() =>
                                handleTogglePositionType("credit")
                              }
                            />
                            <label
                              htmlFor="credit"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              For Credit
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border p-2.5 bg-muted/20">
                            <Checkbox
                              id="thesis"
                              checked={(
                                form.getValues("positionType") || []
                              ).includes("thesis")}
                              onCheckedChange={() =>
                                handleTogglePositionType("thesis")
                              }
                            />
                            <label
                              htmlFor="thesis"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              Thesis/Dissertation
                            </label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Application Deadline</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Select deadline"
                            min={new Date().toISOString().split('T')[0]}
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Deadline for student applications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-10">Create Project</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-9 h-9 border-muted-foreground/20 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchActive(true)}
              className="h-9 w-9"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="active" className="text-sm">Active</TabsTrigger>
              <TabsTrigger value="notactive" className="text-sm">Not Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(searchedProjects ?? []).map((project) => (
            <div
              key={project.pid}
              onClick={() => handleProjectClick(project.pid)}
              className={`group cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/40 flex flex-col justify-between ${
                searchActive &&
                searchQuery &&
                (project.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                  project.sdesc
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  project.ldesc
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (project.tags &&
                    project.tags.some((tag: string) =>
                      tag.toLowerCase().includes(searchQuery.toLowerCase())
                    )))
                  ? "ring-2 ring-primary/60 border-primary/60"
                  : ""
              }`}
              tabIndex={0}
              role="button"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-tight">
                    {highlightText(project?.name, searchQuery)}
                  </h3>
                  {project.isActive && (
                    <span className="shrink-0 text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {highlightText(project.sdesc, searchQuery)}
                </p>
                <p className="text-xs text-foreground/80 line-clamp-3">
                  {highlightText(project.ldesc, searchQuery)}
                </p>
                <div className="space-y-1 pt-1">
                  {project.fieldOfStudy && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Field:</span>
                      <span>{project.fieldOfStudy}</span>
                    </div>
                  )}
                  {project.specialization && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Specialization:</span>
                      <span>{project.specialization}</span>
                    </div>
                  )}
                  {project.duration && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Duration:</span>
                      <span>{project.duration}</span>
                    </div>
                  )}
                  {project.positionType && project.positionType.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Type:</span>
                      <span>{project.positionType.join(", ")}</span>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Deadline:</span>
                      <span>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2.5 pt-3">
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag: string, idx) => (
                      <span
                        key={tag + idx}
                        className={`inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground ${
                          searchActive &&
                          searchQuery &&
                          tag.toLowerCase().includes(searchQuery.toLowerCase())
                            ? "bg-yellow-100 text-yellow-900"
                            : ""
                        }`}
                      >
                        {highlightText(tag, searchQuery)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end border-t pt-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete Project</DialogTitle>
              <DialogDescription className="text-sm">
                This action{" "}
                <span className="font-semibold text-destructive">
                  cannot be undone
                </span>
                . Please type{" "}
                <span className="font-mono font-semibold text-foreground">
                  {projectToDelete?.name}
                </span>
                {" "}
                to confirm.
              </DialogDescription>
            </DialogHeader>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type project name to confirm"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              autoFocus
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteConfirmInput !== projectToDelete?.name}
                onClick={confirmDelete}
              >
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {(filteredProjects ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">No projects found</h3>
            <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-sm">
              {activeTab === "all"
                ? "You have not created any projects yet. Get started by creating your first research project."
                : `You do not have any ${activeTab} projects.`}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="h-11 px-6">
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
        )}

        {showDeletedPopup && (
          <div className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 -translate-x-1/2 rounded-lg border bg-card px-6 py-4 shadow-lg animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-sm">Project has been deleted.</span>
          </div>
        )}
      </main>
    </div>
  );
}
