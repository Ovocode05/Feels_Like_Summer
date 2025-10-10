"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ProfileData = {
  education: {
    institution: string;
    degree: string;
    location: string;
    dates: string;
    notes?: string;
  };
  experience: Array<{
    role: string;
    org: string;
    location: string;
    dates: string;
    summary?: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    libraries: string[];
    researchInterest: string;
    intention: string;
  };
  achievements: string;
};

type Props = {
  value: ProfileData;
  onChange: (next: ProfileData) => void;
};

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

export function ProfileForm({ value, onChange }: Props) {
  const baseId = useId();

  function toggleMulti(
    key: "languages" | "frameworks" | "libraries",
    v: string
  ) {
    const current = new Set(value.skills[key]);
    if (current.has(v)) current.delete(v);
    else current.add(v);
    onChange({
      ...value,
      skills: { ...value.skills, [key]: Array.from(current) },
    });
  }

  return (
    <section
      className={cn(
        "rounded-md border border-foreground/40",
        "bg-background p-4 md:p-6"
      )}
      aria-label="Edit Profile"
    >
      <h2 className="mb-4 text-lg font-semibold">Edit details</h2>

      {/* Education */}
      <fieldset className="space-y-3">
        <legend className="mb-1 border-b border-foreground/50 pb-1 text-base font-medium">
          Education
        </legend>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor={`${baseId}-inst`}>Institution</Label>
            <Input
              id={`${baseId}-inst`}
              value={value.education.institution}
              onChange={(e) =>
                onChange({
                  ...value,
                  education: {
                    ...value.education,
                    institution: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${baseId}-deg`}>Degree</Label>
            <Input
              id={`${baseId}-deg`}
              value={value.education.degree}
              onChange={(e) =>
                onChange({
                  ...value,
                  education: { ...value.education, degree: e.target.value },
                })
              }
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`${baseId}-loc`}>Location</Label>
              <Input
                id={`${baseId}-loc`}
                value={value.education.location}
                onChange={(e) =>
                  onChange({
                    ...value,
                    education: { ...value.education, location: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`${baseId}-dates`}>Dates</Label>
              <Input
                id={`${baseId}-dates`}
                value={value.education.dates}
                onChange={(e) =>
                  onChange({
                    ...value,
                    education: { ...value.education, dates: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor={`${baseId}-notes`}>Notes (optional)</Label>
            <Textarea
              id={`${baseId}-notes`}
              value={value.education.notes || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  education: { ...value.education, notes: e.target.value },
                })
              }
            />
          </div>
        </div>
      </fieldset>

      {/* Experience */}
      <fieldset className="mt-6 space-y-3">
        <legend className="mb-1 border-b border-foreground/50 pb-1 text-base font-medium">
          Experience
        </legend>

        {value.experience.map((exp, idx) => (
          <div key={idx} className="rounded-sm border border-foreground/20 p-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor={`${baseId}-role-${idx}`}>Role</Label>
                <Input
                  id={`${baseId}-role-${idx}`}
                  value={exp.role}
                  onChange={(e) => {
                    const next = [...value.experience];
                    next[idx] = { ...exp, role: e.target.value };
                    onChange({ ...value, experience: next });
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor={`${baseId}-org-${idx}`}>Organization</Label>
                <Input
                  id={`${baseId}-org-${idx}`}
                  value={exp.org}
                  onChange={(e) => {
                    const next = [...value.experience];
                    next[idx] = { ...exp, org: e.target.value };
                    onChange({ ...value, experience: next });
                  }}
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor={`${baseId}-loc-${idx}`}>Location</Label>
                <Input
                  id={`${baseId}-loc-${idx}`}
                  value={exp.location}
                  onChange={(e) => {
                    const next = [...value.experience];
                    next[idx] = { ...exp, location: e.target.value };
                    onChange({ ...value, experience: next });
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor={`${baseId}-dates-${idx}`}>Dates</Label>
                <Input
                  id={`${baseId}-dates-${idx}`}
                  value={exp.dates}
                  onChange={(e) => {
                    const next = [...value.experience];
                    next[idx] = { ...exp, dates: e.target.value };
                    onChange({ ...value, experience: next });
                  }}
                />
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              <Label htmlFor={`${baseId}-sum-${idx}`}>Summary</Label>
              <Textarea
                id={`${baseId}-sum-${idx}`}
                value={exp.summary || ""}
                onChange={(e) => {
                  const next = [...value.experience];
                  next[idx] = { ...exp, summary: e.target.value };
                  onChange({ ...value, experience: next });
                }}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="border-foreground/40 bg-transparent"
          onClick={() =>
            onChange({
              ...value,
              experience: [
                ...value.experience,
                {
                  role: "",
                  org: "",
                  location: "",
                  dates: "",
                  summary: "",
                },
              ],
            })
          }
        >
          Add experience
        </Button>
      </fieldset>

      {/* Skills */}
      <fieldset className="mt-6 space-y-3">
        <legend className="mb-1 border-b border-foreground/50 pb-1 text-base font-medium">
          Skills
        </legend>

        <div className="grid gap-4 md:grid-cols-1">
          <div className="grid gap-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANG_OPTS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Checkbox
                    checked={value.skills.languages.includes(opt)}
                    onCheckedChange={() => toggleMulti("languages", opt)}
                    aria-label={opt}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Frameworks</Label>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORK_OPTS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Checkbox
                    checked={value.skills.frameworks.includes(opt)}
                    onCheckedChange={() => toggleMulti("frameworks", opt)}
                    aria-label={opt}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Libraries</Label>
            <div className="flex flex-wrap gap-2">
              {LIB_OPTS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Checkbox
                    checked={value.skills.libraries.includes(opt)}
                    onCheckedChange={() => toggleMulti("libraries", opt)}
                    aria-label={opt}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`${baseId}-research`}>Research interest</Label>
          <Select
            value={value.skills.researchInterest}
            onValueChange={(v) =>
              onChange({
                ...value,
                skills: { ...value.skills, researchInterest: v },
              })
            }
          >
            <SelectTrigger
              id={`${baseId}-research`}
              className="border-foreground/40"
            >
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectGroup>
                {RESEARCH_OPTS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`${baseId}-intent`}>Intention on this platform</Label>
          <Select
            value={value.skills.intention}
            onValueChange={(v) =>
              onChange({ ...value, skills: { ...value.skills, intention: v } })
            }
          >
            <SelectTrigger
              id={`${baseId}-intent`}
              className="border-foreground/40"
            >
              <SelectValue placeholder="Choose intention" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectGroup>
                {INTENT_OPTS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      {/* Achievements */}
      <fieldset className="mt-6 space-y-3">
        <legend className="mb-1 border-b border-foreground/50 pb-1 text-base font-medium">
          Achievements
        </legend>
        <Textarea
          value={value.achievements}
          onChange={(e) => onChange({ ...value, achievements: e.target.value })}
          placeholder="Awards, publications, certifications…"
        />
      </fieldset>

      <div className="mt-6">
        <Button
          type="button"
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Save (demo)
        </Button>
      </div>
    </section>
  );
}
