"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type ProfilePromptProps = {
  action: (formData: FormData) => Promise<void>;
  suggestions?: string[];
  hintTopics?: string[];
  defaultRole?: "student" | "professor";
};

export default function ProfilePrompt({
  action,
  suggestions = [],
  hintTopics = [],
  defaultRole = "student",
}: ProfilePromptProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [value, setValue] = React.useState("");
  const [role, setRole] = React.useState<"student" | "professor">(defaultRole);
  const max = 1000;
  const router = useRouter();

  const studentPlaceholder =
    "Describe your current skills, what you're passionate about, and what you hope to achieve on this platform. The more detail, the better!";
  const professorPlaceholder =
    "Describe your primary research areas, your technical expertise, and the kinds of projects you typically offer to students. You can also mention what you look for in a student mentee (e.g., specific skills, level of commitment).";

  // Role-specific starter suggestions
  const professorSuggestions = [
    "I lead research in distributed systems with a focus on fault-tolerant microservices and observability.",
    "My lab works on NLP for education; I’m especially interested in dataset curation, prompt engineering, and evaluation.",
    "For mentees, I look for curiosity, consistency, and experience with Python, PyTorch, and reproducible experiments.",
  ];

  const studentSuggestions = suggestions.length
    ? suggestions
    : [
        "I’m a second-year CS student interested in full‑stack web development with React and TypeScript.",
        "I’m passionate about AI and want to build projects that combine LLMs with real-world data.",
        "I hope to contribute to open-source, build a strong portfolio, and find a mentor to guide my learning path.",
      ];

  const activeSuggestions =
    role === "professor" ? professorSuggestions : studentSuggestions;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function append(text: string) {
    setValue((prev) => (prev ? `${prev} ${text}` : text));
  }

  // Add this function to handle form submission
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Create a dictionary with text and role
    const data = {
      text: value,
      role: role,
    };
    console.log(data); // Log the dictionary to the console
    // Optionally, you can call your action here if you want to keep the original behavior:
    // action(new FormData(formRef.current!));
    router.push(`/${role}/dashboard`);
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-4"
      aria-describedby="prompt-help"
      onSubmit={handleSubmit} // <-- Add this
    >
      {/* Role selector */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            role === "student"
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-accent"
          )}
          aria-pressed={role === "student"}
        >
          I'm a Student
        </button>
        <button
          type="button"
          onClick={() => setRole("professor")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            role === "professor"
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-accent"
          )}
          aria-pressed={role === "professor"}
        >
          I'm a Professor
        </button>
      </div>

      {/* Prompt Box */}
      <div
        className={cn(
          "rounded-2xl border border-border bg-card shadow-sm",
          "transition-colors"
        )}
      >
        <div className="p-4 md:p-5">
          <label htmlFor="bio" className="sr-only">
            {role === "professor" ? professorPlaceholder : studentPlaceholder}
          </label>
          <textarea
            id="bio"
            name="bio"
            required
            maxLength={max}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              role === "professor" ? professorPlaceholder : studentPlaceholder
            }
            rows={7}
            className={cn(
              "w-full resize-y bg-transparent text-base leading-6",
              "placeholder:text-muted-foreground focus:outline-none"
            )}
          />
          <div className="mt-3 flex items-center justify-between">
            <p id="prompt-help" className="text-xs text-muted-foreground">
              Tip: Press Cmd/Ctrl + Enter to continue
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {value.length}/{max}
            </span>
          </div>
        </div>
      </div>

      {/* Intent chips */}
      {hintTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hintTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => append(`#${t}`)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs",
                "bg-muted text-foreground hover:bg-accent transition-colors"
              )}
              aria-label={`Add topic ${t}`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Hidden fields for optional structure downstream */}
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="intents" value="onboarding-profile" />
      <input
        type="hidden"
        name="topics"
        value={hintTopics.map((t) => `#${t}`).join(", ")}
      />

      {/* Smart suggestions */}
      {activeSuggestions.length > 0 && (
        <details className="rounded-xl border border-border bg-card p-3 md:p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Need inspiration? Try one of these starters
          </summary>
          <div className="mt-3 grid gap-2">
            {activeSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue(s)}
                className={cn(
                  "w-full text-left rounded-lg border border-border bg-background/50",
                  "px-3 py-2 text-sm hover:bg-accent transition-colors"
                )}
                aria-label="Use suggested description"
              >
                {s}
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          className={cn("bg-foreground text-background hover:bg-foreground/90")}
        >
          Save and continue
        </Button>
        <Link
          href="/"
          className={cn(
            "text-sm underline-offset-4 hover:underline text-foreground"
          )}
        >
          Skip for now
        </Link>
      </div>
    </form>
  );
}
