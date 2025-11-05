import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type ProjectSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export default function ProjectSearch({
  searchQuery,
  onSearchChange,
}: ProjectSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects, professors, keywords..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
