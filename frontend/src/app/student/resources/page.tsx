"use client";

import { Button } from "@/components/ui/button";
import { Settings, Loader2, RefreshCw } from "lucide-react";
import MenubarStudent from "@/components/ui/menubar_student";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import QuestionnaireModal from "@/components/questionnaire-modal";
import PlacementQuestionnaireModal from "@/components/placement-questionnaire-modal";
import RoadmapTypeSelector from "@/components/roadmap-type-selector";
import { RoadmapVisualization } from "@/components/roadmap-visualization";
import {
  getPreferences,
  generateRoadmap,
  savePreferences,
  getPlacementPreferences,
  generatePlacementRoadmap,
  savePlacementPreferences,
  type RoadmapStructure,
  type ResearchPreferences,
  type PlacementPreferences,
} from "@/api/api";
import { toast } from "sonner";
import { isAuthenticated, clearAuthData } from "@/lib/auth";

// small helper to extract error messages
const extractErrorMessage = (err: unknown, fallback = "An error occurred"): string => {
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
  }
  if ("message" in maybe && typeof maybe.message === "string")
    return maybe.message;
  return fallback;
};

export default function ResourcesPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [roadmapType, setRoadmapType] = useState<"research" | "placement" | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showResearchQuestionnaire, setShowResearchQuestionnaire] = useState(false);
  const [showPlacementQuestionnaire, setShowPlacementQuestionnaire] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStructure | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isCheckingPreferences, setIsCheckingPreferences] = useState(true);
  const [existingResearchPreferences, setExistingResearchPreferences] =
    useState<ResearchPreferences | null>(null);
  const [existingPlacementPreferences, setExistingPlacementPreferences] =
    useState<PlacementPreferences | null>(null);
  
  // Track if we're switching roadmap types (to preserve close button behavior)
  const [isSwitchingRoadmapType, setIsSwitchingRoadmapType] = useState(false);
  
  // Track the previous state before switching (to restore on cancel)
  const [previousRoadmapState, setPreviousRoadmapState] = useState<{
    roadmapType: "research" | "placement" | null;
    hasPreferences: boolean;
  } | null>(null);

  const loadResearchRoadmap = useCallback(
    async (token: string) => {
      try {
        setIsLoadingRoadmap(true);
        const response = await generateRoadmap(token);
        setRoadmap(response.roadmap);
        if (response.cached) {
          toast.success("Research roadmap loaded from cache");
        } else {
          toast.success("Your personalized research roadmap has been generated!");
        }
      } catch (err: unknown) {
        const msg = extractErrorMessage(err, "Failed to generate research roadmap");
        toast.error(msg);
      } finally {
        setIsLoadingRoadmap(false);
      }
    },
    []
  );

  const loadPlacementRoadmap = useCallback(
    async (token: string) => {
      try {
        setIsLoadingRoadmap(true);
        const response = await generatePlacementRoadmap(token);
        setRoadmap(response.roadmap);
        if (response.cached) {
          toast.success("Placement roadmap loaded from cache");
        } else {
          toast.success("Your personalized placement roadmap has been generated!");
        }
      } catch (err: unknown) {
        const msg = extractErrorMessage(err, "Failed to generate placement roadmap");
        toast.error(msg);
      } finally {
        setIsLoadingRoadmap(false);
      }
    },
    []
  );

  const checkPreferences = useCallback(
    async (token: string) => {
      try {
        setIsCheckingPreferences(true);
        
        // Check if user has a last preference stored - if not, show type selector first
        const lastRoadmapType = localStorage.getItem("lastRoadmapType") as "research" | "placement" | null;
        
        if (!lastRoadmapType) {
          // First time user - show type selector to choose
          setShowTypeSelector(true);
          setHasPreferences(false);
          return;
        }
        
        // Try to load based on last preference first, if available
        if (lastRoadmapType === "placement") {
          try {
            const placementPrefs = await getPlacementPreferences(token);
            setExistingPlacementPreferences(placementPrefs);
            setRoadmapType("placement");
            setHasPreferences(true);
            await loadPlacementRoadmap(token);
            return;
          } catch (placementErr) {
            console.log("No placement preferences found, trying research");
          }
        }
        
        // Try to load research preferences (either as first choice or fallback)
        try {
          const researchPrefs = await getPreferences(token);
          setExistingResearchPreferences(researchPrefs);
          setRoadmapType("research");
          setHasPreferences(true);
          await loadResearchRoadmap(token);
          return;
        } catch (researchErr) {
          console.log("No research preferences found");
        }

        // If lastRoadmapType was research and it failed, try placement
        if (lastRoadmapType === "research") {
          try {
            const placementPrefs = await getPlacementPreferences(token);
            setExistingPlacementPreferences(placementPrefs);
            setRoadmapType("placement");
            setHasPreferences(true);
            await loadPlacementRoadmap(token);
            return;
          } catch (placementErr) {
            console.log("No placement preferences found");
          }
        }

        // Preferences exist in localStorage but not on backend - show type selector
        setShowTypeSelector(true);
        setHasPreferences(false);
      } catch (err: unknown) {
        console.error("Error checking preferences:", err);
        setShowTypeSelector(true);
        setHasPreferences(false);
      } finally {
        setIsCheckingPreferences(false);
      }
    },
    [loadResearchRoadmap, loadPlacementRoadmap]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Check if authenticated with valid token
    if (!isAuthenticated()) {
      clearAuthData();
      router.push("/login?expired=true");
      return;
    }
    
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
  }, [router, checkPreferences]);

  const handleRoadmapTypeSelect = async (type: "research" | "placement") => {
    setRoadmapType(type);
    setShowTypeSelector(false);
    // Don't reset isSwitchingRoadmapType - keep it true until questionnaire is closed/completed
    
    // Save last roadmap type preference
    localStorage.setItem("lastRoadmapType", type);
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    
    // Try to load existing preferences for this type
    if (type === "research") {
      try {
        const prefs = await getPreferences(token);
        console.log("Loaded existing research preferences:", prefs);
        setExistingResearchPreferences(prefs);
      } catch (err) {
        console.log("No existing research preferences found");
        setExistingResearchPreferences(null);
      }
      setShowResearchQuestionnaire(true);
    } else {
      try {
        const prefs = await getPlacementPreferences(token);
        console.log("Loaded existing placement preferences:", prefs);
        setExistingPlacementPreferences(prefs);
      } catch (err) {
        console.log("No existing placement preferences found");
        setExistingPlacementPreferences(null);
      }
      setShowPlacementQuestionnaire(true);
    }
  };

  const handleResearchQuestionnaireComplete = async (
    preferences: ResearchPreferences
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      await savePreferences(preferences, token);
      toast.success("Research preferences saved successfully");

      setShowResearchQuestionnaire(false);
      setHasPreferences(true);
      setRoadmapType("research");
      
      // Reset switching flag and save preference
      setIsSwitchingRoadmapType(false);
      localStorage.setItem("lastRoadmapType", "research");

      await loadResearchRoadmap(token);
    } catch (err: unknown) {
      console.error("Error saving research preferences:", err);
      toast.error(extractErrorMessage(err, "Failed to save research preferences"));
    }
  };

  const handlePlacementQuestionnaireComplete = async (
    preferences: PlacementPreferences
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      await savePlacementPreferences(preferences, token);
      toast.success("Placement preferences saved successfully");

      setShowPlacementQuestionnaire(false);
      setHasPreferences(true);
      setRoadmapType("placement");
      
      // Reset switching flag and save preference
      setIsSwitchingRoadmapType(false);
      localStorage.setItem("lastRoadmapType", "placement");

      await loadPlacementRoadmap(token);
    } catch (err: unknown) {
      console.error("Error saving placement preferences:", err);
      toast.error(extractErrorMessage(err, "Failed to save placement preferences"));
    }
  };

  const handleEditPreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Always refresh preferences before editing to get latest data
    if (roadmapType === "research") {
      try {
        const prefs = await getPreferences(token);
        console.log("Refreshed research preferences before editing:", prefs);
        setExistingResearchPreferences(prefs);
        setShowResearchQuestionnaire(true);
      } catch (err: unknown) {
        console.error("Failed to load research preferences:", err);
        toast.error("Failed to load your preferences for editing");
      }
    } else if (roadmapType === "placement") {
      try {
        const prefs = await getPlacementPreferences(token);
        console.log("Refreshed placement preferences before editing:", prefs);
        setExistingPlacementPreferences(prefs);
        setShowPlacementQuestionnaire(true);
      } catch (err: unknown) {
        console.error("Failed to load placement preferences:", err);
        toast.error("Failed to load your preferences for editing");
      }
    }
  };

  const handleCloseQuestionnaire = () => {
    if (!hasPreferences && !isSwitchingRoadmapType) {
      // New user with no preferences - redirect to dashboard
      router.push("/student/");
    } else if (isSwitchingRoadmapType && previousRoadmapState) {
      // User was switching but canceled - restore exact previous state
      setShowResearchQuestionnaire(false);
      setShowPlacementQuestionnaire(false);
      setIsSwitchingRoadmapType(false);
      
      // Restore the exact previous roadmap type and load it
      const token = localStorage.getItem("token");
      if (token && previousRoadmapState.roadmapType) {
        setRoadmapType(previousRoadmapState.roadmapType);
        setHasPreferences(previousRoadmapState.hasPreferences);
        
        // Load the specific roadmap that was previously displayed
        if (previousRoadmapState.roadmapType === "placement") {
          loadPlacementRoadmap(token);
        } else {
          loadResearchRoadmap(token);
        }
      }
    } else {
      // User is editing existing preferences - just close modal
      setShowResearchQuestionnaire(false);
      setShowPlacementQuestionnaire(false);
    }
  };

  const handleSwitchRoadmapType = () => {
    // Save the current state before switching
    setPreviousRoadmapState({
      roadmapType,
      hasPreferences,
    });
    
    // Mark that we're switching roadmap types
    setIsSwitchingRoadmapType(true);
    
    // Clear current state
    setRoadmap(null);
    setHasPreferences(false);
    setRoadmapType(null);
    setExistingResearchPreferences(null);
    setExistingPlacementPreferences(null);
    
    // Show type selector
    setShowTypeSelector(true);
  };

  const handleCloseTypeSelector = () => {
    // If user closes type selector without selecting
    if (isSwitchingRoadmapType && previousRoadmapState) {
      // User was switching types but canceled - restore the exact previous state
      setShowTypeSelector(false);
      setIsSwitchingRoadmapType(false);
      
      // Restore the exact previous roadmap type and load it
      const token = localStorage.getItem("token");
      if (token && previousRoadmapState.roadmapType) {
        setRoadmapType(previousRoadmapState.roadmapType);
        setHasPreferences(previousRoadmapState.hasPreferences);
        
        // Load the specific roadmap that was previously displayed
        if (previousRoadmapState.roadmapType === "placement") {
          loadPlacementRoadmap(token);
        } else {
          loadResearchRoadmap(token);
        }
      }
    } else {
      // User is on initial selection - redirect to dashboard
      router.push("/student/");
    }
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
      
      {/* Roadmap Type Selector */}
      <RoadmapTypeSelector
        open={showTypeSelector}
        onSelect={handleRoadmapTypeSelect}
        onClose={handleCloseTypeSelector}
      />

      {/* Research Questionnaire Modal */}
      <QuestionnaireModal
        open={showResearchQuestionnaire}
        onComplete={handleResearchQuestionnaireComplete}
        onClose={handleCloseQuestionnaire}
        initialData={existingResearchPreferences || undefined}
        isEditing={hasPreferences && roadmapType === "research"}
      />

      {/* Placement Questionnaire Modal */}
      <PlacementQuestionnaireModal
        open={showPlacementQuestionnaire}
        onComplete={handlePlacementQuestionnaireComplete}
        onClose={handleCloseQuestionnaire}
        initialData={existingPlacementPreferences || undefined}
        isEditing={hasPreferences && roadmapType === "placement"}
      />

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {hasPreferences
                ? roadmapType === "research"
                  ? "Your Research Roadmap"
                  : "Your Placement Roadmap"
                : "Your Roadmap"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {hasPreferences
                ? roadmapType === "research"
                  ? "Your personalized learning path based on your research interests"
                  : "Your personalized preparation plan for placements and internships"
                : "Choose your path and start building your personalized roadmap"}
            </p>
          </div>
          {hasPreferences && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleSwitchRoadmapType}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Switch Roadmap Type
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEditPreferences}
                className="w-full sm:w-auto"
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Preferences
              </Button>
            </div>
          )}
        </div>

        {isLoadingRoadmap ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Generating your roadmap...</p>
              <p className="text-sm text-muted-foreground">
                This may take a moment
              </p>
            </div>
          </div>
        ) : roadmap ? (
          <div className="space-y-6">
            <RoadmapVisualization roadmap={roadmap} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
