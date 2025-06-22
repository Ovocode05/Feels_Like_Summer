"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  Copy,
  Edit,
  FileText,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"

const projectFormSchema = z.object({
  title: z.string().min(1, { message: "Project title is required" }),
  description: z.string().min(1, { message: "Project description is required" }),
  field: z.string().min(1, { message: "Field is required" }),
  specialization: z.string().min(1, { message: "Specialization is required" }),
  positions: z.coerce.number().min(1, { message: "At least one position is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  deadline: z.string().min(1, { message: "Application deadline is required" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
  positionType: z.string().min(1, { message: "Position type is required" }),
  status: z.string().min(1, { message: "Status is required" }),
})

export default function ProfessorProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Quantum Computing Algorithms",
      description: "Developing novel quantum algorithms for optimization problems.",
      field: "Physics",
      specialization: "Quantum Computing",
      positions: 3,
      applications: 5,
      startDate: "Jan 15, 2023",
      endDate: "Dec 15, 2023",
      deadline: "Dec 1, 2022",
      status: "active",
      students: [
        { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 2, name: "Sarah Williams", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 3, name: "Michael Chen", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      id: 2,
      title: "Machine Learning for Climate Data",
      description: "Using machine learning to analyze and predict climate patterns.",
      field: "Computer Science",
      specialization: "Machine Learning",
      positions: 2,
      applications: 4,
      startDate: "Mar 10, 2023",
      endDate: "Sep 10, 2023",
      deadline: "Feb 15, 2023",
      status: "active",
      students: [
        { id: 4, name: "Emily Davis", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 5, name: "David Lee", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      id: 3,
      title: "Algebraic Topology Applications",
      description: "Exploring applications of algebraic topology in data analysis.",
      field: "Mathematics",
      specialization: "Algebraic Topology",
      positions: 2,
      applications: 3,
      startDate: "Feb 5, 2023",
      endDate: "Aug 5, 2023",
      deadline: "Jan 15, 2023",
      status: "active",
      students: [
        { id: 6, name: "Jessica Brown", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 7, name: "Ryan Taylor", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      id: 4,
      title: "Neural Networks in Robotics",
      description: "Implementing neural networks for robotic control systems.",
      field: "Computer Science",
      specialization: "Robotics",
      positions: 2,
      applications: 0,
      startDate: "Jun 1, 2023",
      endDate: "Dec 1, 2023",
      deadline: "May 15, 2023",
      status: "pending",
      students: [],
    },
    {
      id: 5,
      title: "Statistical Mechanics Models",
      description: "Developed new statistical mechanics models for complex systems.",
      field: "Physics",
      specialization: "Statistical Mechanics",
      positions: 4,
      applications: 0,
      startDate: "Jan 2022",
      endDate: "Dec 2022",
      deadline: "Dec 1, 2021",
      status: "completed",
      students: [],
    },
  ])

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      field: "",
      specialization: "",
      positions: 1,
      startDate: "",
      endDate: "",
      deadline: "",
      requirements: "",
      positionType: "",
      status: "pending",
    },
  })

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    const newProject = {
      id: projects.length + 1,
      ...values,
      applications: 0,
      students: [],
    }
    setProjects([...projects, newProject])
    setIsCreateDialogOpen(false)
    form.reset()
  }

  const deleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id))
  }

  const duplicateProject = (project: any) => {
    const newProject = {
      ...project,
      id: projects.length + 1,
      title: `${project.title} (Copy)`,
      status: "pending",
      applications: 0,
      students: [],
    }
    setProjects([...projects, newProject])
  }

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "all") return true
    return project.status === activeTab
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 lg:flex">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">ResearchConnect</span>
        </Link>
        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex gap-6">
            <Link href="/professor/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
              Dashboard
            </Link>
            <Link
              href="/professor/projects"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              My Projects
            </Link>
            <Link href="/professor/applications" className="text-sm font-medium underline-offset-4 hover:underline">
              Applications
            </Link>
            <Link href="/professor/resources" className="text-sm font-medium underline-offset-4 hover:underline">
              Resources
            </Link>
            <Link href="/professor/availability" className="text-sm font-medium underline-offset-4 hover:underline">
              Availability
            </Link>
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Link href="/professor/profile">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Professor" />
              <AvatarFallback>PD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="text-muted-foreground">
              Manage your research projects, track applications, and collaborate with students.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Research Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new research project. Students will be able to view and apply to
                  this project.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the research project, goals, and expected outcomes"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="field"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Physics">Physics</SelectItem>
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Biology">Biology</SelectItem>
                              <SelectItem value="Chemistry">Chemistry</SelectItem>
                              <SelectItem value="Engineering">Engineering</SelectItem>
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
                          <FormControl>
                            <Input placeholder="E.g., Quantum Computing, Machine Learning" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="positions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Positions</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>Number of available positions</FormDescription>
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
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="positionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Volunteer">Volunteer</SelectItem>
                              <SelectItem value="For Credit">For Credit</SelectItem>
                              <SelectItem value="Thesis/Dissertation">Thesis/Dissertation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List required skills, qualifications, and experience"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Pending projects are not visible to students until you activate them
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Project</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search projects..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant={
                        project.status === "active" ? "default" : project.status === "pending" ? "secondary" : "outline"
                      }
                      className="mb-2"
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {project.field} • {project.specialization}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateProject(project)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {project.students.length}/{project.positions} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{project.applications} Applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Started {project.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Deadline {project.deadline}</span>
                  </div>
                </div>
                {project.students.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Current Students:</div>
                    <div className="flex -space-x-2">
                      {project.students.map((student) => (
                        <Avatar key={student.id} className="border-2 border-background h-8 w-8">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Link href={`/professor/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Link href={`/professor/projects/${project.id}/applications`}>
                  <Button size="sm">{project.applications > 0 ? "Review Applications" : "Manage Project"}</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {activeTab === "all"
                ? "You haven't created any projects yet."
                : `You don't have any ${activeTab} projects.`}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function Bell(props) {
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
  )
}
