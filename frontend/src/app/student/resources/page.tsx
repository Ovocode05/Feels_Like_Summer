"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Loader2, BookOpen, FileText, Star, Clock } from "lucide-react";
import MenubarStudent from "@/components/ui/menubar_student";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionnaireModal from "@/components/questionnaire-modal";
import { RoadmapVisualization } from "@/components/roadmap-visualization";
import { getPreferences, generateRoadmap, savePreferences, type RoadmapStructure, type ResearchPreferences } from "@/api/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ResourcesPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStructure | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isCheckingPreferences, setIsCheckingPreferences] = useState(true);
  const [existingPreferences, setExistingPreferences] = useState<ResearchPreferences | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const decoded = jwtDecode(token) as { type: string };
    if (decoded.type !== "stu") {
      router.push("/login");
      return;
    }
    setIsAuth(true);
    checkPreferences(token);
  }, [router]);

  const checkPreferences = async (token: string) => {
    try {
      setIsCheckingPreferences(true);
      const prefs = await getPreferences(token);
      console.log("Fetched existing preferences:", prefs);
      setExistingPreferences(prefs);
      setHasPreferences(true);
      await loadRoadmap(token);
    } catch (error) {
      console.log("No existing preferences found, showing questionnaire");
      setShowQuestionnaire(true);
      setHasPreferences(false);
    } finally {
      setIsCheckingPreferences(false);
    }
  };

  const loadRoadmap = async (token: string) => {
    try {
      setIsLoadingRoadmap(true);
      const response = await generateRoadmap(token);
      setRoadmap(response.roadmap);
      if (response.cached) {
        toast.success("Roadmap loaded from cache");
      } else {
        toast.success("Your personalized roadmap has been generated!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate roadmap");
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const handleQuestionnaireComplete = async (preferences: ResearchPreferences) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      console.log("Saving preferences:", preferences);
      // Save preferences to backend first
      await savePreferences(preferences, token);
      toast.success("Preferences saved successfully");
      
      setShowQuestionnaire(false);
      setHasPreferences(true);
      
      // Now generate the roadmap
      await loadRoadmap(token);
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error(error.response?.data?.error || "Failed to save preferences");
    }
  };

  const handleEditPreferences = async () => {
    console.log("Edit preferences clicked. Current preferences:", existingPreferences);
    // Refresh preferences before editing
    const token = localStorage.getItem("token");
    if (token && !existingPreferences) {
      try {
        const prefs = await getPreferences(token);
        console.log("Refreshed preferences before editing:", prefs);
        setExistingPreferences(prefs);
      } catch (error) {
        console.log("No preferences to edit, starting fresh");
      }
    }
    setShowQuestionnaire(true);
  };

  if (!isAuth || isCheckingPreferences) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <QuestionnaireModal 
        open={showQuestionnaire} 
        onComplete={handleQuestionnaireComplete}
        initialData={existingPreferences || undefined}
        isEditing={hasPreferences}
      />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {hasPreferences ? "Your Research Roadmap" : "Research Resources"}
            </h1>
            <p className="text-muted-foreground">
              {hasPreferences
                ? "Your personalized learning path based on your preferences"
                : "Learning materials, roadmaps, and tools to help you succeed in your research journey."}
            </p>
          </div>
          {hasPreferences && (
            <Button variant="outline" onClick={handleEditPreferences}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Preferences
            </Button>
          )}
        </div>

        {isLoadingRoadmap ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Generating your roadmap...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          </div>
        ) : roadmap ? (
          <div className="space-y-6">
            <RoadmapVisualization roadmap={roadmap} />
            <AdditionalResourcesTabs />
          </div>
        ) : null}
      </main>
    </div>
  );
}

function AdditionalResourcesTabs() {
  return (
    <Tabs defaultValue="guides" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="guides">Learning Guides</TabsTrigger>
        <TabsTrigger value="tools">Research Tools</TabsTrigger>
      </TabsList>
      <TabsContent value="guides" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LEARNING_MATERIALS.map((material, i) => (
            <Card key={i}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{material.field}</Badge>
                <CardTitle className="mt-2">{material.title}</CardTitle>
                <CardDescription>{material.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{material.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{material.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{material.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Access Resource</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="tools" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_TOOLS.map((tool, i) => (
            <Card key={i}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{tool.category}</Badge>
                <CardTitle className="mt-2">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pricing:</span>
                    <span>{tool.pricing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{tool.rating} ({tool.reviews} reviews)</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Access Tool</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

const LEARNING_MATERIALS = [
  {
    title: "Introduction to Quantum Computing",
    type: "Course",
    author: "Dr. Richard Williams - MIT",
    format: "Video Lectures",
    duration: "10 hours",
    field: "Physics",
  },
  {
    title: "Machine Learning Fundamentals",
    type: "Reading List",
    author: "Dr. Sarah Lee - Stanford",
    format: "PDF Collection",
    duration: "Self-paced",
    field: "Computer Science",
  },
  {
    title: "Research Methodology",
    type: "Workshop",
    author: "Dr. James Chen - Harvard",
    format: "Interactive Sessions",
    duration: "8 weeks",
    field: "General",
  },
  {
    title: "Statistical Methods for Research",
    type: "Course",
    author: "Dr. Emily Rodriguez - UC Berkeley",
    format: "Video Lectures",
    duration: "12 hours",
    field: "Mathematics",
  },
  {
    title: "Scientific Writing",
    type: "Guide",
    author: "Dr. Michael Johnson - Caltech",
    format: "PDF Guide",
    duration: "Self-paced",
    field: "General",
  },
  {
    title: "Deep Learning for Computer Vision",
    type: "Course",
    author: "Dr. Lisa Park - UW",
    format: "Video & Labs",
    duration: "15 hours",
    field: "Computer Science",
  },
];

const RESEARCH_TOOLS = [
  {
    title: "Research Paper Finder",
    description: "Advanced search tool for finding relevant research papers across multiple databases.",
    category: "Literature Review",
    pricing: "Free",
    rating: 4.8,
    reviews: 245,
  },
  {
    title: "Citation Manager",
    description: "Organize and format citations for your research papers and publications.",
    category: "Writing",
    pricing: "Free / Premium",
    rating: 4.7,
    reviews: 320,
  },
  {
    title: "Data Visualization Suite",
    description: "Create professional charts, graphs, and visualizations for your research data.",
    category: "Data Analysis",
    pricing: "Free Trial",
    rating: 4.6,
    reviews: 189,
  },
  {
    title: "Statistical Analysis Tool",
    description: "Comprehensive statistical analysis package for research data.",
    category: "Data Analysis",
    pricing: "Free / Premium",
    rating: 4.9,
    reviews: 276,
  },
  {
    title: "Research Project Manager",
    description: "Organize your research workflow, tasks, and collaborations.",
    category: "Project Management",
    pricing: "Free",
    rating: 4.5,
    reviews: 152,
  },
  {
    title: "Lab Notebook",
    description: "Digital lab notebook for documenting experiments and research findings.",
    category: "Documentation",
    pricing: "Free / Premium",
    rating: 4.7,
    reviews: 198,
  },
];
