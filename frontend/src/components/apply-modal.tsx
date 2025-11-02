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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import {
  getStudentProfile,
  updateStudentProfile,
  applyToProject,
  type ApplicationData,
  type StudentProfile,
} from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnyCnameRecord } from "node:dns";

const LANG_OPTS = [
  "JavaScript",
  "GoLang",
  "Python",
  "C",
  "C++",
  "Julia",
  "SQL",
  "R",
  "Matlab",
];
const FRAMEWORK_OPTS = ["React", "Next.js", "Node.js", "PyTorch", "TensorFlow"];
const LIB_OPTS = ["Pandas", "NumPy", "Matplotlib", "OpenCV", "DeepSpeed"];

const RESEARCH_OPTS = [
  "Machine Learning / Deep Learning",
  "NLP",
  "Computer Vision",
  "Numerical Analysis (PDE/ODE)",
  "Quantum Mechanics",
];

const INTENT_OPTS = [
  "Learning",
  "Networking",
  "Job search",
  "Showcase portfolio",
  "Research collaboration",
];

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
}

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
  const [currentTab, setCurrentTab] = useState("profile");

  // Profile data
  const [profile, setProfile] = useState<StudentProfile>({
    institution: "",
    degree: "",
    location: "",
    dates: "",
    workEx: "",
    projects: [],
    skills: [],
    activities: [],
    resumeLink: "",
    publicationsLink: "",
    researchInterest: "",
    intention: "",
  });

  // Application-specific data
  const [application, setApplication] = useState<ApplicationData>({
    availability: "",
    motivation: "",
    priorProjects: "",
    cvLink: "",
    publicationsLink: "",
  });

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await getStudentProfile(token);
      if (response.student) {
        setProfile({
          institution: response.student.institution || "",
          degree: response.student.degree || "",
          location: response.student.location || "",
          dates: response.student.dates || "",
          workEx: response.student.workEx || "",
          projects: response.student.projects || [],
          skills: response.student.skills || [],
          activities: response.student.activities || [],
          resumeLink: response.student.resumeLink || "",
          publicationsLink: response.student.publicationsLink || "",
          researchInterest: response.student.researchInterest || "",
          intention: response.student.intention || "",
        });
        // Pre-fill application links from profile
        setApplication((prev) => ({
          ...prev,
          cvLink: response.student.resumeLink || "",
          publicationsLink: response.student.publicationsLink || "",
        }));
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      // If profile doesn't exist (404), that's okay - they can fill it in
      // We'll create it when they save
      if (err.response?.status === 404) {
        console.log("No existing profile found, will create new one on save");
      } else {
        setError("Failed to load profile data");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await updateStudentProfile(profile, token);
      
      console.log("Profile update response:", response);
      
      // Update application links from profile after saving
      setApplication((prev) => ({
        ...prev,
        cvLink: profile.resumeLink || "",
        publicationsLink: profile.publicationsLink || "",
      }));
      
      // Move to application tab
      setCurrentTab("application");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      console.error("Error response:", err.response);
      
      const errorMessage = err.response?.data?.error || err.message || "Failed to update profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    // Validate required fields
    if (!application.availability || !application.motivation) {
      setError("Please fill in availability and motivation");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || "";
      
      // Use CV and publications from profile
      const applicationData = {
        ...application,
        cvLink: profile.resumeLink || "",
        publicationsLink: profile.publicationsLink || "",
      };
      
      // Submit application with profile data
      await applyToProject(projectId, applicationData, token);
      
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError(
        err.response?.data?.error || "Failed to submit application"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setCurrentTab("profile");
    onClose();
  };

  const toggleSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...(prev.skills || []), skill],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {projectName}</DialogTitle>
          <DialogDescription>
            Review and update your profile, then complete your application.
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="application">Application Details</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              {/* Education */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-1">
                  Education
                </h3>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={profile.institution}
                      onChange={(e) =>
                        setProfile({ ...profile, institution: e.target.value })
                      }
                      placeholder="Your university/college"
                    />
                  </div>
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={profile.degree}
                      onChange={(e) =>
                        setProfile({ ...profile, degree: e.target.value })
                      }
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) =>
                          setProfile({ ...profile, location: e.target.value })
                        }
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dates">Dates</Label>
                      <Input
                        id="dates"
                        value={profile.dates}
                        onChange={(e) =>
                          setProfile({ ...profile, dates: e.target.value })
                        }
                        placeholder="2020 - 2024"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-1">
                  Experience
                </h3>
                <div>
                  <Label htmlFor="workEx">Work Experience</Label>
                  <Textarea
                    id="workEx"
                    value={profile.workEx}
                    onChange={(e) =>
                      setProfile({ ...profile, workEx: e.target.value })
                    }
                    placeholder="Describe your relevant work experience..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-1">Skills</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-2 block">Programming Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANG_OPTS.map((lang) => (
                        <label
                          key={lang}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={profile.skills?.includes(lang)}
                            onCheckedChange={() => toggleSkill(lang)}
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Frameworks</Label>
                    <div className="flex flex-wrap gap-2">
                      {FRAMEWORK_OPTS.map((fw) => (
                        <label
                          key={fw}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={profile.skills?.includes(fw)}
                            onCheckedChange={() => toggleSkill(fw)}
                          />
                          {fw}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Libraries</Label>
                    <div className="flex flex-wrap gap-2">
                      {LIB_OPTS.map((lib) => (
                        <label
                          key={lib}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={profile.skills?.includes(lib)}
                            onCheckedChange={() => toggleSkill(lib)}
                          />
                          {lib}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Interest */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="researchInterest">Research Interest</Label>
                  <Select
                    value={profile.researchInterest}
                    onValueChange={(value) =>
                      setProfile({ ...profile, researchInterest: value })
                    }
                  >
                    <SelectTrigger id="researchInterest">
                      <SelectValue placeholder="Select research interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {RESEARCH_OPTS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intention">Platform Intention</Label>
                  <Select
                    value={profile.intention}
                    onValueChange={(value) =>
                      setProfile({ ...profile, intention: value })
                    }
                  >
                    <SelectTrigger id="intention">
                      <SelectValue placeholder="Select your intention" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {INTENT_OPTS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold border-b pb-1">
                  Documents
                </h3>
                <div>
                  <Label htmlFor="resumeLink">Resume/CV Link</Label>
                  <Input
                    id="resumeLink"
                    type="url"
                    value={profile.resumeLink}
                    onChange={(e) =>
                      setProfile({ ...profile, resumeLink: e.target.value })
                    }
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="profilePublicationsLink">
                    Publications Link (Optional)
                  </Label>
                  <Input
                    id="profilePublicationsLink"
                    type="url"
                    value={profile.publicationsLink}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        publicationsLink: e.target.value,
                      })
                    }
                    placeholder="https://scholar.google.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleProfileUpdate} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Next: Application Details"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="application" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="availability">
                    Availability <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="availability"
                    value={application.availability}
                    onChange={(e) =>
                      setApplication({
                        ...application,
                        availability: e.target.value,
                      })
                    }
                    placeholder="When are you available to work on this project? (e.g., 10-15 hours/week, weekends only, full-time during summer, etc.)"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">
                    Motivation <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="motivation"
                    value={application.motivation}
                    onChange={(e) =>
                      setApplication({
                        ...application,
                        motivation: e.target.value,
                      })
                    }
                    placeholder="Why are you interested in this project? What makes you a good fit?"
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priorProjects">
                    Prior Projects (Optional)
                  </Label>
                  <Textarea
                    id="priorProjects"
                    value={application.priorProjects}
                    onChange={(e) =>
                      setApplication({
                        ...application,
                        priorProjects: e.target.value,
                      })
                    }
                    placeholder="Describe relevant projects you've worked on that relate to this opportunity..."
                    rows={4}
                  />
                </div>

                {/* Display CV and Publications from profile */}
                <div className="rounded-md border border-muted p-4 space-y-2 bg-muted/30">
                  <h4 className="text-sm font-semibold mb-2">Documents from your profile:</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">CV/Resume:</span>{" "}
                      {profile.resumeLink ? (
                        <a 
                          href={profile.resumeLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.resumeLink}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Publications:</span>{" "}
                      {profile.publicationsLink ? (
                        <a 
                          href={profile.publicationsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.publicationsLink}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    To update these, go back to the Profile Information tab.
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setCurrentTab("profile")}>
                  Back to Profile
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
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
