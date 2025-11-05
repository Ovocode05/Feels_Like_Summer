"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { ResearchPreferences } from "@/api/api";

interface QuestionnaireModalProps {
  open: boolean;
  onComplete: (preferences: ResearchPreferences) => void;
  onClose?: () => void;
  initialData?: Partial<ResearchPreferences>;
  isEditing?: boolean;
}

const FIELDS_OF_STUDY = [
  "Computer Science",
  "Physics",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Engineering",
  "Psychology",
  "Economics",
  "Environmental Science",
  "Data Science",
  "Artificial Intelligence",
  "Neuroscience",
  "Other",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner - Just starting out" },
  { value: "intermediate", label: "Intermediate - Some research experience" },
  { value: "advanced", label: "Advanced - Significant research background" },
];

const INTEREST_AREAS_BY_FIELD: Record<string, string[]> = {
  "Computer Science": [
    "Machine Learning",
    "Artificial Intelligence",
    "Computer Vision",
    "Natural Language Processing",
    "Cybersecurity",
    "Distributed Systems",
    "Human-Computer Interaction",
    "Algorithms",
  ],
  Physics: [
    "Quantum Mechanics",
    "Particle Physics",
    "Astrophysics",
    "Condensed Matter",
    "Theoretical Physics",
    "Computational Physics",
  ],
  Mathematics: [
    "Number Theory",
    "Algebra",
    "Topology",
    "Analysis",
    "Applied Mathematics",
    "Computational Mathematics",
  ],
  Biology: [
    "Molecular Biology",
    "Genetics",
    "Neuroscience",
    "Ecology",
    "Bioinformatics",
    "Systems Biology",
  ],
  // Add more as needed
  Other: ["General Research"],
};

export default function QuestionnaireModal({
  open,
  onComplete,
  onClose,
  initialData,
  isEditing = false,
}: QuestionnaireModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ResearchPreferences>>(
    initialData || {
      field_of_study: "",
      experience_level: "",
      current_year: 1,
      goals: "",
      time_commitment: 10,
      interest_areas: "",
      prior_experience: "",
    }
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData?.interest_areas ? JSON.parse(initialData.interest_areas) : []
  );
  const [customInterest, setCustomInterest] = useState("");

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setStep(1); // Always reset to step 1 when modal opens
      setIsSubmitting(false); // Reset submitting state

      if (initialData) {
        console.log("Modal opened with initialData:", initialData);
        setFormData(initialData);
        if (initialData.interest_areas) {
          try {
            setSelectedInterests(JSON.parse(initialData.interest_areas));
          } catch (e) {
            console.error("Failed to parse interest_areas:", e);
            setSelectedInterests([]);
          }
        } else {
          setSelectedInterests([]);
        }
      } else {
        console.log("Modal opened without initialData - resetting form");
        // Reset to defaults for new preferences
        setFormData({
          field_of_study: "",
          experience_level: "",
          current_year: 1,
          goals: "",
          time_commitment: 10,
          interest_areas: "",
          prior_experience: "",
        });
        setSelectedInterests([]);
      }
    }
  }, [open, initialData]);

  const totalSteps = 4; // Reduced from 5 since we removed preferred_format
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.filter((i) => i !== interest));
  };

  const handleFieldOfStudyChange = (value: string) => {
    setFormData({ ...formData, field_of_study: value });
    // Clear selected interests when field of study changes
    // Only keep interests that exist in the new field's interest areas
    const newFieldInterests = INTEREST_AREAS_BY_FIELD[value] || INTEREST_AREAS_BY_FIELD["Other"];
    setSelectedInterests((prev) => prev.filter((interest) => newFieldInterests.includes(interest)));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    const preferences: ResearchPreferences = {
      field_of_study: formData.field_of_study || "",
      experience_level: formData.experience_level || "",
      current_year: formData.current_year || 1,
      goals: formData.goals || "",
      time_commitment: formData.time_commitment || 10,
      interest_areas: JSON.stringify(selectedInterests),
      prior_experience: formData.prior_experience || "",
    };
    console.log("Modal handleSubmit - preferences:", preferences);
    console.log("Modal handleSubmit - formData:", formData);
    console.log("Modal handleSubmit - selectedInterests:", selectedInterests);

    try {
      await onComplete(preferences);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.field_of_study && formData.experience_level;
      case 2:
        return (
          formData.current_year &&
          formData.current_year > 0 &&
          formData.time_commitment &&
          formData.time_commitment > 0
        );
      case 3:
        return selectedInterests.length > 0;
      case 4:
        return formData.goals && formData.goals.length > 20;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing
              ? "Update Your Research Preferences"
              : "Let's Personalize Your Research Journey"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify your preferences to generate a new roadmap"
              : "Answer a few questions to get a customized research roadmap"}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-right">
            Step {step} of {totalSteps}
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="field_of_study">Field of Study</Label>
                <Select
                  value={formData.field_of_study}
                  onValueChange={handleFieldOfStudyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELDS_OF_STUDY.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, experience_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_year">Current Year of Study</Label>
                <Input
                  id="current_year"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.current_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_year: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="e.g., 3"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your current year in your program (1-10)
                </p>
              </div>

              <div>
                <Label htmlFor="time_commitment">
                  Weekly Time Commitment (hours)
                </Label>
                <Input
                  id="time_commitment"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.time_commitment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_commitment: parseInt(e.target.value) || 10,
                    })
                  }
                  placeholder="e.g., 10"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How many hours per week can you dedicate to research?
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Areas of Interest</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select all areas that interest you (choose at least one)
                </p>
                
                {/* Selected interests with remove option */}
                {selectedInterests.length > 0 && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium mb-2">Selected Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="default"
                          className="cursor-pointer hover:bg-destructive flex items-center gap-1"
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          {interest}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click on an interest to remove it
                    </p>
                  </div>
                )}
                
                {/* Predefined interest options */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(
                    INTEREST_AREAS_BY_FIELD[formData.field_of_study || ""] ||
                    INTEREST_AREAS_BY_FIELD["Other"]
                  ).map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        selectedInterests.includes(interest)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                {/* Add custom interest */}
                <div>
                  <Label htmlFor="custom-interest" className="text-xs">
                    Add Custom Interest Area
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="custom-interest"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      placeholder="Enter a custom interest area..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomInterest();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomInterest}
                      disabled={!customInterest.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can't find your interest? Add it here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="goals">Research Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) =>
                    setFormData({ ...formData, goals: e.target.value })
                  }
                  placeholder="What do you want to achieve through research? What are your long-term career goals?"
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.goals?.length || 0} / 500 characters (min 20)
                </p>
              </div>

              <div>
                <Label htmlFor="prior_experience">
                  Prior Research Experience (Optional)
                </Label>
                <Textarea
                  id="prior_experience"
                  value={formData.prior_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prior_experience: e.target.value,
                    })
                  }
                  placeholder="Describe any previous research projects, internships, or relevant coursework"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Review Your Preferences</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Field:</strong> {formData.field_of_study}
                </li>
                <li>
                  <strong>Experience:</strong> {formData.experience_level}
                </li>
                <li>
                  <strong>Year:</strong> {formData.current_year}
                </li>
                <li>
                  <strong>Time Commitment:</strong> {formData.time_commitment}{" "}
                  hours/week
                </li>
                <li>
                  <strong>Interests:</strong> {selectedInterests.join(", ")}
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{isEditing ? "Update & Generate" : "Generate Roadmap"}</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
