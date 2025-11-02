"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
  // optional handler we attach when building nodes
  onNodeClick?: (data: RoadmapNodeData) => void;
};

type RoadmapVisualizationProps = {
  roadmap: RoadmapStructure;
};

// Custom node component for roadmap items
const RoadmapNode = ({ data }: { data: RoadmapNodeData }) => {
  const categoryColors: Record<string, string> = {
    foundation: "bg-blue-50 border-blue-400 hover:border-blue-500",
    core: "bg-green-50 border-green-400 hover:border-green-500",
    advanced: "bg-orange-50 border-orange-400 hover:border-orange-500",
    specialization: "bg-purple-50 border-purple-400 hover:border-purple-500",
  };

  const categoryBadgeColors: Record<string, string> = {
    foundation: "bg-blue-500 text-white",
    core: "bg-green-500 text-white",
    advanced: "bg-orange-500 text-white",
    specialization: "bg-purple-500 text-white",
  };

  const categoryColor =
    categoryColors[data.category?.toLowerCase()] ||
    "bg-gray-50 border-gray-400";

  const badgeColor =
    categoryBadgeColors[data.category?.toLowerCase()] ||
    "bg-gray-500 text-white";

  return (
    <Card
      className={`min-w-[280px] max-w-[320px] shadow-lg border-2 transition-all hover:shadow-2xl cursor-pointer ${categoryColor}`}
      onClick={() => data.onNodeClick?.(data)}
    >
      <CardHeader className="p-3 pb-2 space-y-1.5">
        <Badge className={`w-fit text-xs font-semibold ${badgeColor}`}>
          {data.category}
        </Badge>
        <CardTitle className="text-sm font-bold leading-tight">
          {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
          {data.description}
        </p>

        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Clock className="h-3 w-3" />
          <span>{data.duration}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{data.skills?.length || 0} skills</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{data.resources?.length || 0} resources</span>
          </div>
        </div>

        <div className="text-xs text-center text-primary font-medium pt-1 border-t">
          Click to view details →
        </div>
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  roadmapNode: RoadmapNode,
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

  const categoryColors: Record<string, string> = {
    foundation: "bg-blue-500",
    core: "bg-green-500",
    advanced: "bg-orange-500",
    specialization: "bg-purple-500",
  };

  const bgColor = categoryColors[node.category?.toLowerCase()] || "bg-gray-500";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Badge className={`${bgColor} text-white text-xs`}>
              {node.category}
            </Badge>
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
                  {/* escaped apostrophe to satisfy react/no-unescaped-entities */}
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
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNodeClick = useCallback((nodeData: RoadmapNodeData) => {
    setSelectedNode(nodeData);
    setIsModalOpen(true);
  }, []);

  // Generate nodes and edges from roadmap data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node<RoadmapNodeData>[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, { x: number; y: number; level: number }>();

    // Categorize nodes by their category
    const categories = ["foundation", "core", "advanced", "specialization"];
    const nodesByCategory = new Map<string, RoadmapNodeData[]>();

    roadmap.nodes.forEach((node) => {
      const category =
        (node.category as string | undefined)?.toLowerCase() || "foundation";
      if (!nodesByCategory.has(category)) {
        nodesByCategory.set(category, []);
      }
      // cast each roadmap node into RoadmapNodeData shape
      nodesByCategory.get(category)?.push({
        id: String(node.id),
        title: node.title,
        description: node.description,
        category: node.category,
        duration: node.duration,
        resources: node.resources || [],
        skills: node.skills || [],
        next_nodes: node.next_nodes || [],
      });
    });

    // Calculate positions based on category (level-based layout)
    let yOffset = 0;
    const levelSpacing = 280; // Tighter spacing
    const nodeSpacing = 400;

    categories.forEach((category, levelIndex) => {
      const nodesInCategory = nodesByCategory.get(category) || [];
      if (nodesInCategory.length === 0) return; // Skip empty categories

      const xStart = -(nodesInCategory.length - 1) * (nodeSpacing / 2);

      nodesInCategory.forEach((node, index) => {
        const x = xStart + index * nodeSpacing;
        const y = yOffset;

        nodeMap.set(node.id, { x, y, level: levelIndex });

        nodes.push({
          id: node.id,
          type: "roadmapNode",
          position: { x, y },
          data: {
            ...node,
            onNodeClick: handleNodeClick,
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        });
      });

      yOffset += levelSpacing;
    });

    // Create edges based on next_nodes
    roadmap.nodes.forEach((node) => {
      if (node.next_nodes && node.next_nodes.length > 0) {
        node.next_nodes.forEach((targetId) => {
          if (nodeMap.has(String(targetId))) {
            const sourceCategory =
              (node.category as string | undefined)?.toLowerCase() ||
              "foundation";
            const edgeColors: Record<string, string> = {
              foundation: "#3b82f6",
              core: "#10b981",
              advanced: "#f97316",
              specialization: "#a855f7",
            };

            const edgeColor = edgeColors[sourceCategory] || "#94a3b8";

            edges.push({
              id: `${node.id}-${targetId}`,
              source: String(node.id),
              target: String(targetId),
              type: "smoothstep",
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: edgeColor,
              },
              style: {
                strokeWidth: 3,
                stroke: edgeColor,
              },
              label: "→",
              labelStyle: { fill: edgeColor, fontWeight: 700 },
            });
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [roadmap, handleNodeClick]);

  // ignore the unused setters by skipping them in destructuring
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <>
      <ResourceDetailModal
        node={selectedNode}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="w-full h-[900px] border rounded-lg bg-background shadow-lg">
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
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
              Follow the connected path below ↓
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge className="bg-blue-500 text-white border-0">
              Foundation
            </Badge>
            <Badge className="bg-green-500 text-white border-0">Core</Badge>
            <Badge className="bg-orange-500 text-white border-0">
              Advanced
            </Badge>
            <Badge className="bg-purple-500 text-white border-0">
              Specialization
            </Badge>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-background border shadow-lg"
          />
        </ReactFlow>
      </div>
    </>
  );
}
