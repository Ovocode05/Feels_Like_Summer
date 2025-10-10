"use client"

import type React from "react"

import type { ProfileData } from "./profile-form"
import { cn } from "@/lib/utils"

export function ResumePreview({ data }: { data: ProfileData }) {
  return (
    <section
      className={cn("rounded-md border border-foreground/40 bg-background p-4 md:p-6", "text-foreground")}
      aria-label="Resume Preview"
    >
      <h2 className="mb-4 text-lg font-semibold">Preview</h2>

      <DividerTitle>Education</DividerTitle>
      <div className="mt-2 grid grid-cols-[1fr_auto] items-start gap-x-4">
        <div>
          <p className="text-lg font-semibold">{data.education.institution}</p>
          <p className="italic text-sm">{data.education.degree}</p>
          {data.education.notes ? <p className="mt-1 text-sm">{data.education.notes}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-medium">{data.education.location}</p>
          <p className="text-sm">{data.education.dates}</p>
        </div>
      </div>

      <DividerTitle className="mt-6">Experience</DividerTitle>
      <ul className="mt-2 space-y-4">
        {data.experience.map((e, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto] items-start gap-x-4">
            <div>
              <p className="text-base font-semibold">{e.org}</p>
              <p className="italic text-sm">{e.role}</p>
              {e.summary ? <p className="mt-1 text-sm">{e.summary}</p> : null}
            </div>
            <div className="text-right">
              <p className="font-medium">{e.location}</p>
              <p className="text-sm">{e.dates}</p>
            </div>
          </li>
        ))}
      </ul>

      <DividerTitle className="mt-6">Skills</DividerTitle>
      <div className="mt-2 space-y-2">
        <LineItem label="Languages" value={formatList(data.skills.languages)} />
        <LineItem label="Frameworks" value={formatList(data.skills.frameworks)} />
        <LineItem label="Libraries" value={formatList(data.skills.libraries)} />
        <LineItem label="Research Interest" value={data.skills.researchInterest} />
        <LineItem label="Intention" value={data.skills.intention} />
      </div>

      <DividerTitle className="mt-6">Achievements</DividerTitle>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {splitAchievements(data.achievements).map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </section>
  )
}

function DividerTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h3 className={cn("border-b border-foreground/60 pb-1 text-xl font-semibold", className)}>{children}</h3>
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}:</span> <span className="align-baseline">{value || "—"}</span>
    </p>
  )
}

function formatList(items: string[]) {
  return items.length ? items.join(", ") : "—"
}

function splitAchievements(text: string) {
  // Split by semicolon or newline for bullet rendering.
  return text
    .split(/[\n;]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
}
