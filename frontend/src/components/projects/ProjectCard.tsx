import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

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

type ProjectCardProps = {
  project: ProjectType;
  hasApplied: boolean;
  application?: ApplicationType;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "accepted":
    case "approved":
      return { variant: "default" as const, text: "Accepted", color: "bg-green-600 hover:bg-green-700" };
    case "rejected":
      return { variant: "destructive" as const, text: "Rejected", color: "" };
    case "waitlisted":
      return { variant: "secondary" as const, text: "Waitlisted", color: "bg-yellow-600 hover:bg-yellow-700" };
    case "interview":
      return { variant: "default" as const, text: "Interview", color: "bg-blue-600 hover:bg-blue-700" };
    case "under_review":
      return { variant: "outline" as const, text: "Under Review", color: "" };
    case "applied":
      return { variant: "outline" as const, text: "Under Review", color: "" };
    default:
      return { variant: "outline" as const, text: status, color: "" };
  }
};

export default function ProjectCard({ project, hasApplied, application }: ProjectCardProps) {
  // Full detailed view
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle>{project.name}</CardTitle>
              {/* {hasApplied && application && (
                <Badge 
                  variant={getStatusInfo(application.status).variant}
                  className={getStatusInfo(application.status).color}
                >
                  {getStatusInfo(application.status).text}
                </Badge>
              )} */}
            </div>
            <CardDescription className="mt-1">
              {project.user?.name || "Unknown Professor"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-4">
          {project.sdesc}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Status:
            </div>
            <Badge
              variant={
                project.isActive ? "secondary" : "outline"
              }
            >
              {project.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Tags:
            </div>
            <div className="flex flex-wrap gap-1">
              {(project.tags || []).map(
                (tag: string, idx: number) => (
                  <Badge
                    key={tag + idx}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-1">
            Project Description
          </div>
          <div className="text-sm text-muted-foreground">
            {project.ldesc}
          </div>
        </div>
        {hasApplied && application && (
          <div className="mt-4 pt-4 border-t">
            <div className="font-semibold mb-2 flex items-center gap-2">
              Your Application Status
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <Badge 
                    variant={getStatusInfo(application.status).variant}
                    className={getStatusInfo(application.status).color}
                  >
                    {getStatusInfo(application.status).text}
                  </Badge>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Applied on:</span>
                  <span className="text-foreground">
                    {new Date(application.timeCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div> */}
              </div>
              
              {application.status === "interview" && (application.interviewDate || application.interviewTime) && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🎯 Interview Scheduled
                  </div>
                  {application.interviewDate && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Date:</span>
                      <span>{application.interviewDate}</span>
                    </div>
                  )}
                  {application.interviewTime && (
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <span className="font-medium">Time:</span>
                      <span>{application.interviewTime}</span>
                    </div>
                  )}
                  {application.interviewDetails && (
                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="font-medium text-blue-800 dark:text-blue-200">Details:</span>
                      <p className="text-blue-700 dark:text-blue-300 mt-1 whitespace-pre-wrap">
                        {application.interviewDetails}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {application.status === "accepted" && (
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <div>
                    Your application has been accepted. The professor will contact you with next steps.
                  </div>
                </div>
              )}
              
              {application.status === "waitlisted" && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-yellow-900 dark:text-yellow-100">
                    ⏳ Your application is currently waitlisted. You&apos;ll be notified if a position becomes available.
                  </div>
                </div>
              )}
              
              {application.status === "under_review" && (
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <div>
                    Your application is under review. The professor will respond soon.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {(project.fieldOfStudy ||
          project.specialization ||
          project.duration ||
          (project.positionType &&
            project.positionType.length > 0) ||
          project.deadline) && (
          <div className="mt-4 pt-4 border-t">
            <div className="font-semibold mb-2">
              Project Details
            </div>
            <div className="grid gap-2 text-sm">
              {project.fieldOfStudy && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Field:
                  </span>
                  <Badge variant="secondary">
                    {project.fieldOfStudy}
                  </Badge>
                </div>
              )}
              {project.specialization && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Specialization:
                  </span>
                  <Badge variant="secondary">
                    {project.specialization}
                  </Badge>
                </div>
              )}
              {project.duration && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Duration:
                  </span>
                  <Badge variant="secondary">
                    {project.duration}
                  </Badge>
                </div>
              )}
              {project.positionType &&
                project.positionType.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">
                      Position Type:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.positionType.map(
                        (type: string, idx: number) => (
                          <Badge
                            key={type + idx}
                            variant="outline"
                          >
                            {type}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              {project.deadline && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Deadline:
                  </span>
                  <Badge variant="destructive">
                    {new Date(
                      project.deadline
                    ).toLocaleDateString()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <div className="bg-muted/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-background flex items-center gap-1"
          >
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>
              {project.isActive ? "Active" : "Inactive"}
            </span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/project/${project.pid}`}>
            <Button size="sm">
              {hasApplied ? "View Application" : "View Details"}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
