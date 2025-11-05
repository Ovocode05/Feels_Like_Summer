"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookmarkCheckIcon as BookMarkCheck,
  BookOpen,
  BookText,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  History,
  Rocket,
  Search,
  Star,
} from "lucide-react";
import MenubarStudent from "@/components/ui/menubar_student";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyApplications,
  getRecommendedProjects,
  RecommendedProject,
  getStudentProfile,
  StudentProfile,
  getPreferences,
  ResearchPreferences,
} from "@/api/api";

interface Application {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  time_created: string;
  status: string;
  uid: string;
  pid: string;
  availability?: string;
  motivation?: string;
  prior_projects?: string;
  cv_link?: string;
  publications_link?: string;
  Project: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    project_name: string;
    project_id: string;
    short_desc: string;
    long_desc: string;
    tags: string[];
    creator_id: string;
    is_active: boolean;
    working_users: string[];
    field_of_study?: string;
    specialization?: string;
    duration?: string;
    position_type?: string[];
    deadline?: string;
  };
  User: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    uid: string;
    name: string;
    email: string;
    type: string;
  };
}

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  type: string;
  iat: number;
  exp: number;
  sub: string;
  nbf?: number;
  iss?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>(
    []
  );
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [preferences, setPreferences] = useState<ResearchPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  // moved decode to client-only state to avoid server-side localStorage access
  const [decode, setDecode] = useState<DecodedToken | null>(null);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (
    profile: StudentProfile | null
  ): number => {
    if (!profile) return 0;
    let completion = 0;
    if (profile.institution) completion += 15;
    if (profile.degree) completion += 15;
    if (profile.skills && profile.skills.length > 0) completion += 20;
    if (profile.researchInterest) completion += 20;
    if (profile.resumeLink) completion += 15;
    if (profile.workEx) completion += 15;
    return completion;
  };

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

    // Fetch applications
    const fetchApplications = async () => {
      try {
        const response = await getMyApplications(token);
        setApplications(response.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        const response = await getRecommendedProjects(token);
        setRecommendations(response.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    // Fetch student profile
    const fetchProfile = async () => {
      try {
        const profileResponse = await getStudentProfile(token);
        setStudentProfile(profileResponse.student || null);

        // Fetch research preferences
        try {
          const preferencesResponse = await getPreferences(token);
          setPreferences(preferencesResponse.preference || null);
        } catch {
          console.log("No research preferences found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchApplications();
    fetchRecommendations();
    fetchProfile();
  }, [router]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "accepted":
        return "default";
      case "interview":
        return "default";
      case "under_review":
        return "secondary";
      case "rejected":
        return "destructive";
      case "waitlisted":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "interview":
        return "Interview Scheduled";
      case "waitlisted":
        return "Waitlisted";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuth) {
    // Optionally show a loading spinner here
    return null;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back {decode.name}. Track your research journey here.
            </p>
          </div>
          <Link href="/student/projects">
            <Button className="flex items-center gap-1">
              <Search className="h-4 w-4" /> Find Projects
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                Total applications submitted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Projects
              </CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) =>
                      app.status.toLowerCase() === "accepted" ||
                      app.status.toLowerCase() === "approved"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Active research participation
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Interviews Scheduled
              </CardTitle>
              <BookMarkCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  applications.filter(
                    (app) => app.status.toLowerCase() === "interview"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Pending interviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Track the status of your research applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-4">
                    Loading applications...
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    You haven&apos;t applied to any projects yet.
                  </div>
                ) : (
                  applications.slice(0, 3).map((application) => (
                    <div
                      key={application.ID}
                      className="flex items-center justify-between space-x-4"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {application.User?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {application.Project?.project_name ||
                              "Unknown Project"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.User?.name || "Unknown Professor"}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Submitted {formatDate(application.time_created)}
                            </span>
                            <Badge
                              variant={getStatusVariant(application.status)}
                              className="text-xs"
                            >
                              {getStatusDisplay(application.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/project/${application.pid}`}>
                        <Button variant="ghost" size="sm">
                          View <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              {applications.length > 3 && (
                <Link href="/student/applications" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Applications
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
              <CardDescription>
                Your selected fields and research interests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading profile...
                </div>
              ) : !studentProfile ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Complete your profile to showcase your research interests
                  </p>
                  <Link href="/student/profile">
                    <Button size="sm">Complete Profile</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Primary Field */}
                  {preferences?.field_of_study && (
                    <div>
                      <div className="mb-2 font-medium">Primary Field</div>
                      <div className="flex items-center gap-2">
                        <Badge className="mr-1" variant="secondary">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {preferences.field_of_study}
                        </Badge>
                        {preferences.experience_level && (
                          <Badge variant="outline" className="text-xs">
                            {preferences.experience_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Research Interest */}
                  {studentProfile.researchInterest && (
                    <div>
                      <div className="mb-2 font-medium">Research Interest</div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {studentProfile.researchInterest}
                      </p>
                    </div>
                  )}

                  {/* Career Intention */}
                  {studentProfile.intention && (
                    <div>
                      <div className="mb-2 font-medium">Career Intention</div>
                      <p className="text-sm text-muted-foreground">
                        {studentProfile.intention}
                      </p>
                    </div>
                  )}

                  {/* Interest Areas from Preferences */}
                  {preferences?.interest_areas && (
                    <div>
                      <div className="mb-2 font-medium">Interest Areas</div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {preferences.interest_areas}
                      </p>
                    </div>
                  )}

                  {/* Skills/Specialized Areas */}
                  {studentProfile.skills &&
                    studentProfile.skills.length > 0 && (
                      <div>
                        <div className="mb-2 font-medium">
                          Skills & Expertise
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {studentProfile.skills
                            .slice(0, 8)
                            .map((skill, idx) => (
                              <Badge key={idx} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          {studentProfile.skills.length > 8 && (
                            <Badge variant="outline">
                              +{studentProfile.skills.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Show message if no key data is present */}
                  {!preferences?.field_of_study &&
                    !studentProfile.researchInterest &&
                    (!studentProfile.skills ||
                      studentProfile.skills.length === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Add your research interests and skills to get better
                          project recommendations
                        </p>
                      </div>
                    )}

                  {/* Profile Completion */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Profile Completion</div>
                      <span
                        className={`text-sm font-medium ${
                          calculateProfileCompletion(studentProfile) === 100
                            ? "text-green-600 dark:text-green-400"
                            : calculateProfileCompletion(studentProfile) >= 70
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {calculateProfileCompletion(studentProfile)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          calculateProfileCompletion(studentProfile) === 100
                            ? "bg-green-600"
                            : calculateProfileCompletion(studentProfile) >= 70
                            ? "bg-blue-600"
                            : "bg-yellow-600"
                        }`}
                        style={{
                          width: `${calculateProfileCompletion(
                            studentProfile
                          )}%`,
                        }}
                      ></div>
                    </div>
                    {calculateProfileCompletion(studentProfile) < 100 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Complete your profile to improve recommendations
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/student/profile" className="w-full">
                <Button variant="outline" className="w-full">
                  Update Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Projects</CardTitle>
              <CardDescription>
                Based on your interests and qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRecommendations ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading recommendations...
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Complete your profile to get personalized recommendations.
                </div>
              ) : (
                recommendations.slice(0, 3).map((project) => (
                  <div
                    key={project.ID}
                    className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {project.match_reasons.slice(0, 2).join(" • ")}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        <Star className="mr-1 h-3 w-3 fill-primary text-primary" />{" "}
                        {Math.round(project.match_score)}% match
                      </Badge>
                      <Link href={`/project/${project.pid}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Link href="/student/recommendations" className="w-full">
                <Button variant="outline" className="w-full">
                  View All Recommendations
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Roadmaps to help you in your research journey.
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <Link href="/student/resources">
                <Button variant="outline" className="w-full">
                  View All Resources
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
