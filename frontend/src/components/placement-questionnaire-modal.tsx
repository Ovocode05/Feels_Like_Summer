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
import { PlacementPreferences } from "@/api/api";
import { Checkbox } from "@/components/ui/checkbox";

interface PlacementQuestionnaireModalProps {
  open: boolean;
  onComplete: (preferences: PlacementPreferences) => void;
  onClose?: () => void;
  initialData?: Partial<PlacementPreferences>;
  isEditing?: boolean;
}

const INTENSITY_TYPES = [
  {
    value: "regular",
    label: "Regular & Moderate",
    desc: "8-10 hrs/week - Balanced pace with steady progress",
  },
  {
    value: "intense",
    label: "Intense & Focused",
    desc: "15-20 hrs/week - Fast-paced, maximum efficiency",
  },
  {
    value: "weekend",
    label: "Weekend-Only",
    desc: "5-6 hrs/week - Condensed weekend schedule",
  },
];

const PREP_AREAS = [
  { value: "aptitude", label: "Aptitude", desc: "Quant + Logical + Verbal" },
  { value: "dsa", label: "DSA / Coding", desc: "Data Structures & Algorithms" },
  {
    value: "core_cs",
    label: "Core CS Subjects",
    desc: "DBMS, OS, CN, OOP, etc.",
  },
  {
    value: "resume",
    label: "Resume & Projects",
    desc: "Build portfolio and resume",
  },
  {
    value: "interview",
    label: "Interview Skills",
    desc: "Tech + HR interviews",
  },
  {
    value: "company_specific",
    label: "Company-Specific",
    desc: "Target company preparation",
  },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner - Just starting" },
  { value: "intermediate", label: "Intermediate - Some practice done" },
  { value: "confident", label: "Confident - Good understanding" },
];

const COMMON_RESOURCES = {
  dsa: [
    "Striver's A2Z Sheet",
    "Love Babbar 450",
    "LeetCode",
    "NeetCode",
    "GeeksForGeeks DSA",
  ],
  aptitude: ["PrepInsta", "IndiaBix", "RS Aggarwal", "Arun Sharma Book"],
  core_cs: ["GeeksForGeeks", "Gate Smashers YouTube", "Neso Academy"],
  interview: ["InterviewBit", "Pramp", "CareerCup", "Pramp Mock Interviews"],
};

export default function PlacementQuestionnaireModal({
  open,
  onComplete,
  onClose,
  initialData,
  isEditing = false,
}: PlacementQuestionnaireModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timelineWeeks, setTimelineWeeks] = useState<number>(
    initialData?.timeline_weeks || 12
  );
  const [timeCommitment, setTimeCommitment] = useState<number>(
    initialData?.time_commitment || 10
  );
  const [intensityType, setIntensityType] = useState<string>(
    initialData?.intensity_type || ""
  );
  const [selectedPrepAreas, setSelectedPrepAreas] = useState<string[]>(() => {
    if (initialData?.prep_areas) {
      try {
        return JSON.parse(initialData.prep_areas);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [currentLevels, setCurrentLevels] = useState<Record<string, string>>(
    () => {
      if (initialData?.current_levels) {
        try {
          return JSON.parse(initialData.current_levels);
        } catch {
          return {};
        }
      }
      return {};
    }
  );
  const [resourcesStarted, setResourcesStarted] = useState<string[]>(() => {
    if (initialData?.resources_started) {
      try {
        return JSON.parse(initialData.resources_started);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [targetCompanies, setTargetCompanies] = useState<string[]>(() => {
    if (initialData?.target_companies) {
      try {
        return JSON.parse(initialData.target_companies);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [goals, setGoals] = useState<string>(initialData?.goals || "");
  const [specialNeeds, setSpecialNeeds] = useState<string>(
    initialData?.special_needs || ""
  );

  const [customResource, setCustomResource] = useState("");
  const [customCompany, setCustomCompany] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setIsSubmitting(false);

      if (initialData) {
        setTimelineWeeks(initialData.timeline_weeks || 12);
        setTimeCommitment(initialData.time_commitment || 10);
        setIntensityType(initialData.intensity_type || "");
        setSelectedPrepAreas(
          initialData.prep_areas ? JSON.parse(initialData.prep_areas) : []
        );
        setCurrentLevels(
          initialData.current_levels
            ? JSON.parse(initialData.current_levels)
            : {}
        );
        setResourcesStarted(
          initialData.resources_started
            ? JSON.parse(initialData.resources_started)
            : []
        );
        setTargetCompanies(
          initialData.target_companies
            ? JSON.parse(initialData.target_companies)
            : []
        );
        setGoals(initialData.goals || "");
        setSpecialNeeds(initialData.special_needs || "");
      } else {
        // Reset to defaults
        setTimelineWeeks(12);
        setTimeCommitment(10);
        setIntensityType("");
        setSelectedPrepAreas([]);
        setCurrentLevels({});
        setResourcesStarted([]);
        setTargetCompanies([]);
        setGoals("");
        setSpecialNeeds("");
      }
    }
  }, [open, initialData]);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePrepAreaToggle = (area: string) => {
    setSelectedPrepAreas((prev) => {
      if (prev.includes(area)) {
        // Remove area and its current level
        const newLevels = { ...currentLevels };
        delete newLevels[area];
        setCurrentLevels(newLevels);
        return prev.filter((a) => a !== area);
      } else {
        return [...prev, area];
      }
    });
  };

  const handleLevelChange = (area: string, level: string) => {
    setCurrentLevels((prev) => ({ ...prev, [area]: level }));
  };

  const handleAddResource = () => {
    if (
      customResource.trim() &&
      !resourcesStarted.includes(customResource.trim())
    ) {
      setResourcesStarted((prev) => [...prev, customResource.trim()]);
      setCustomResource("");
    }
  };

  const handleRemoveResource = (resource: string) => {
    setResourcesStarted((prev) => prev.filter((r) => r !== resource));
  };

  const handleAddCompany = () => {
    if (
      customCompany.trim() &&
      !targetCompanies.includes(customCompany.trim())
    ) {
      setTargetCompanies((prev) => [...prev, customCompany.trim()]);
      setCustomCompany("");
    }
  };

  const handleRemoveCompany = (company: string) => {
    setTargetCompanies((prev) => prev.filter((c) => c !== company));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const preferences: PlacementPreferences = {
      timeline_weeks: timelineWeeks,
      time_commitment: timeCommitment,
      intensity_type: intensityType,
      prep_areas: JSON.stringify(selectedPrepAreas),
      current_levels: JSON.stringify(currentLevels),
      resources_started: JSON.stringify(resourcesStarted),
      target_companies: JSON.stringify(targetCompanies),
      goals: goals,
      special_needs: specialNeeds,
    };

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
        return timelineWeeks > 0 && timeCommitment > 0 && intensityType !== "";
      case 2:
        return selectedPrepAreas.length > 0;
      case 3:
        return selectedPrepAreas.every((area) => currentLevels[area]);
      case 4:
        return true; // Resources and companies are optional
      case 5:
        return goals.length >= 20;
      default:
        return true;
    }
  };

  const getIntensitySuggestion = () => {
    if (timelineWeeks <= 4) return "intense";
    if (timelineWeeks >= 16) return "regular";
    return timeCommitment >= 15 ? "intense" : "regular";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">
            {isEditing
              ? "Update Your Placement Prep Plan"
              : "Build Your Placement Roadmap"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isEditing
              ? "Modify your prep strategy to generate a new personalized roadmap"
              : "Answer these questions to get your customized placement preparation plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-right">
            Step {step} of {totalSteps}
          </p>
        </div>

        <div className="space-y-6">
          {/* STEP 1: Timeline & Commitment */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-l-4 border-primary rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2">
                  📅 Time & Commitment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Let&apos;s understand your timeline and availability to create
                  a realistic plan
                </p>
              </div>

              <div>
                <Label htmlFor="timeline_weeks">
                  Weeks Until Placements/Internships Begin
                </Label>
                <Input
                  id="timeline_weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(parseInt(e.target?.value))}
                  placeholder="e.g., 12"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How many weeks do you have? (1-52 weeks)
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
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(parseInt(e.target?.value))}
                  placeholder="e.g., 10"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How many hours per week can you realistically dedicate? (1-40
                  hours)
                </p>
              </div>

              <div>
                <Label>Choose Your Intensity Type</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your timeline of {timelineWeeks} weeks, we suggest:{" "}
                  <span className="font-semibold">
                    {getIntensitySuggestion()}
                  </span>
                </p>
                <div className="space-y-2">
                  {INTENSITY_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        intensityType === type.value
                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                      onClick={() => setIntensityType(type.value)}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={intensityType === type.value}
                          onCheckedChange={() => setIntensityType(type.value)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {type.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Preparation Areas */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-l-4 border-primary rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2">🎯 Prep Areas</h3>
                <p className="text-sm text-muted-foreground">
                  Select one or more areas you want to prepare. We&apos;ll
                  balance them across your weekly hours.
                </p>
              </div>

              <div>
                <Label>Choose Your Preparation Areas</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  You can select multiple areas - we&apos;ll help you balance
                  them
                </p>

                <div className="space-y-2">
                  {PREP_AREAS.map((area) => (
                    <div
                      key={area.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPrepAreas.includes(area.value)
                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                      onClick={() => handlePrepAreaToggle(area.value)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedPrepAreas.includes(area.value)}
                          onCheckedChange={() =>
                            handlePrepAreaToggle(area.value)
                          }
                        />
                        <div>
                          <div className="font-medium">{area.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {area.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPrepAreas.length > 0 && (
                  <div className="mt-4 p-3 border-l-4 border-primary rounded-md bg-muted/30">
                    <p className="text-sm font-medium">
                      ✓ Selected {selectedPrepAreas.length} area
                      {selectedPrepAreas.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your roadmap will balance these areas across{" "}
                      {timeCommitment} hours/week
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Current Levels */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-l-4 border-primary rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2">
                  📊 Your Current Level
                </h3>
                <p className="text-sm text-muted-foreground">
                  Be honest! This helps us start from the right difficulty level
                  for you.
                </p>
              </div>

              <div>
                <Label>Rate Your Current Level in Each Area</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  This helps us tailor the roadmap difficulty and starting point
                </p>

                {selectedPrepAreas.map((area) => {
                  const areaInfo = PREP_AREAS.find((a) => a.value === area);
                  return (
                    <div
                      key={area}
                      className="mb-4 p-4 border rounded-lg bg-card"
                    >
                      <Label className="mb-2 block font-semibold">
                        {areaInfo?.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        {areaInfo?.desc}
                      </p>
                      <Select
                        value={currentLevels[area] || ""}
                        onValueChange={(value) =>
                          handleLevelChange(area, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current level" />
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
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Resources & Companies */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-l-4 border-primary rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2">
                  📚 Resources & Target Companies
                </h3>
                <p className="text-sm text-muted-foreground">
                  Optional but helpful! Tell us what you&apos;ve started and
                  where you want to work.
                </p>
              </div>

              <div>
                <Label>Resources Already Started (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Have you started any sheets/courses? We&apos;ll build upon
                  them rather than starting fresh.
                </p>

                {resourcesStarted.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {resourcesStarted.map((resource) => (
                      <Badge
                        key={resource}
                        variant="default"
                        className="cursor-pointer hover:bg-destructive px-3 py-1"
                        onClick={() => handleRemoveResource(resource)}
                      >
                        {resource}
                        <X className="h-3 w-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Quick add common resources */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Quick add common resources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrepAreas.includes("dsa") &&
                      COMMON_RESOURCES.dsa.map((res) => (
                        <Badge
                          key={res}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            if (!resourcesStarted.includes(res)) {
                              setResourcesStarted((prev) => [...prev, res]);
                            }
                          }}
                        >
                          + {res}
                        </Badge>
                      ))}
                    {selectedPrepAreas.includes("aptitude") &&
                      COMMON_RESOURCES.aptitude.map((res) => (
                        <Badge
                          key={res}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            if (!resourcesStarted.includes(res)) {
                              setResourcesStarted((prev) => [...prev, res]);
                            }
                          }}
                        >
                          + {res}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customResource}
                    onChange={(e) => setCustomResource(e.target.value)}
                    placeholder="e.g., Striver's A2Z Sheet"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddResource();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddResource}
                    disabled={!customResource.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label>Target Companies (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  We&apos;ll include company-specific preparation if you name
                  them
                </p>

                {targetCompanies.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {targetCompanies.map((company) => (
                      <Badge
                        key={company}
                        variant="default"
                        className="cursor-pointer hover:bg-destructive px-3 py-1"
                        onClick={() => handleRemoveCompany(company)}
                      >
                        {company}
                        <X className="h-3 w-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g., Google, Microsoft, Amazon, Infosys"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCompany();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCompany}
                    disabled={!customCompany.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Goals & Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="border-l-4 border-primary rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-sm mb-2">
                  🎯 Your Goals & Final Review
                </h3>
                <p className="text-sm text-muted-foreground">
                  Almost there! Tell us about your goals to complete your
                  personalized plan.
                </p>
              </div>

              <div>
                <Label htmlFor="goals">Your Goals & Target Role</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Example: I want to secure a Software Engineer role at a product-based company. Targeting roles in backend development with a salary of 10+ LPA. Interested in working on scalable systems."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {goals?.length || 0} / 500 characters (minimum 20 required)
                </p>
              </div>

              <div>
                <Label htmlFor="special_needs">
                  Special Requirements (Optional)
                </Label>
                <Textarea
                  id="special_needs"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="Any specific needs? E.g., Need to focus on puzzles for ZS Associates, Prefer video resources over text, Want more mock interview practice"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-3">
                  📋 Review Your Preparation Plan
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">{timelineWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly Hours:</span>
                    <span className="font-medium">
                      {timeCommitment} hours/week
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intensity:</span>
                    <span className="font-medium capitalize">
                      {intensityType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prep Areas:</span>
                    <span className="font-medium text-right">
                      {selectedPrepAreas
                        .map(
                          (a) =>
                            PREP_AREAS.find((area) => area.value === a)?.label
                        )
                        .join(", ")}
                    </span>
                  </div>
                  {targetCompanies.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Target Companies:
                      </span>
                      <span className="font-medium text-right">
                        {targetCompanies.join(", ")}
                      </span>
                    </div>
                  )}
                  {resourcesStarted.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Resources Started:
                      </span>
                      <span className="font-medium text-right">
                        {resourcesStarted.length} resource
                        {resourcesStarted.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-l-4 border-primary rounded-md bg-muted/30">
                <p className="text-sm font-medium">
                  💡 Your personalized roadmap will:
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>
                    Provide week-by-week breakdown for all {timelineWeeks} weeks
                  </li>
                  <li>
                    Balance {selectedPrepAreas.length} prep area
                    {selectedPrepAreas.length > 1 ? "s" : ""} across{" "}
                    {timeCommitment} hours/week
                  </li>
                  <li>
                    Include only free, trusted resources (LeetCode,
                    GeeksForGeeks, YouTube, etc.)
                  </li>
                  <li>Adapt difficulty based on your current levels</li>
                  {targetCompanies.length > 0 && (
                    <li>Include company-specific preparation in later weeks</li>
                  )}
                  <li>Provide clear weekly milestones and goals</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
          >
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
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  {isEditing
                    ? "Update & Regenerate Roadmap"
                    : "Generate My Personalized Roadmap"}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
