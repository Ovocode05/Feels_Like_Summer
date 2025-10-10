import { redirect } from "next/navigation"
import ProfilePrompt from "@/components/profile-prompt"

export const dynamic = "force-static"

export default function ProfileOnboardingPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Server Action to handle the submitted profile prompt
  async function saveProfile(formData: FormData) {
    "use server"
    const bio = (formData.get("bio") || "").toString().trim()
    const intents = (formData.get("intents") || "").toString().trim()
    const topics = (formData.get("topics") || "").toString().trim()
    const role = (formData.get("role") || "student").toString()

    // TODO: Persist to your database or user profile store.
    console.log("[v0] Profile submission:", { role, bio, intents, topics })

    redirect("/")
  }

  const roleParam = typeof searchParams?.role === "string" ? searchParams?.role : undefined
  const defaultRole = roleParam === "professor" ? "professor" : "student"

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">Complete your profile</h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground text-pretty">
          Using a prompt to let the user describe themselves in natural language is a much more modern and fluid
          experience than a rigid questionnaire.
        </p>
      </header>

      <section aria-labelledby="describe-yourself">
        <h2 id="describe-yourself" className="sr-only">
          Describe yourself
        </h2>

        <ProfilePrompt
          action={saveProfile}
          defaultRole={defaultRole as "student" | "professor"}
          suggestions={[
            "I’m a self-taught web developer focused on React and TypeScript.",
            "I’m passionate about building tools that help people learn faster.",
            "I want to create a portfolio, collaborate on open-source, and find mentorship.",
          ]}
          hintTopics={["Web Development", "AI/ML", "Design Systems", "Open Source", "Career Switch", "Freelance"]}
        />
      </section>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        By continuing, you agree to share this information with your account. You can edit it anytime in Settings.
      </footer>
    </main>
  )
}
