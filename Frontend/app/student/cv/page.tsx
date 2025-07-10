"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  Download,
  Edit,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";

const cvFormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  education: z.array(
    z.object({
      institution: z
        .string()
        .min(1, { message: "Institution name is required" }),
      degree: z.string().min(1, { message: "Degree is required" }),
      field: z.string().min(1, { message: "Field of study is required" }),
      startDate: z.string().min(1, { message: "Start date is required" }),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ),
  experience: z.array(
    z.object({
      title: z.string().min(1, { message: "Job title is required" }),
      company: z.string().min(1, { message: "Company name is required" }),
      location: z.string().optional(),
      startDate: z.string().min(1, { message: "Start date is required" }),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ),
  skills: z
    .array(z.string())
    .min(1, { message: "At least one skill is required" }),
  projects: z.array(
    z.object({
      title: z.string().min(1, { message: "Project title is required" }),
      description: z
        .string()
        .min(1, { message: "Project description is required" }),
      technologies: z.array(z.string()).optional(),
      link: z.string().optional(),
    })
  ),
  publications: z.array(
    z.object({
      title: z.string().min(1, { message: "Publication title is required" }),
      authors: z.string().min(1, { message: "Authors are required" }),
      journal: z.string().optional(),
      date: z.string().optional(),
      link: z.string().optional(),
    })
  ),
  summary: z.string().optional(),
});

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState("edit");
  const [educationEntries, setEducationEntries] = useState([{ id: 1 }]);
  const [experienceEntries, setExperienceEntries] = useState([{ id: 1 }]);
  const [projectEntries, setProjectEntries] = useState([{ id: 1 }]);
  const [publicationEntries, setPublicationEntries] = useState<
    { id: number }[]
  >([]);
  const [skills, setSkills] = useState([
    "Python",
    "Machine Learning",
    "Data Analysis",
    "Research Methodology",
  ]);

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

  const form = useForm<z.infer<typeof cvFormSchema>>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: {
      personalInfo: {
        firstName: "Jamie",
        lastName: "Smith",
        email: "jamie.smith@example.com",
        phone: "(555) 123-4567",
        location: "Boston, MA",
        website: "",
        linkedin: "linkedin.com/in/jamiesmith",
        github: "github.com/jamiesmith",
      },
      education: [
        {
          institution: "Massachusetts Institute of Technology",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2020-09",
          endDate: "",
          current: true,
          description:
            "GPA: 3.8/4.0. Relevant coursework: Machine Learning, Algorithms, Data Structures, Artificial Intelligence",
        },
      ],
      experience: [
        {
          title: "Research Assistant",
          company: "MIT AI Lab",
          location: "Cambridge, MA",
          startDate: "2022-06",
          endDate: "",
          current: true,
          description:
            "Assisting with research on machine learning algorithms for natural language processing. Implementing and testing models, analyzing results, and contributing to publications.",
        },
      ],
      skills: [
        "Python",
        "Machine Learning",
        "Data Analysis",
        "Research Methodology",
      ],
      projects: [
        {
          title: "Sentiment Analysis Tool",
          description:
            "Developed a machine learning model to analyze sentiment in social media posts with 92% accuracy.",
          technologies: ["Python", "TensorFlow", "NLP"],
          link: "github.com/jamiesmith/sentiment-analysis",
        },
      ],
      publications: [],
      summary:
        "Computer Science student at MIT with a focus on machine learning and artificial intelligence. Experienced in research methodology and data analysis. Seeking research opportunities in AI and computational methods.",
    },
  });

  function onSubmit(values: z.infer<typeof cvFormSchema>) {
    console.log(values);
    // In a real application, you would save the CV data here
    setActiveTab("preview");
  }

  const addEducationEntry = () => {
    const newId =
      educationEntries.length > 0
        ? Math.max(...educationEntries.map((entry) => entry.id)) + 1
        : 1;
    setEducationEntries([...educationEntries, { id: newId }]);
  };

  const removeEducationEntry = (id: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((entry) => entry.id !== id));
    }
  };

  const addExperienceEntry = () => {
    const newId =
      experienceEntries.length > 0
        ? Math.max(...experienceEntries.map((entry) => entry.id)) + 1
        : 1;
    setExperienceEntries([...experienceEntries, { id: newId }]);
  };

  const removeExperienceEntry = (id: number) => {
    if (experienceEntries.length > 1) {
      setExperienceEntries(
        experienceEntries.filter((entry) => entry.id !== id)
      );
    }
  };

  const addProjectEntry = () => {
    const newId =
      projectEntries.length > 0
        ? Math.max(...projectEntries.map((entry) => entry.id)) + 1
        : 1;
    setProjectEntries([...projectEntries, { id: newId }]);
  };

  const removeProjectEntry = (id: number) => {
    if (projectEntries.length > 1) {
      setProjectEntries(projectEntries.filter((entry) => entry.id !== id));
    }
  };

  const addPublicationEntry = () => {
    const newId =
      publicationEntries.length > 0
        ? Math.max(...publicationEntries.map((entry) => entry.id)) + 1
        : 1;
    setPublicationEntries([...publicationEntries, { id: newId }]);
  };

  const removePublicationEntry = (id: number) => {
    setPublicationEntries(
      publicationEntries.filter((entry) => entry.id !== id)
    );
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      form.setValue("skills", [...skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    const updatedSkills = skills.filter((s) => s !== skill);
    setSkills(updatedSkills);
    form.setValue("skills", updatedSkills);
  };

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
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Explore
            </Link>
            <Link
              href="/student/applications"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              My Applications
            </Link>
            <Link
              href="/student/resources"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              Resources
            </Link>
            <Link
              href="/student/cv"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
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
            <h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>
            <p className="text-muted-foreground">
              Create and manage your CV for research applications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export as PDF</span>
            </Button>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>CV Completion</AlertTitle>
          <AlertDescription>
            Your CV is 85% complete. Add publications or more projects to
            improve it.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit CV
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="space-y-4 mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Basic information that will appear at the top of your CV.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Email address"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="personalInfo.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City, State/Province, Country"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="LinkedIn profile URL"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalInfo.github"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="GitHub profile URL"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Summary</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a brief summary of your background, skills, and career goals..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Keep your summary concise and focused on your
                            research interests and goals.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>
                      Add your educational background, starting with the most
                      recent.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {educationEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="space-y-4 pb-4 border-b last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            Education #{index + 1}
                          </h4>
                          {educationEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducationEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Institution</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="University or school name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <FormControl>
                                  <Input placeholder="Degree type" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field of Study</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Major or field of study"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date (or Expected)</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`education.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="GPA, relevant coursework, honors, etc."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addEducationEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                    <CardDescription>
                      Add your work and research experience, starting with the
                      most recent.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experienceEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="space-y-4 pb-4 border-b last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            Experience #{index + 1}
                          </h4>
                          {experienceEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperienceEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your position or role"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company/Organization</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Company or organization name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`experience.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City, State/Province, Country"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`experience.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`experience.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe your responsibilities, achievements, and skills used..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addExperienceEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>
                      Add technical, research, and soft skills relevant to your
                      field.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeSkill(skill)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        id="new-skill"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            "new-skill"
                          ) as HTMLInputElement;
                          if (input && input.value) {
                            addSkill(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      Add skills that are relevant to the research positions
                      you're applying for.
                    </FormDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Add research or personal projects that showcase your
                      skills and interests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {projectEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="space-y-4 pb-4 border-b last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            Project #{index + 1}
                          </h4>
                          {projectEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProjectEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormField
                          control={form.control}
                          name={`projects.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Name of your project"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`projects.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the project, your role, and outcomes..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`projects.${index}.link`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Link</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="URL to project repository or website"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addProjectEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Project
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Publications</CardTitle>
                    <CardDescription>
                      Add any research papers, articles, or publications you've
                      contributed to.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {publicationEntries.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 mb-2" />
                        <p>No publications added yet.</p>
                        <p className="text-sm">
                          Add your research papers, articles, or other
                          publications.
                        </p>
                      </div>
                    ) : (
                      publicationEntries.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="space-y-4 pb-4 border-b last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">
                              Publication #{index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePublicationEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`publications.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publication Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Title of the paper or article"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`publications.${index}.authors`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Authors</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="List of authors (e.g., Smith, J., Johnson, A., et al.)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`publications.${index}.journal`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Journal/Conference</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Name of journal or conference"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`publications.${index}.date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Publication Date</FormLabel>
                                  <FormControl>
                                    <Input type="month" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`publications.${index}.link`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>DOI or Link</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="DOI or URL to the publication"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addPublicationEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Publication
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview
                  </Button>
                  <Button type="submit">Save CV</Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">
                      {form.getValues().personalInfo.firstName}{" "}
                      {form.getValues().personalInfo.lastName}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {form.getValues().personalInfo.email} •{" "}
                      {form.getValues().personalInfo.phone}
                    </CardDescription>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {form.getValues().personalInfo.location && (
                        <span>{form.getValues().personalInfo.location}</span>
                      )}
                      {form.getValues().personalInfo.linkedin && (
                        <Link
                          href={`https://${
                            form.getValues().personalInfo.linkedin
                          }`}
                          className="hover:underline"
                        >
                          LinkedIn
                        </Link>
                      )}
                      {form.getValues().personalInfo.github && (
                        <Link
                          href={`https://${
                            form.getValues().personalInfo.github
                          }`}
                          className="hover:underline"
                        >
                          GitHub
                        </Link>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.getValues().summary && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p>{form.getValues().summary}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Education</h3>
                  <div className="space-y-4">
                    {form.getValues().education.map((edu, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{edu.institution}</h4>
                          <div className="text-sm text-muted-foreground">
                            {edu.startDate &&
                              new Date(edu.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                }
                              )}{" "}
                            -
                            {edu.endDate
                              ? new Date(edu.endDate).toLocaleDateString(
                                  "en-US",
                                  { year: "numeric", month: "short" }
                                )
                              : " Present"}
                          </div>
                        </div>
                        <div className="text-sm">
                          {edu.degree} in {edu.field}
                        </div>
                        {edu.description && (
                          <p className="text-sm text-muted-foreground">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Experience</h3>
                  <div className="space-y-4">
                    {form.getValues().experience.map((exp, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{exp.title}</h4>
                          <div className="text-sm text-muted-foreground">
                            {exp.startDate &&
                              new Date(exp.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                }
                              )}{" "}
                            -
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString(
                                  "en-US",
                                  { year: "numeric", month: "short" }
                                )
                              : " Present"}
                          </div>
                        </div>
                        <div className="text-sm">
                          {exp.company}
                          {exp.location ? `, ${exp.location}` : ""}
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {form.getValues().skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Projects</h3>
                  <div className="space-y-4">
                    {form.getValues().projects.map((project, index) => (
                      <div key={index} className="space-y-1">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        {project.link && (
                          <Link
                            href={`https://${project.link}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {project.link}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {form.getValues().publications &&
                  form.getValues().publications.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Publications
                      </h3>
                      <div className="space-y-4">
                        {form.getValues().publications.map((pub, index) => (
                          <div key={index} className="space-y-1">
                            <h4 className="font-medium">{pub.title}</h4>
                            <p className="text-sm">{pub.authors}</p>
                            <p className="text-sm text-muted-foreground">
                              {pub.journal}
                              {pub.date &&
                                `, ${new Date(pub.date).toLocaleDateString(
                                  "en-US",
                                  { year: "numeric", month: "long" }
                                )}`}
                            </p>
                            {pub.link && (
                              <Link
                                href={`https://${pub.link}`}
                                className="text-sm text-primary hover:underline"
                              >
                                {pub.link}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("edit")}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </Button>
                  <Button>Save CV</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
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
