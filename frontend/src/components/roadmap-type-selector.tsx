"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, BookOpen, Target } from "lucide-react";

interface RoadmapTypeSelectorProps {
  open: boolean;
  onSelect: (type: "research" | "placement") => void;
  onClose?: () => void;
}

export default function RoadmapTypeSelector({
  open,
  onSelect,
  onClose,
}: RoadmapTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl sm:text-2xl text-center">
            Choose Your Preparation Path
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Select the type of roadmap you want to build
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Research/Learning Option */}
          <div
            className="group p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:scale-105 active:scale-100"
            onClick={() => onSelect("research")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-950 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Learn & Explore
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Build knowledge in research areas, explore topics, and develop
                  academic skills
                </p>
              </div>
              <div className="space-y-2 text-sm text-left w-full">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Research papers & journals</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Academic skills development</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Theoretical understanding</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg">
                Start Research Roadmap
              </Button>
            </div>
          </div>

          {/* Placement Preparation Option */}
          <div
            className="group p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:scale-105 active:scale-100"
            onClick={() => onSelect("placement")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-950 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
                <Target className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Prepare for Placements
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get ready for internships and job placements with structured
                  preparation
                </p>
              </div>
              <div className="space-y-2 text-sm text-left w-full">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">DSA & coding problems</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Aptitude & core CS subjects</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <span className="text-muted-foreground">Interview & company prep</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg">
                Start Placement Roadmap
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            💡 Don&apos;t worry, you can always change or update your preferences later
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
