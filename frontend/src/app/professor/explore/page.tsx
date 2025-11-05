"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Search,
  User,
  GraduationCap,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";
import { exploreUsers, type ExploreUserData } from "@/api/api";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/ui/manual_navbar_prof";

export default function ProfessorExplorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<ExploreUserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExploreUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token) as { type: string };
      if (decoded.type !== "fac") {
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/login");
      return;
    }

    fetchUsers();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await exploreUsers(token);
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by type based on active tab
    if (activeTab === "students") {
      filtered = filtered.filter((user) => user.type === "stu");
    } else if (activeTab === "professors") {
      filtered = filtered.filter((user) => user.type === "fac");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.institution?.toLowerCase().includes(query) ||
          user.degree?.toLowerCase().includes(query) ||
          user.researchInterest?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUserClick = (uid: string) => {
    router.push(`/profile/${uid}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  const studentCount = users.filter((u) => u.type === "stu").length;
  const professorCount = users.filter((u) => u.type === "fac").length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Users</h1>
          <p className="text-muted-foreground">
            Discover and connect with students and professors
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, institution, or research interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All ({users.length})
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Students ({studentCount})
            </TabsTrigger>
            <TabsTrigger value="professors" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professors ({professorCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">No users found</p>
                  <p className="text-muted-foreground text-center">
                    {searchQuery
                      ? "Try adjusting your search filters"
                      : "No users available to display"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.uid}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleUserClick(user.uid)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.type === "stu" ? (
                              <GraduationCap className="h-6 w-6 text-primary" />
                            ) : (
                              <Briefcase className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {user.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {user.email}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            user.type === "stu" ? "default" : "secondary"
                          }
                        >
                          {user.type === "stu" ? "Student" : "Professor"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user.institution && (
                        <div className="flex items-start gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.institution}
                            </p>
                            {user.degree && (
                              <p className="text-xs text-muted-foreground truncate">
                                {user.degree}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">
                            {user.location}
                          </p>
                        </div>
                      )}

                      {user.researchInterest && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold mb-1">
                            Research Interest:
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {user.researchInterest}
                          </p>
                        </div>
                      )}

                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {user.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.uid);
                        }}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
