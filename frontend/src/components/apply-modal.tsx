"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";
import {
  getStudentProfile,
  applyToProject,
  updateStudentProfile,
  type ApplicationData,
  type StudentProfile,
} from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
}

type EducationEntry = {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
};

type ExperienceEntry = {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
};

type ProjectEntry = {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
};

type ApplicationFormData = {
  selectedEducation: number[];
  selectedExperience: number[];
  selectedProjects: number[];
  customEducation: EducationEntry[];
  customExperience: ExperienceEntry[];
  customProjects: ProjectEntry[];
  availability: string;
  motivation: string;
  additionalInfo: string;
  cvLink: string;
  publicationsLink: string;
};

const extractErrorMessage = (err: unknown, fallback = "An error occurred") => {
  if (!err || typeof err !== "object") return fallback;
  const maybe = err as Record<string, unknown>;
  if (
    "response" in maybe &&
    typeof maybe.response === "object" &&
    maybe.response !== null
  ) {
    const resp = maybe.response as Record<string, unknown>;
    if ("data" in resp && typeof resp.data === "object" && resp.data !== null) {
      const data = resp.data as Record<string, unknown>;
      if ("error" in data && typeof data.error === "string") return data.error;
      if ("message" in data && typeof data.message === "string")
        return data.message;
    }
    if ("status" in resp && typeof resp.status === "number") {
      const status = resp.status as number;
      return `${fallback} (status ${status})`;
    }
  }
  if ("message" in maybe && typeof maybe.message === "string")
    return maybe.message;
  return fallback;
};

export function ApplyModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess,
}: ApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("selection");

  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    selectedEducation: [],
    selectedExperience: [],
    selectedProjects: [],
    customEducation: [],
    customExperience: [],
    customProjects: [],
    availability: "",
    motivation: "",
    additionalInfo: "",
    cvLink: "",
    publicationsLink: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setFormData({
        selectedEducation: [],
        selectedExperience: [],
        selectedProjects: [],
        customEducation: [],
        customExperience: [],
        customProjects: [],
        availability: "",
        motivation: "",
        additionalInfo: "",
        cvLink: "",
        publicationsLink: "",
      });
      setCurrentTab("selection");
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await getStudentProfile(token);
      if (response.student) {
        setProfile(response.student);
        setFormData((prev) => ({
          ...prev,
          cvLink: response.student.resumeLink || "",
          publicationsLink: response.student.publicationsLink || "",
        }));
      }
    } catch (err: unknown) {
      console.error("Error fetching profile:", err);
      setError(extractErrorMessage(err, "Failed to load profile data"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!formData.availability || !formData.motivation) {
      setError("Please fill in availability and motivation");
      return;
    }

    if (!formData.cvLink) {
      setError("Please provide a CV/Resume link");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";

      // Save custom education and experience to profile first
      await saveCustomEntriesToProfile();

      let priorProjectsText = "";
      
      // Add selected education from profile
      if (profile?.educationDetails && formData.selectedEducation.length > 0) {
        priorProjectsText += "=== EDUCATION ===\n\n";
        const selectedEducationText = formData.selectedEducation
          .map((idx) => {
            const edu = profile.educationDetails![idx];
            return `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}\n${edu.institution}\n${edu.startDate} - ${edu.current ? "Present" : edu.endDate || ""}${
              edu.description ? `\n${edu.description}` : ""
            }`;
          })
          .join("\n\n");
        priorProjectsText += selectedEducationText + "\n\n";
      }

      // Add custom education
      if (formData.customEducation.length > 0) {
        const validCustomEducation = formData.customEducation.filter(
          (edu) => edu.institution && edu.degree
        );
        if (validCustomEducation.length > 0) {
          if (!priorProjectsText.includes("=== EDUCATION ===")) {
            priorProjectsText += "=== EDUCATION ===\n\n";
          }
          const customEducationText = validCustomEducation
            .map((edu) => {
              return `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}\n${edu.institution}\n${edu.startDate} - ${edu.current ? "Present" : edu.endDate || ""}${
                edu.description ? `\n${edu.description}` : ""
              }`;
            })
            .join("\n\n");
          priorProjectsText += customEducationText + "\n\n";
        }
      }

      // Add selected experience from profile
      if (profile?.experienceDetails && formData.selectedExperience.length > 0) {
        priorProjectsText += "=== WORK EXPERIENCE ===\n\n";
        const selectedExperienceText = formData.selectedExperience
          .map((idx) => {
            const exp = profile.experienceDetails![idx];
            return `${exp.title}\n${exp.company}${exp.location ? ` • ${exp.location}` : ""}\n${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}${
              exp.description ? `\n${exp.description}` : ""
            }`;
          })
          .join("\n\n");
        priorProjectsText += selectedExperienceText + "\n\n";
      }

      // Add custom experience
      if (formData.customExperience.length > 0) {
        const validCustomExperience = formData.customExperience.filter(
          (exp) => exp.title && exp.company
        );
        if (validCustomExperience.length > 0) {
          if (!priorProjectsText.includes("=== WORK EXPERIENCE ===")) {
            priorProjectsText += "=== WORK EXPERIENCE ===\n\n";
          }
          const customExperienceText = validCustomExperience
            .map((exp) => {
              return `${exp.title}\n${exp.company}${exp.location ? ` • ${exp.location}` : ""}\n${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}${
                exp.description ? `\n${exp.description}` : ""
              }`;
            })
            .join("\n\n");
          priorProjectsText += customExperienceText + "\n\n";
        }
      }

      if (profile?.projectsDetails && formData.selectedProjects.length > 0) {
        priorProjectsText += "=== PAST PROJECTS ===\n\n";
        const selectedProjectsText = formData.selectedProjects
          .map((idx) => {
            const proj = profile.projectsDetails![idx];
            return `${proj.title}\n${proj.description}${
              proj.technologies && proj.technologies.length > 0
                ? `\nTechnologies: ${proj.technologies.join(", ")}`
                : ""
            }${proj.link ? `\nLink: ${proj.link}` : ""}`;
          })
          .join("\n\n");
        priorProjectsText += selectedProjectsText + "\n\n";
      }

      if (formData.customProjects.length > 0) {
        const validCustomProjects = formData.customProjects.filter(
          (proj) => proj.title && proj.description
        );
        if (validCustomProjects.length > 0) {
          priorProjectsText += "=== ADDITIONAL PROJECTS ===\n\n";
          const customProjectsText = validCustomProjects
            .map((proj) => {
              return `${proj.title}\n${proj.description}${
                proj.technologies && proj.technologies.length > 0
                  ? `\nTechnologies: ${proj.technologies.join(", ")}`
                  : ""
              }${proj.link ? `\nLink: ${proj.link}` : ""}`;
            })
            .join("\n\n");
          priorProjectsText += customProjectsText + "\n\n";
        }
      }

      if (formData.additionalInfo) {
        priorProjectsText += "=== ADDITIONAL INFORMATION ===\n\n";
        priorProjectsText += formData.additionalInfo;
      }

      const applicationData: ApplicationData = {
        availability: formData.availability,
        motivation: formData.motivation,
        priorProjects: priorProjectsText,
        cvLink: formData.cvLink,
        publicationsLink: formData.publicationsLink,
      };

      await applyToProject(projectId, applicationData, token);

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: unknown) {
      console.error("Error submitting application:", err);
      setError(extractErrorMessage(err, "Failed to submit application"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setCurrentTab("selection");
    onClose();
  };

  const toggleEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedEducation: prev.selectedEducation.includes(index)
        ? prev.selectedEducation.filter((i) => i !== index)
        : [...prev.selectedEducation, index],
    }));
  };

  const toggleExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedExperience: prev.selectedExperience.includes(index)
        ? prev.selectedExperience.filter((i) => i !== index)
        : [...prev.selectedExperience, index],
    }));
  };

  const toggleProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(index)
        ? prev.selectedProjects.filter((i) => i !== index)
        : [...prev.selectedProjects, index],
    }));
  };

  const addCustomProject = () => {
    setFormData((prev) => ({
      ...prev,
      customProjects: [
        ...prev.customProjects,
        { title: "", description: "", technologies: [], link: "" },
      ],
    }));
  };

  const updateCustomProject = (index: number, field: keyof ProjectEntry, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      customProjects: prev.customProjects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const removeCustomProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customProjects: prev.customProjects.filter((_, i) => i !== index),
    }));
  };

  const addCustomEducation = () => {
    setFormData((prev) => ({
      ...prev,
      customEducation: [
        ...prev.customEducation,
        { institution: "", degree: "", field: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    }));
  };

  const updateCustomEducation = (index: number, field: keyof EducationEntry, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      customEducation: prev.customEducation.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeCustomEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customEducation: prev.customEducation.filter((_, i) => i !== index),
    }));
  };

  const addCustomExperience = () => {
    setFormData((prev) => ({
      ...prev,
      customExperience: [
        ...prev.customExperience,
        { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    }));
  };

  const updateCustomExperience = (index: number, field: keyof ExperienceEntry, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      customExperience: prev.customExperience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeCustomExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customExperience: prev.customExperience.filter((_, i) => i !== index),
    }));
  };

  const saveCustomEntriesToProfile = async () => {
    if (!profile) return;

    const hasCustomEducation = formData.customEducation.some(edu => edu.institution && edu.degree);
    const hasCustomExperience = formData.customExperience.some(exp => exp.title && exp.company);
    const hasCustomProjects = formData.customProjects.some(proj => proj.title && proj.description);

    if (!hasCustomEducation && !hasCustomExperience && !hasCustomProjects) return;

    try {
      const token = localStorage.getItem("token") || "";
      const updatedProfile: StudentProfile = {
        ...profile,
      };

      if (hasCustomEducation) {
        const validCustomEducation = formData.customEducation.filter(edu => edu.institution && edu.degree);
        updatedProfile.educationDetails = [
          ...(profile.educationDetails || []),
          ...validCustomEducation,
        ];
      }

      if (hasCustomExperience) {
        const validCustomExperience = formData.customExperience.filter(exp => exp.title && exp.company);
        updatedProfile.experienceDetails = [
          ...(profile.experienceDetails || []),
          ...validCustomExperience,
        ];
      }

      if (hasCustomProjects) {
        const validCustomProjects = formData.customProjects.filter(proj => proj.title && proj.description);
        updatedProfile.projectsDetails = [
          ...(profile.projectsDetails || []),
          ...validCustomProjects,
        ];
      }

      await updateStudentProfile(updatedProfile, token);
      
      // Refresh profile to get the updated data
      const response = await getStudentProfile(token);
      if (response.student) {
        setProfile(response.student);
      }
    } catch (err: unknown) {
      console.error("Error saving custom entries to profile:", err);
      // Don't throw error - we still want to submit the application
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Apply to {projectName}</DialogTitle>
          <DialogDescription>
            Select information from your profile and provide application details.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="selection">Profile Selection</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] pr-4">
              <TabsContent value="selection" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Education</CardTitle>
                    <CardDescription>
                      Choose which education entries to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile?.educationDetails && profile.educationDetails.length > 0 ? (
                      profile.educationDetails.map((edu, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 border rounded-lg p-3"
                        >
                          <Checkbox
                            id={`edu-${index}`}
                            checked={formData.selectedEducation.includes(index)}
                            onCheckedChange={() => toggleEducation(index)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`edu-${index}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {edu.institution}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                            </p>
                            {edu.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No education entries in your profile.
                      </p>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomEducation}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Education (will be saved to profile)
                      </Button>
                    </div>

                    {formData.customEducation.map((edu, index) => (
                      <div key={`custom-edu-${index}`} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Custom Education #{index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomEducation(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`custom-edu-institution-${index}`}>Institution *</Label>
                            <Input
                              id={`custom-edu-institution-${index}`}
                              value={edu.institution}
                              onChange={(e) => updateCustomEducation(index, "institution", e.target.value)}
                              placeholder="University name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-edu-degree-${index}`}>Degree *</Label>
                            <Input
                              id={`custom-edu-degree-${index}`}
                              value={edu.degree}
                              onChange={(e) => updateCustomEducation(index, "degree", e.target.value)}
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-edu-field-${index}`}>Field of Study</Label>
                            <Input
                              id={`custom-edu-field-${index}`}
                              value={edu.field}
                              onChange={(e) => updateCustomEducation(index, "field", e.target.value)}
                              placeholder="Computer Science, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-edu-start-${index}`}>Start Date</Label>
                            <Input
                              id={`custom-edu-start-${index}`}
                              value={edu.startDate}
                              onChange={(e) => updateCustomEducation(index, "startDate", e.target.value)}
                              placeholder="Jan 2020"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-edu-end-${index}`}>End Date</Label>
                            <Input
                              id={`custom-edu-end-${index}`}
                              value={edu.endDate || ""}
                              onChange={(e) => updateCustomEducation(index, "endDate", e.target.value)}
                              placeholder="May 2024"
                              disabled={edu.current}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                              id={`custom-edu-current-${index}`}
                              checked={edu.current || false}
                              onCheckedChange={(checked) => updateCustomEducation(index, "current", checked as boolean)}
                            />
                            <Label htmlFor={`custom-edu-current-${index}`}>Currently studying</Label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`custom-edu-desc-${index}`}>Description</Label>
                          <Textarea
                            id={`custom-edu-desc-${index}`}
                            value={edu.description || ""}
                            onChange={(e) => updateCustomEducation(index, "description", e.target.value)}
                            placeholder="Additional details about your education..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Work Experience</CardTitle>
                    <CardDescription>
                      Choose which work experience entries to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile?.experienceDetails && profile.experienceDetails.length > 0 ? (
                      profile.experienceDetails.map((exp, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 border rounded-lg p-3"
                        >
                          <Checkbox
                            id={`exp-${index}`}
                            checked={formData.selectedExperience.includes(index)}
                            onCheckedChange={() => toggleExperience(index)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`exp-${index}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {exp.title}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {exp.company}
                              {exp.location ? ` • ${exp.location}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </p>
                            {exp.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No work experience entries in your profile.
                      </p>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomExperience}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Work Experience (will be saved to profile)
                      </Button>
                    </div>

                    {formData.customExperience.map((exp, index) => (
                      <div key={`custom-exp-${index}`} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Custom Experience #{index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomExperience(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`custom-exp-title-${index}`}>Job Title *</Label>
                            <Input
                              id={`custom-exp-title-${index}`}
                              value={exp.title}
                              onChange={(e) => updateCustomExperience(index, "title", e.target.value)}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-exp-company-${index}`}>Company *</Label>
                            <Input
                              id={`custom-exp-company-${index}`}
                              value={exp.company}
                              onChange={(e) => updateCustomExperience(index, "company", e.target.value)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-exp-location-${index}`}>Location</Label>
                            <Input
                              id={`custom-exp-location-${index}`}
                              value={exp.location || ""}
                              onChange={(e) => updateCustomExperience(index, "location", e.target.value)}
                              placeholder="City, Country"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-exp-start-${index}`}>Start Date</Label>
                            <Input
                              id={`custom-exp-start-${index}`}
                              value={exp.startDate}
                              onChange={(e) => updateCustomExperience(index, "startDate", e.target.value)}
                              placeholder="Jan 2020"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`custom-exp-end-${index}`}>End Date</Label>
                            <Input
                              id={`custom-exp-end-${index}`}
                              value={exp.endDate || ""}
                              onChange={(e) => updateCustomExperience(index, "endDate", e.target.value)}
                              placeholder="May 2024"
                              disabled={exp.current}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                              id={`custom-exp-current-${index}`}
                              checked={exp.current || false}
                              onCheckedChange={(checked) => updateCustomExperience(index, "current", checked as boolean)}
                            />
                            <Label htmlFor={`custom-exp-current-${index}`}>Currently working here</Label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`custom-exp-desc-${index}`}>Description</Label>
                          <Textarea
                            id={`custom-exp-desc-${index}`}
                            value={exp.description || ""}
                            onChange={(e) => updateCustomExperience(index, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Past Projects</CardTitle>
                    <CardDescription>
                      Choose which projects from your profile to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile?.projectsDetails && profile.projectsDetails.length > 0 ? (
                      profile.projectsDetails.map((proj, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 border rounded-lg p-3"
                        >
                          <Checkbox
                            id={`proj-${index}`}
                            checked={formData.selectedProjects.includes(index)}
                            onCheckedChange={() => toggleProject(index)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`proj-${index}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {proj.title}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {proj.description}
                            </p>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Tech: {proj.technologies.join(", ")}
                              </p>
                            )}
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                {proj.link}
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No projects in your profile. You can add them in your profile page or add custom projects below.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Projects</CardTitle>
                    <CardDescription>
                      Add other projects not in your profile that are relevant to this application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.customProjects.map((proj, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">Project {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomProject(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor={`custom-proj-title-${index}`}>
                            Project Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`custom-proj-title-${index}`}
                            value={proj.title}
                            onChange={(e) =>
                              updateCustomProject(index, "title", e.target.value)
                            }
                            placeholder="Project name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`custom-proj-desc-${index}`}>
                            Description <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id={`custom-proj-desc-${index}`}
                            value={proj.description}
                            onChange={(e) =>
                              updateCustomProject(index, "description", e.target.value)
                            }
                            placeholder="Describe the project and your contributions"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`custom-proj-tech-${index}`}>
                            Technologies (Optional)
                          </Label>
                          <Input
                            id={`custom-proj-tech-${index}`}
                            value={proj.technologies?.join(", ") || ""}
                            onChange={(e) =>
                              updateCustomProject(
                                index,
                                "technologies",
                                e.target.value.split(",").map((t) => t.trim()).filter((t) => t)
                              )
                            }
                            placeholder="React, Python, TensorFlow (comma-separated)"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`custom-proj-link-${index}`}>
                            Link (Optional)
                          </Label>
                          <Input
                            id={`custom-proj-link-${index}`}
                            type="url"
                            value={proj.link || ""}
                            onChange={(e) =>
                              updateCustomProject(index, "link", e.target.value)
                            }
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomProject}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Project (will be saved to profile)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                    <CardDescription>
                      Any other relevant information about your projects or experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.additionalInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalInfo: e.target.value })
                      }
                      placeholder="Add any additional context, achievements, or information that would strengthen your application..."
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="application" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Details</CardTitle>
                    <CardDescription>
                      Complete the required fields for your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="availability">
                        Availability <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="availability"
                        value={formData.availability}
                        onChange={(e) =>
                          setFormData({ ...formData, availability: e.target.value })
                        }
                        placeholder="When are you available? (e.g., 10-15 hours/week, weekends only, full-time during summer)"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="motivation">
                        Motivation / Why This Project? <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="motivation"
                        value={formData.motivation}
                        onChange={(e) =>
                          setFormData({ ...formData, motivation: e.target.value })
                        }
                        placeholder="Why are you interested in this project? What makes you a good fit? What do you hope to gain?"
                        rows={6}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                    <CardDescription>
                      Your CV and publications (auto-filled from profile, but you can customize for this application)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cvLink">
                        CV/Resume Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cvLink"
                        type="url"
                        value={formData.cvLink}
                        onChange={(e) =>
                          setFormData({ ...formData, cvLink: e.target.value })
                        }
                        placeholder="https://drive.google.com/..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can provide a different CV specific to this application
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="publicationsLink">
                        Publications Link (Optional)
                      </Label>
                      <Input
                        id="publicationsLink"
                        type="url"
                        value={formData.publicationsLink}
                        onChange={(e) =>
                          setFormData({ ...formData, publicationsLink: e.target.value })
                        }
                        placeholder="https://scholar.google.com/..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Link to your publications, research papers, or academic profile
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Application Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Education entries:</span>{" "}
                      {formData.selectedEducation.length + formData.customEducation.filter(edu => edu.institution && edu.degree).length}
                    </div>
                    <div>
                      <span className="font-medium">Work experience entries:</span>{" "}
                      {formData.selectedExperience.length + formData.customExperience.filter(exp => exp.title && exp.company).length}
                    </div>
                    <div>
                      <span className="font-medium">Past projects from profile:</span>{" "}
                      {formData.selectedProjects.length}
                    </div>
                    <div>
                      <span className="font-medium">Additional custom projects:</span>{" "}
                      {formData.customProjects.filter((p) => p.title && p.description).length}
                    </div>
                    <div>
                      <span className="font-medium">CV provided:</span>{" "}
                      {formData.cvLink ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Publications provided:</span>{" "}
                      {formData.publicationsLink ? "Yes" : "No"}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {currentTab === "selection" && (
                <Button onClick={() => setCurrentTab("projects")}>
                  Next: Projects
                </Button>
              )}
              {currentTab === "projects" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("selection")}
                  >
                    Back
                  </Button>
                  <Button onClick={() => setCurrentTab("application")}>
                    Next: Application
                  </Button>
                </>
              )}
              {currentTab === "application" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentTab("projects")}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button onClick={handleSubmitApplication} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
