"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Copy, Check } from "lucide-react";
import type { RoadmapStructure } from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type RoadmapNodeData = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: string;
  resources?: string[];
  skills?: string[];
  next_nodes?: string[];
};

type RoadmapVisualizationProps = {
  roadmap: RoadmapStructure;
};

// Resource detail modal component
function ResourceDetailModal({
  node,
  open,
  onClose,
}: {
  node: RoadmapNodeData | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold leading-tight">
                {node.title}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {node.description}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2">
            <Clock className="h-4 w-4" />
            <span>{node.duration}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Skills Section */}
            {node.skills && node.skills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Skills You&apos;ll Learn
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.skills.map((skill: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {node.resources && node.resources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Learning Resources</h3>
                </div>
                <div className="space-y-2">
                  {node.resources.map((resource: string, idx: number) => {
                    const lower = resource.toLowerCase();
                    const isYouTube = lower.includes("youtube");
                    const isCourse = lower.includes("course");
                    const isWebsite = lower.includes("website");
                    const isPractice = lower.includes("practice");

                    let icon = "📚";
                    if (isYouTube) icon = "🎥";
                    else if (isCourse) icon = "🎓";
                    else if (isWebsite || isPractice) icon = "🌐";

                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-xl">{icon}</span>
                          <p className="text-sm leading-relaxed">{resource}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(resource, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function RoadmapVisualization({ roadmap }: RoadmapVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = (nodeData: RoadmapNodeData) => {
    setSelectedNode(nodeData);
    setIsModalOpen(true);
  };

  // Sort nodes by ID to ensure sequential order
  const sortedNodes = [...roadmap.nodes].sort((a, b) => {
    const aId = String(a.id);
    const bId = String(b.id);
    
    // Extract week numbers if present (e.g., "week_1" -> 1)
    const aMatch = aId.match(/week_(\d+)/);
    const bMatch = bId.match(/week_(\d+)/);
    
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    
    // Fallback to string comparison
    return aId.localeCompare(bId);
  });

  return (
    <>
      <ResourceDetailModal
        node={selectedNode}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="p-6 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="text-3xl font-bold">{roadmap.title}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {roadmap.description}
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold">{roadmap.total_time}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {sortedNodes.length} steps in your journey
            </div>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
          
          <div className="space-y-6">
            {sortedNodes.map((node, index) => {
              const nodeData: RoadmapNodeData = {
                id: String(node.id),
                title: node.title,
                description: node.description,
                category: node.category,
                duration: node.duration,
                resources: node.resources || [],
                skills: node.skills || [],
                next_nodes: node.next_nodes || [],
              };

              return (
                <div key={node.id} className="relative pl-20">
                  {/* Circle connector on the line */}
                  <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg z-10" />

                  {/* Card */}
                  <Card
                    className="cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 border-l-primary"
                    onClick={() => handleNodeClick(nodeData)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold leading-tight">
                            {node.title}
                          </CardTitle>
                          {node.description && (
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                              {node.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Clock className="h-4 w-4" />
                        <span>{node.duration}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{node.skills?.length || 0} skills</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{node.resources?.length || 0} resources</span>
                        </div>
                      </div>

                      {/* Skills preview */}
                      {node.skills && node.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {node.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {node.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{node.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-center text-primary font-medium pt-2 border-t">
                        Click to view all resources and details →
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* End marker */}
          <div className="relative pl-20 mt-8">
            <div className="absolute left-6 top-0 w-5 h-5 rounded-full bg-green-500 border-4 border-background shadow-lg z-10" />
            <div className="text-sm font-semibold text-green-600">
              🎉 Roadmap Complete!
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
