"use client";

import { useState } from "react";
import { ProfileForm, type ProfileData } from "@/components/profile-form";
import { ResumePreview } from "@/components/resume-preview";

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>({
    education: {
      institution: "Thapar Institute of Engineering and Technology",
      degree: "Bachelor of Engineering in Computer Science",
      location: "Patiala, Punjab",
      dates: "2023 – 2027",
      notes: "",
    },
    experience: [
      {
        role: "Executive Member",
        org: "Creative Computing Society | TIET Society",
        location: "Patiala, Punjab",
        dates: "Oct 2024 – present",
        summary: "Community building and technical events.",
      },
      {
        role: "Undergraduate Research Intern",
        org: "Thapar Institute of Technology, CSED",
        location: "Patiala, Punjab",
        dates: "Jul 2025 – present",
        summary:
          "Working on Time Frequency Silent Speech Detection System as an ML/DL research intern.",
      },
    ],
    skills: {
      languages: ["JavaScript", "Python", "C++"],
      frameworks: ["React", "Node.js", "PyTorch"],
      libraries: ["Pandas", "NumPy", "Matplotlib"],
      researchInterest: "Machine Learning / Deep Learning",
      intention: "Research collaboration",
    },
    achievements:
      "Winner – Hackathon X 2025; Published a workshop paper on PINNs for heat transfer.",
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-balance text-3xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Fill the form and see a live resume-style preview.
        </p>
      </header>

      <div className="flex gap-6 h-[80vh]">
        {" "}
        {/* or h-full if parent is sized */}
        <div className="flex-1 min-w-0">
          <ProfileForm value={data} onChange={setData} />
        </div>
        <div className="flex-1 min-w-0">
          <ResumePreview data={data} />
        </div>
      </div>
    </main>
  );
}
