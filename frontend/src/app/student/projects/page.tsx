"use client";

import { useEffect, useState } from "react";
import MenubarStudent from "@/components/ui/menubar_student";
import ProjectFilters from "@/components/projects/ProjectFilters";
import ProjectSearch from "@/components/projects/ProjectSearch";
import ProjectList from "@/components/projects/ProjectList";
import { fetchProjectsForStudent, getMyAppliedProjects } from "@/api/api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useProjectFilters } from "@/hooks/use-project-filters";
import { ProjectType, ApplicationType } from "@/types/project";

type AppliedProjectInfo = {
  pid: string;
  status: string;
};

// Adapter to convert lightweight AppliedProjectInfo to ApplicationType for compatibility
const toApplicationType = (info: AppliedProjectInfo): ApplicationType => {
  return {
    ID: 0, // Not needed for display
    PID: info.pid,
    status: info.status,
    timeCreated: "", // Will be fetched when viewing details
  };
};

export default function ExplorePage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<string>>(new Set());
  const [applicationsMap, setApplicationsMap] = useState<Map<string, ApplicationType>>(new Map());
  const [isAuth, setIsAuth] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  const [durationSlider, setDurationSlider] = useState<number[]>([0]);
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<string[]>([]);
  const [upcomingDeadlineOnly, setUpcomingDeadlineOnly] = useState(false);

  const { applyFilters: filterProjects } = useProjectFilters(projects);

  useEffect(() => {
    async function fetchAllProjects() {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      try {
        // Use the new student-specific endpoint with pagination
        const res = await fetchProjectsForStudent(token, currentPage, pageSize);
        if (res.projects && Array.isArray(res.projects)) {
          setProjects(res.projects);
          setFilteredProjects(res.projects);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.total || 0);
        } else {
          setProjects([]);
          setFilteredProjects([]);
        }

        // Use the new optimized endpoint to get applied projects
        try {
          const applicationsRes = await getMyAppliedProjects(token);
          if (applicationsRes.appliedProjects && Array.isArray(applicationsRes.appliedProjects)) {
            const appliedIds = new Set<string>(
              applicationsRes.appliedProjects.map((app: AppliedProjectInfo) => app.pid)
            );
            setAppliedProjectIds(appliedIds);
            
            // Convert to ApplicationType for compatibility with ProjectCard
            const appMap = new Map<string, ApplicationType>();
            applicationsRes.appliedProjects.forEach((app: AppliedProjectInfo) => {
              appMap.set(app.pid, toApplicationType(app));
            });
            setApplicationsMap(appMap);
          }
        } catch (appError) {
          console.error("Error fetching applied projects:", appError);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setFilteredProjects([]);
      }
      setLoading(false);
    }

    fetchAllProjects();
  }, [currentPage, pageSize]);

  const applyFilters = () => {
    const filtered = filterProjects(
      searchQuery,
      selectedField,
      selectedSpecialization,
      durationSlider,
      selectedPositionTypes,
      upcomingDeadlineOnly
    );
    setFilteredProjects(filtered);
  };

  const resetFilters = () => {
    setSelectedField("");
    setSelectedSpecialization("all");
    setDurationSlider([0]);
    setSelectedPositionTypes([]);
    setUpcomingDeadlineOnly(false);
    setSearchQuery("");
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, projects, selectedField, selectedSpecialization, durationSlider, selectedPositionTypes, upcomingDeadlineOnly]);

  useEffect(() => {
    const token = localStorage.getItem("token");
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
  }, [router]);

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MenubarStudent />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
            <p className="text-muted-foreground">
              Find research opportunities that match your interests and qualifications.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <ProjectFilters
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            selectedSpecialization={selectedSpecialization}
            setSelectedSpecialization={setSelectedSpecialization}
            durationSlider={durationSlider}
            setDurationSlider={setDurationSlider}
            selectedPositionTypes={selectedPositionTypes}
            setSelectedPositionTypes={setSelectedPositionTypes}
            upcomingDeadlineOnly={upcomingDeadlineOnly}
            setUpcomingDeadlineOnly={setUpcomingDeadlineOnly}
            onApplyFilters={applyFilters}
            onResetFilters={resetFilters}
          />

          <div className="md:col-span-3 space-y-4">
            <ProjectSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <ProjectList
              projects={filteredProjects}
              loading={loading}
              appliedProjectIds={appliedProjectIds}
              applicationsMap={applicationsMap}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
