"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MapPin, GraduationCap, Briefcase, BookOpen, ExternalLink, User, ArrowLeft } from "lucide-react";
import { getUserProfileByUID, type UserProfileData } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from "jwt-decode";
import MenubarStudent from "@/components/ui/menubar_student";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token) as { uid: string; type: string };
      const uid = params.uid as string;
      
      // Check if viewing own profile
      if (decoded.uid === uid) {
        setIsOwnProfile(true);
      }

      fetchProfile(uid, token);
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/login");
    }
  }, [params.uid, router]);

  const fetchProfile = async (uid: string, token: string) => {
    setLoading(true);
    try {
      const data = await getUserProfileByUID(uid, token);
      setProfile(data);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MenubarStudent />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <MenubarStudent />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Profile Not Found</CardTitle>
              <CardDescription>
                The requested profile could not be found.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isStudent = profile.type === "stu" && profile.student;

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {isOwnProfile && (
            <Button
              onClick={() => router.push("/student/profile")}
              variant="outline"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-3xl">{profile.name}</CardTitle>
                  <Badge variant={profile.type === "stu" ? "default" : "secondary"}>
                    {profile.type === "stu" ? "Student" : "Professor"}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  {isStudent && profile.student.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.student.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isStudent && (
          <>
            {/* Education */}
            {(profile.student.institution || profile.student.degree) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.student.institution && (
                    <div>
                      <span className="font-semibold">Institution: </span>
                      <span>{profile.student.institution}</span>
                    </div>
                  )}
                  {profile.student.degree && (
                    <div>
                      <span className="font-semibold">Degree: </span>
                      <span>{profile.student.degree}</span>
                    </div>
                  )}
                  {profile.student.dates && (
                    <div>
                      <span className="font-semibold">Duration: </span>
                      <span>{profile.student.dates}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Research Interest */}
            {profile.student.researchInterest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Research Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {profile.student.researchInterest}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {profile.student.experience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{profile.student.experience}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {profile.student.skills && profile.student.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.student.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {profile.student.projects && profile.student.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.student.projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {profile.student.activities && profile.student.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {profile.student.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {(profile.student.resumeLink || profile.student.publicationsLink) && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.student.resumeLink && (
                    <div>
                      <a
                        href={profile.student.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resume/CV
                      </a>
                    </div>
                  )}
                  {profile.student.publicationsLink && (
                    <div>
                      <a
                        href={profile.student.publicationsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Publications
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!isStudent && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a faculty member profile. Additional information may be
                displayed here in the future.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
