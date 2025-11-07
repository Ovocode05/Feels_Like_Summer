"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
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
  Download,
  Edit,
  FileText,
  Plus,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MenubarStudent from "@/components/ui/menubar_student";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getStudentProfile,
  updateStudentProfile,
  type StudentProfile,
} from "@/api/api";
import { useToast } from "@/hooks/use-toast";

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
      institution: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  skills: z
    .array(z.string())
    .min(1, { message: "At least one skill is required" }),
  projects: z.array(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      link: z.string().optional(),
    })
  ).optional(),
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
  // Backend-specific fields
  institution: z.string().optional(),
  degree: z.string().optional(),
  dates: z.string().optional(),
  resumeLink: z.string().optional(),
  publicationsLink: z.string().optional(),
  researchInterest: z.string().optional(),
  intention: z.string().optional(),
  discoveryEnabled: z.boolean().optional(),
});

// Month/Year Picker Component
function MonthYearPicker({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value + "-01") : undefined
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      onChange(`${year}-${month}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={1960}
          toYear={2030}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function CVBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("edit");
  const [showEducation, setShowEducation] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [educationEntries, setEducationEntries] = useState<{ id: number }[]>([]);
  const [experienceEntries, setExperienceEntries] = useState<{ id: number }[]>([]);
  const [projectEntries, setProjectEntries] = useState<{ id: number }[]>([]);
  const [publicationEntries, setPublicationEntries] = useState<
    { id: number }[]
  >([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Suggested skills
  const suggestedSkills = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "C#",
    "SQL", "MongoDB", "PostgreSQL", "Git", "Docker", "Kubernetes", "AWS", "Azure",
    "Machine Learning", "Deep Learning", "Data Analysis", "Research", "Technical Writing",
    "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "R", "MATLAB",
    "Statistics", "Linear Algebra", "Calculus", "Laboratory Skills", "Critical Thinking"
  ];

  const form = useForm<z.infer<typeof cvFormSchema>>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: {
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
      },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      publications: [],
      summary: "",
      institution: "",
      degree: "",
      dates: "",
      resumeLink: "",
      publicationsLink: "",
      researchInterest: "",
      intention: "",
      discoveryEnabled: true,
    },
  });

  const [isAuth, setIsAuth] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string; name?: string; email?: string };
    if (decoded.type !== "stu") {
      router.push("/login");
      return;
    }
    setIsAuth(true);

    // Preload name and email from JWT token
    const jwtName = decoded.name || "";
    const jwtEmail = decoded.email || "";
    const nameParts = jwtName.trim().split(/\s+/);
    const jwtFirstName = nameParts[0] || "";
    const jwtLastName = nameParts.slice(1).join(" ") || "";

    // Set initial form values from JWT
    form.setValue("personalInfo.firstName", jwtFirstName);
    form.setValue("personalInfo.lastName", jwtLastName);
    form.setValue("personalInfo.email", jwtEmail);

    const fetchProfileData = async () => {
      setProfileLoading(true);
      try {
        const tokenInner = localStorage.getItem("token") || "";
        const response = await getStudentProfile(tokenInner);

        if (response.student) {
          const student = response.student;

          // Parse personal info if available
          let personalInfoData: {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            website: string;
            linkedin: string;
            github: string;
          } = {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            website: "",
            linkedin: "",
            github: "",
          };

          try {
            if (student.personalInfo) {
              personalInfoData = JSON.parse(student.personalInfo);
            }
          } catch (e) {
            console.error("Error parsing personal info:", e);
          }

          // Use name from user if personalInfo doesn't have it
          if (!personalInfoData.firstName && student.name) {
            personalInfoData.firstName = student.name?.split(" ")[0] || "";
            personalInfoData.lastName = student.name?.split(" ").slice(1).join(" ") || "";
          }
          if (!personalInfoData.email && student.email) {
            personalInfoData.email = student.email;
          }
          
          // Fall back to JWT values if still not available
          if (!personalInfoData.firstName) {
            personalInfoData.firstName = jwtFirstName;
          }
          if (!personalInfoData.lastName) {
            personalInfoData.lastName = jwtLastName;
          }
          if (!personalInfoData.email) {
            personalInfoData.email = jwtEmail;
          }

          // Map backend data to form structure
          const hasEducation = (student.educationDetails && student.educationDetails.length > 0) || student.institution;
          const hasExperience = (student.experienceDetails && student.experienceDetails.length > 0) || student.workEx;
          const hasProjects = (student.projectsDetails && student.projectsDetails.length > 0) || (student.projects && student.projects.length > 0);
          
          setShowEducation(hasEducation);
          setShowExperience(hasExperience);
          setShowProjects(hasProjects);

          form.reset({
            personalInfo: {
              firstName: personalInfoData.firstName || "",
              lastName: personalInfoData.lastName || "",
              email: personalInfoData.email || "",
              phone: personalInfoData.phone || "",
              location: student.location || "",
              website: personalInfoData.website || "",
              linkedin: personalInfoData.linkedin || "",
              github: personalInfoData.github || "",
            },
            education: hasEducation
              ? student.educationDetails && student.educationDetails.length > 0
                ? student.educationDetails
                : [
                    {
                      institution: student.institution,
                      degree: student.degree || "",
                      field: "",
                      startDate: student.dates?.split(" - ")[0] || "",
                      endDate: student.dates?.split(" - ")[1] || "",
                      current: student.dates ? !student.dates.includes(" - ") : false,
                      description: "",
                    },
                  ]
              : [],
            experience: hasExperience
              ? student.experienceDetails && student.experienceDetails.length > 0
                ? student.experienceDetails
                : [
                    {
                      title: "",
                      company: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      description: student.workEx,
                    },
                  ]
              : [],
            skills: student.skills || [],
            projects: hasProjects
              ? student.projectsDetails && student.projectsDetails.length > 0
                ? student.projectsDetails
                : student.projects && student.projects.length > 0
                ? student.projects.map((proj: string) => ({
                    title: proj,
                    description: "",
                    technologies: [],
                    link: "",
                  }))
                : []
              : [],
            publications: student.publicationsList || [],
            summary: student.summary || "",
            institution: student.institution || "",
            degree: student.degree || "",
            dates: student.dates || "",
            resumeLink: student.resumeLink || "",
            publicationsLink: student.publicationsLink || "",
            researchInterest: student.researchInterest || "",
            intention: student.intention || "",
            discoveryEnabled: student.discoveryEnabled !== undefined ? student.discoveryEnabled : true,
          });

          setSkills(student.skills || []);
          
          // Update entries count
          if (hasEducation) {
            const eduData = student.educationDetails && student.educationDetails.length > 0
              ? student.educationDetails
              : student.institution ? [{}] : [];
            if (eduData.length > 0) {
              setEducationEntries(eduData.map((_: unknown, idx: number) => ({ id: idx + 1 })));
            }
          }
          if (hasExperience) {
            const expData = student.experienceDetails && student.experienceDetails.length > 0
              ? student.experienceDetails
              : student.workEx ? [{}] : [];
            if (expData.length > 0) {
              setExperienceEntries(expData.map((_: unknown, idx: number) => ({ id: idx + 1 })));
            }
          }
          if (hasProjects) {
            const projData = student.projectsDetails && student.projectsDetails.length > 0
              ? student.projectsDetails
              : student.projects && student.projects.length > 0 ? student.projects : [];
            if (projData.length > 0) {
              setProjectEntries(projData.map((_: unknown, idx: number) => ({ id: idx + 1 })));
            }
          }
          if (student.publicationsList && student.publicationsList.length > 0) {
            setPublicationEntries(student.publicationsList.map((_: unknown, idx: number) => ({ id: idx + 1 })));
          }
        }
      } catch (error: unknown) {
        console.error("Error fetching profile:", error);
        type AxiosLikeError = { response?: { status?: number } };
        const status = (error as AxiosLikeError).response?.status;
        if (status !== 404) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile data",
          });
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileData();
  }, [router, form, toast]);

  const onSubmit = async (values: z.infer<typeof cvFormSchema>) => {
    setLoading(true);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token") || "";

      // Create personal info JSON
      const personalInfoObj = {
        firstName: values.personalInfo.firstName,
        lastName: values.personalInfo.lastName,
        email: values.personalInfo.email,
        phone: values.personalInfo.phone || "",
        website: values.personalInfo.website || "",
        linkedin: values.personalInfo.linkedin || "",
        github: values.personalInfo.github || "",
      };

      // Map form data to backend structure with all details
      const profileData: StudentProfile = {
        // Basic fields for backward compatibility
        institution: values.education && values.education.length > 0 ? values.education[0]?.institution || "" : "",
        degree: values.education && values.education.length > 0 ? values.education[0]?.degree || "" : "",
        location: values.personalInfo.location || "",
        dates:
          values.education && values.education.length > 0 && values.education[0]?.startDate && values.education[0]?.endDate
            ? `${values.education[0].startDate} - ${values.education[0].endDate}`
            : values.education && values.education.length > 0 ? values.education[0]?.startDate || "" : "",
        workEx: values.experience && values.experience.length > 0 ? values.experience[0]?.description || "" : "",
        projects: values.projects && values.projects.length > 0 ? values.projects.map((p) => p.title).filter(Boolean) : [],
        skills: skills,
        activities: [],
        resumeLink: values.resumeLink || "",
        publicationsLink: values.publicationsLink || "",
        researchInterest: values.researchInterest || "",
        intention: values.intention || "",
        
        // New detailed fields
        educationDetails: values.education && values.education.length > 0 ? values.education.map(edu => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          field: edu.field || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          current: edu.current,
          description: edu.description || "",
        })).filter(edu => edu.institution || edu.degree) : [],
        experienceDetails: values.experience && values.experience.length > 0 ? values.experience.map(exp => ({
          title: exp.title || "",
          company: exp.company || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current,
          description: exp.description || "",
        })).filter(exp => exp.title || exp.company) : [],
        publicationsList: values.publications.map(pub => ({
          title: pub.title,
          authors: pub.authors,
          journal: pub.journal,
          date: pub.date,
          link: pub.link,
        })),
        projectsDetails: values.projects && values.projects.length > 0 ? values.projects.map(proj => ({
          title: proj.title || "",
          description: proj.description || "",
          technologies: proj.technologies,
          link: proj.link || "",
        })).filter(proj => proj.title || proj.description) : [],
        summary: values.summary || "",
        personalInfo: JSON.stringify(personalInfoObj),
        discoveryEnabled: values.discoveryEnabled !== undefined ? values.discoveryEnabled : true,
      };

      await updateStudentProfile(profileData, token);

      setSaveSuccess(true);
      toast({
        title: "Success",
        description: "Your profile has been saved successfully!",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving CV:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save CV. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEducationEntry = () => {
    if (!showEducation) {
      setShowEducation(true);
      setEducationEntries([{ id: 1 }]);
      form.setValue("education", [{
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }]);
    } else {
      const newId =
        educationEntries.length > 0
          ? Math.max(...educationEntries.map((entry) => entry.id)) + 1
          : 1;
      setEducationEntries([...educationEntries, { id: newId }]);
    }
  };

  const removeEducationEntry = (id: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((entry) => entry.id !== id));
    } else {
      // If it's the last entry, hide the entire section
      setEducationEntries([]);
      setShowEducation(false);
      form.setValue("education", []);
    }
  };

  const addExperienceEntry = () => {
    if (!showExperience) {
      setShowExperience(true);
      setExperienceEntries([{ id: 1 }]);
      form.setValue("experience", [{
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }]);
    } else {
      const newId =
        experienceEntries.length > 0
          ? Math.max(...experienceEntries.map((entry) => entry.id)) + 1
          : 1;
      setExperienceEntries([...experienceEntries, { id: newId }]);
    }
  };

  const removeExperienceEntry = (id: number) => {
    if (experienceEntries.length > 1) {
      setExperienceEntries(
        experienceEntries.filter((entry) => entry.id !== id)
      );
    } else {
      // If it's the last entry, hide the entire section
      setExperienceEntries([]);
      setShowExperience(false);
      form.setValue("experience", []);
    }
  };

  const addProjectEntry = () => {
    if (!showProjects) {
      setShowProjects(true);
      setProjectEntries([{ id: 1 }]);
      form.setValue("projects", [{
        title: "",
        description: "",
        technologies: [],
        link: "",
      }]);
    } else {
      const newId =
        projectEntries.length > 0
          ? Math.max(...projectEntries.map((entry) => entry.id)) + 1
          : 1;
      setProjectEntries([...projectEntries, { id: newId }]);
    }
  };

  const removeProjectEntry = (id: number) => {
    if (projectEntries.length > 1) {
      setProjectEntries(projectEntries.filter((entry) => entry.id !== id));
    } else {
      // If it's the last entry, hide the entire section
      setProjectEntries([]);
      setShowProjects(false);
      form.setValue("projects", []);
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
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Create and manage your profile information.
            </p>
          </div>
        </div>

        {/* <Alert>
          {saveSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Profile Saved Successfully</AlertTitle>
              <AlertDescription>
                Your profile has been saved to your account and can be used for
                project applications.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Created Successfully</AlertTitle>
              <AlertDescription>
                Your profile has been created and can be used for project
                applications.
              </AlertDescription>
            </>
          )}
        </Alert> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
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

                {!showEducation ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>
                        Add your educational background (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addEducationEntry}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Education
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducationEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                                  <MonthYearPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
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
                                  <MonthYearPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
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
                        Add Another Education
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {!showExperience ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Experience</CardTitle>
                      <CardDescription>
                        Add your work and research experience (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExperienceEntry}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Experience
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperienceEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                                  <MonthYearPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
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
                                  <MonthYearPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={form.watch(`experience.${index}.current`)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`experience.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Currently Working Here</FormLabel>
                                <FormDescription>
                                  Check this if you are currently in this position
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
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
                        Add Another Experience
                      </Button>
                    </CardContent>
                  </Card>
                )}

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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value) {
                              addSkill(input.value);
                              input.value = "";
                            }
                          }
                        }}
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
                    <div className="space-y-2">
                      <FormDescription>
                        Add skills that are relevant to the research positions you
                        are applying for. Click any suggestion below to add it quickly:
                      </FormDescription>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills
                          .filter((skill) => !skills.includes(skill))
                          .map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => addSkill(skill)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!showProjects ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>
                        Add research or personal projects (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProjectEntry}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProjectEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                        Add Another Project
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Research Interests & Goals</CardTitle>
                    <CardDescription>
                      Tell us about your research interests and career goals.
                      This helps us recommend relevant projects.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="researchInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Research Interests</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your research interests, areas you want to explore, topics you're passionate about..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Be specific about the topics or fields you&apos;re
                            interested in researching
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="intention"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goals & Intentions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What are your career goals? What do you hope to achieve through research projects?"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Help us understand what you want to accomplish in
                            your academic journey
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discoveryEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Profile Discovery
                            </FormLabel>
                            <FormDescription>
                              Allow your profile to be visible in the Explore section
                              for professors and other students to discover you.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Publications & Documents</CardTitle>
                    {/* FIX: Replaced the apostrophe in "you've" with "&apos;" to fix the unescaped-entities error. */}
                    <CardDescription>
                      Add links to your resume/CV and publications. These will
                      be used for applications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-1">
                        Document Links
                      </h3>
                      <FormField
                        control={form.control}
                        name="resumeLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resume/CV Link</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://drive.google.com/..."
                                type="url"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Link to your resume or CV (Google Drive, Dropbox,
                              etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="publicationsLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publications Link (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://scholar.google.com/..."
                                type="url"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Link to your Google Scholar profile or publication
                              list
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-1">
                        Publications List
                      </h3>
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
                                      <MonthYearPicker
                                        value={field.value}
                                        onChange={field.onChange}
                                      />
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
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Profile</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
