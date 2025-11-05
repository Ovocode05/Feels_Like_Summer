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
  deadline: z.string().optional(),
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground">
              Manage your research projects, track applications, and collaborate
              with students.
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] border-spacing-2 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Research Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new research project.
                  Students will be able to view and apply to this project.
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
                        <FormLabel>Is Active?</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags (Subject/Research Field)</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(form.getValues("tags") || []).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded bg-primary/10 px-2 py-1 text-sm font-medium text-primary"
                            >
                              {tag}
                              <button
                                type="button"
                                className="ml-1 text-primary hover:text-red-600"
                                onClick={() => handleRemoveTag(tag)}
                                tabIndex={-1}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Add a tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                          />
                        </FormControl>
                        <FormDescription>
                          Add keywords for the subject or research field
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fieldOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <Select
                          onValueChange={field.onChange}
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormLabel>Position Type</FormLabel>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
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
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Paid
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
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
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Volunteer
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
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
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              For Credit
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
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
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Select deadline"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Create Project</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchActive(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="notactive">Not Active</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(searchedProjects ?? []).map((project) => (
            <div
              key={project.pid}
              onClick={() => handleProjectClick(project.pid)}
              className={`cursor-pointer border-2 border-primary/30 p-6 rounded-xl shadow-lg bg-background flex flex-col justify-between min-h-[320px] ${
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
                  ? "ring-2 ring-yellow-400"
                  : ""
              }`}
              tabIndex={0}
              role="button"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  {highlightText(project?.name, searchQuery)}
                  {project.isActive && (
                    <span className="ml-2 text-green-600 text-base font-semibold bg-green-100 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </h3>
                <p className="mb-2 text-base text-muted-foreground">
                  <strong>Short Desc:</strong>{" "}
                  {highlightText(project.sdesc, searchQuery)}
                </p>
                <p className="text-base mb-2">
                  <strong>Long Desc:</strong>{" "}
                  {highlightText(project.ldesc, searchQuery)}
                </p>
                {project.fieldOfStudy && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Field:</strong> {project.fieldOfStudy}
                  </p>
                )}
                {project.specialization && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Specialization:</strong> {project.specialization}
                  </p>
                )}
                {project.duration && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Duration:</strong> {project.duration}
                  </p>
                )}
                {project.positionType && project.positionType.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Position Type:</strong>{" "}
                    {project.positionType.join(", ")}
                  </p>
                )}
                {project.deadline && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Deadline:</strong>{" "}
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag: string, idx) => (
                      <span
                        key={tag + idx}
                        className={`inline-flex items-center rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary ${
                          searchActive &&
                          searchQuery &&
                          tag.toLowerCase().includes(searchQuery.toLowerCase())
                            ? "bg-yellow-200"
                            : ""
                        }`}
                      >
                        {highlightText(tag, searchQuery)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1 bg-red-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                This action{" "}
                <span className="font-bold text-destructive">
                  cannot be undone
                </span>
                .<br />
                Please type{" "}
                <span className="font-mono font-semibold">
                  {projectToDelete?.name}
                </span>
                {"   "}
                to confirm deletion of this project.
              </DialogDescription>
            </DialogHeader>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-4"
              placeholder="Type project name to confirm"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              autoFocus
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteConfirmInput !== projectToDelete?.name}
                onClick={confirmDelete}
                className="bg-red-900"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {(filteredProjects ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {activeTab === "all"
                ? "You have not created any projects yet."
                : `You do not have any ${activeTab} projects.`}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
        )}

        {showDeletedPopup && (
          <div className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 -translate-x-1/2 rounded-lg border border-green-300 bg-green-50 px-6 py-3 text-green-800 shadow-xl animate-fade-in">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="font-semibold">Project has been deleted.</span>
          </div>
        )}
      </main>
    </div>
  );
}
