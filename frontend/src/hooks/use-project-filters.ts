import { ProjectType } from "@/types/project";

export const useProjectFilters = (projects: ProjectType[]) => {
  const applyFilters = (
    searchQuery: string,
    selectedField: string,
    selectedSpecialization: string,
    durationSlider: number[],
    selectedPositionTypes: string[],
    upcomingDeadlineOnly: boolean
  ): ProjectType[] => {
    let filtered = [...projects];

    // Apply search query
    if (searchQuery) {
      let pattern: RegExp | null = null;
      try {
        pattern = new RegExp(searchQuery, "i");
      } catch {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        pattern = new RegExp(escaped, "i");
      }

      filtered = filtered.filter((p) => {
        const haystack = [
          p.name || "",
          p.sdesc || "",
          p.ldesc || "",
          p.user?.name || "",
          (p.tags || []).join(" "),
        ].join(" ");
        if (pattern!.test(haystack)) return true;
        return (p.tags || []).some((t) => pattern!.test(t));
      });
    }

    // Apply field of study filter
    if (selectedField) {
      filtered = filtered.filter(
        (p) => p.fieldOfStudy?.toLowerCase() === selectedField.toLowerCase()
      );
    }

    // Apply specialization filter
    if (selectedSpecialization && selectedSpecialization !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.specialization?.toLowerCase() ===
          selectedSpecialization.toLowerCase()
      );
    }

    // Apply duration filter (0=any, 1=short-term, 2=medium-term, 3=long-term)
    if (durationSlider[0] !== 0) {
      filtered = filtered.filter((p) => {
        if (!p.duration) return false;
        const duration = p.duration.toLowerCase();
        
        if (durationSlider[0] === 1) {
          return duration.includes("short-term");
        } else if (durationSlider[0] === 2) {
          return duration.includes("medium-term");
        } else if (durationSlider[0] === 3) {
          return duration.includes("long-term");
        }
        return false;
      });
    }

    // Apply position type filter
    if (selectedPositionTypes.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.positionType || p.positionType.length === 0) return false;
        return selectedPositionTypes.some((selectedType) =>
          p.positionType!.some((pType) =>
            pType.toLowerCase().includes(selectedType.toLowerCase())
          )
        );
      });
    }

    // Apply upcoming deadline filter
    if (upcomingDeadlineOnly) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      filtered = filtered.filter((p) => {
        if (!p.deadline) return false;
        const deadlineDate = new Date(p.deadline);
        return deadlineDate >= new Date() && deadlineDate <= thirtyDaysFromNow;
      });
    }

    return filtered;
  };

  return { applyFilters };
};
