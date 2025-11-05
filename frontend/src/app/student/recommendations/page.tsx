"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { getRecommendedProjects, RecommendedProject, getStudentProfile, StudentProfile } from "@/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MenubarStudent from "@/components/ui/menubar_student";
import {
  Star,
  Clock,
  BookOpen,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  type: string;
  iat: number;
  exp: number;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [decode, setDecode] = useState<DecodedToken | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token") || "";
    if (!token) return;
    try {
      setDecode(jwtDecode(token) as DecodedToken);
    } catch (e) {
      console.error("Invalid token decode", e);
      setDecode(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
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

    const fetchData = async () => {
      try {
        // Fetch profile and recommendations in parallel
        const [profileResponse, recommendationsResponse] = await Promise.all([
          getStudentProfile(token).catch(() => ({ student: null })),
          getRecommendedProjects(token).catch(() => ({ recommendations: [] })),
        ]);
        
        setStudentProfile(profileResponse.student || null);
        setRecommendations(recommendationsResponse.recommendations || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Potential Match";
  };

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Recommended Projects
            </h1>
            <p className="text-muted-foreground mt-2">
              Personalized project recommendations based on your profile,
              skills, and research interests.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Finding the best projects for you...
              </p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              {!studentProfile || 
               (!studentProfile.researchInterest && 
                (!studentProfile.skills || studentProfile.skills.length === 0)) ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    No Recommendations Yet
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Complete your profile with your skills, research interests, and
                    preferences to get personalized project recommendations.
                  </p>
                  <Link href="/student/profile">
                    <Button>Complete Your Profile</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">
                    No Matching Projects Found
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-2">
                    We couldn&apos;t find any projects that match your profile at the moment.
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                    Try exploring all available projects or update your profile with different skills and interests.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/student/projects">
                      <Button>Browse All Projects</Button>
                    </Link>
                    <Link href="/student/profile">
                      <Button variant="outline">Update Profile</Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {recommendations.length} project
                {recommendations.length !== 1 ? "s" : ""} matching your profile
              </p>
            </div>

            <div className="grid gap-6">
              {recommendations.map((project) => (
                <Card
                  key={project.ID}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4" />
                          {project.user.name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold ${getMatchColor(
                            project.match_score
                          )}`}
                        >
                          {Math.round(project.match_score)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getMatchLabel(project.match_score)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.sdesc}
                    </p>

                    {/* Match Reasons */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Star className="h-4 w-4 text-primary" />
                        Why this matches you:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.match_reasons.map((reason, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      {project.fieldOfStudy && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Field
                            </p>
                            <p className="text-sm font-medium truncate">
                              {project.fieldOfStudy}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.duration && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Duration
                            </p>
                            <p className="text-sm font-medium truncate">
                              {project.duration}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.specialization && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Specialization
                            </p>
                            <p className="text-sm font-medium truncate">
                              {project.specialization}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Deadline
                            </p>
                            <p className="text-sm font-medium truncate">
                              {new Date(project.deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tags.slice(0, 5).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/project/${project.pid}`} className="flex-1">
                        <Button className="w-full">View Details</Button>
                      </Link>
                      <Link href={`/project/${project.pid}`}>
                        <Button variant="outline">Apply Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
