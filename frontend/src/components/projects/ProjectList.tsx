import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

type ProjectType = {
  ID: number;
  pid: string;
  name: string;
  sdesc: string;
  ldesc: string;
  tags: string[];
  isActive: boolean | string;
  uid: string;
  user: {
    name: string;
    email: string;
    type: string;
  };
  fieldOfStudy?: string;
  specialization?: string;
  duration?: string;
  positionType?: string[];
  deadline?: string;
};

type ApplicationType = {
  ID: number;
  PID: string;
  status: string;
  timeCreated: string;
  availability?: string;
  motivation?: string;
  priorProjects?: string;
  cvLink?: string;
  publicationsLink?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDetails?: string;
  Project?: {
    project_name: string;
    project_id: string;
  };
};

type ProjectListProps = {
  projects: ProjectType[];
  loading: boolean;
  appliedProjectIds: Set<string>;
  applicationsMap: Map<string, ApplicationType>;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
};

export default function ProjectList({
  projects,
  loading,
  appliedProjectIds,
  applicationsMap,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No projects found.
      </div>
    );
  }

  // Filter projects by application status
  const unappliedProjects = projects.filter(
    (project) => !appliedProjectIds.has(project.pid)
  );
  
  const appliedProjects = projects.filter((project) => {
    const application = applicationsMap.get(project.pid);
    return application && application.status === "applied";
  });
  
  const acceptedProjects = projects.filter((project) => {
    const application = applicationsMap.get(project.pid);
    return application && application.status === "accepted";
  });
  
  const rejectedProjects = projects.filter((project) => {
    const application = applicationsMap.get(project.pid);
    return application && application.status === "rejected";
  });
  
  const interviewProjects = projects.filter((project) => {
    const application = applicationsMap.get(project.pid);
    return application && application.status === "interview";
  });

  const renderProjects = (projectList: ProjectType[]) => {
    if (projectList.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No projects found in this category.
        </div>
      );
    }
    
    return projectList.map((project: ProjectType) => {
      const hasApplied = appliedProjectIds.has(project.pid);
      const application = applicationsMap.get(project.pid);

      return (
        <ProjectCard
          key={project.pid}
          project={project}
          hasApplied={hasApplied}
          application={application}
        />
      );
    });
  };

  const Pagination = () => {
    if (!onPageChange || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages} ({totalCount} total projects)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full gap-1 h-auto p-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Projects</TabsTrigger>
          <TabsTrigger value="unapplied" className="text-xs sm:text-sm">Unapplied</TabsTrigger>
          <TabsTrigger value="applied" className="text-xs sm:text-sm">Under Review</TabsTrigger>
          <TabsTrigger value="interview" className="text-xs sm:text-sm">Interview</TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs sm:text-sm">Accepted</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {renderProjects(projects)}
        </TabsContent>
        
        <TabsContent value="unapplied" className="space-y-4 mt-4">
          {renderProjects(unappliedProjects)}
        </TabsContent>
        
        <TabsContent value="applied" className="space-y-4 mt-4">
          {renderProjects(appliedProjects)}
        </TabsContent>
        
        <TabsContent value="interview" className="space-y-4 mt-4">
          {renderProjects(interviewProjects)}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4 mt-4">
          {renderProjects(acceptedProjects)}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4 mt-4">
          {renderProjects(rejectedProjects)}
        </TabsContent>
      </Tabs>
      
      <Pagination />
    </div>
  );
}
