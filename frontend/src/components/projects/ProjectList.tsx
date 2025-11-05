import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
};

export default function ProjectList({
  projects,
  loading,
  appliedProjectIds,
  applicationsMap,
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

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Projects</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="space-y-4 mt-4">
        {projects.map((project: ProjectType) => {
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
        })}
      </TabsContent>
    </Tabs>
  );
}
