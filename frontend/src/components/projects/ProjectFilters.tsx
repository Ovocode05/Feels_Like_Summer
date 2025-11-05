import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

type ProjectFiltersProps = {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  selectedField: string;
  setSelectedField: (field: string) => void;
  selectedSpecialization: string;
  setSelectedSpecialization: (spec: string) => void;
  durationSlider: number[];
  setDurationSlider: (duration: number[]) => void;
  selectedPositionTypes: string[];
  setSelectedPositionTypes: (types: string[]) => void;
  upcomingDeadlineOnly: boolean;
  setUpcomingDeadlineOnly: (value: boolean) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
};

const specializationsByField: Record<string, { value: string; label: string }[]> = {
  "": [
    { value: "all", label: "All Specializations" },
  ],
  physics: [
    { value: "all", label: "All Specializations" },
    { value: "quantum-mechanics", label: "Quantum Mechanics" },
    { value: "quantum-computing", label: "Quantum Computing" },
    { value: "astrophysics", label: "Astrophysics" },
    { value: "condensed-matter", label: "Condensed Matter Physics" },
    { value: "particle-physics", label: "Particle Physics" },
    { value: "optics", label: "Optics and Photonics" },
  ],
  chemistry: [
    { value: "all", label: "All Specializations" },
    { value: "organic-chemistry", label: "Organic Chemistry" },
    { value: "inorganic-chemistry", label: "Inorganic Chemistry" },
    { value: "physical-chemistry", label: "Physical Chemistry" },
    { value: "analytical-chemistry", label: "Analytical Chemistry" },
    { value: "biochemistry", label: "Biochemistry" },
  ],
  biology: [
    { value: "all", label: "All Specializations" },
    { value: "molecular-biology", label: "Molecular Biology" },
    { value: "genetics", label: "Genetics" },
    { value: "microbiology", label: "Microbiology" },
    { value: "ecology", label: "Ecology" },
    { value: "neuroscience", label: "Neuroscience" },
    { value: "bioinformatics", label: "Bioinformatics" },
  ],
  "computer-science": [
    { value: "all", label: "All Specializations" },
    { value: "machine-learning", label: "Machine Learning" },
    { value: "artificial-intelligence", label: "Artificial Intelligence" },
    { value: "computer-vision", label: "Computer Vision" },
    { value: "natural-language-processing", label: "Natural Language Processing" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "distributed-systems", label: "Distributed Systems" },
    { value: "human-computer-interaction", label: "Human-Computer Interaction" },
  ],
  "pure-mathematics": [
    { value: "all", label: "All Specializations" },
    { value: "algebra", label: "Algebra" },
    { value: "topology", label: "Topology" },
    { value: "number-theory", label: "Number Theory" },
    { value: "geometry", label: "Geometry" },
    { value: "analysis", label: "Analysis" },
  ],
  "applied-mathematics": [
    { value: "all", label: "All Specializations" },
    { value: "numerical-analysis", label: "Numerical Analysis" },
    { value: "mathematical-modeling", label: "Mathematical Modeling" },
    { value: "optimization", label: "Optimization" },
    { value: "dynamical-systems", label: "Dynamical Systems" },
  ],
  statistics: [
    { value: "all", label: "All Specializations" },
    { value: "statistical-learning", label: "Statistical Learning" },
    { value: "bayesian-statistics", label: "Bayesian Statistics" },
    { value: "data-science", label: "Data Science" },
    { value: "biostatistics", label: "Biostatistics" },
  ],
  engineering: [
    { value: "all", label: "All Specializations" },
    { value: "electrical-engineering", label: "Electrical Engineering" },
    { value: "mechanical-engineering", label: "Mechanical Engineering" },
    { value: "civil-engineering", label: "Civil Engineering" },
    { value: "chemical-engineering", label: "Chemical Engineering" },
    { value: "biomedical-engineering", label: "Biomedical Engineering" },
  ],
  "social-sciences": [
    { value: "all", label: "All Specializations" },
    { value: "psychology", label: "Psychology" },
    { value: "sociology", label: "Sociology" },
    { value: "economics", label: "Economics" },
    { value: "political-science", label: "Political Science" },
    { value: "anthropology", label: "Anthropology" },
  ],
  humanities: [
    { value: "all", label: "All Specializations" },
    { value: "history", label: "History" },
    { value: "philosophy", label: "Philosophy" },
    { value: "literature", label: "Literature" },
    { value: "linguistics", label: "Linguistics" },
  ],
  "environmental-science": [
    { value: "all", label: "All Specializations" },
    { value: "climate-science", label: "Climate Science" },
    { value: "conservation", label: "Conservation" },
    { value: "sustainability", label: "Sustainability" },
  ],
  "materials-science": [
    { value: "all", label: "All Specializations" },
    { value: "nanomaterials", label: "Nanomaterials" },
    { value: "polymers", label: "Polymers" },
    { value: "biomaterials", label: "Biomaterials" },
  ],
  "earth-sciences": [
    { value: "all", label: "All Specializations" },
    { value: "geology", label: "Geology" },
    { value: "geophysics", label: "Geophysics" },
    { value: "oceanography", label: "Oceanography" },
  ],
};

export default function ProjectFilters({
  isFilterOpen,
  setIsFilterOpen,
  selectedField,
  setSelectedField,
  selectedSpecialization,
  setSelectedSpecialization,
  durationSlider,
  setDurationSlider,
  selectedPositionTypes,
  setSelectedPositionTypes,
  upcomingDeadlineOnly,
  setUpcomingDeadlineOnly,
  onApplyFilters,
  onResetFilters,
}: ProjectFiltersProps) {
  return (
    <Collapsible
      open={isFilterOpen}
      onOpenChange={setIsFilterOpen}
      className="md:col-span-1 space-y-4 rounded-lg border p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <CollapsibleTrigger asChild className="md:hidden">
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent
        className="space-y-4"
        forceMount={true}
        hidden={
          !isFilterOpen &&
          typeof window !== "undefined" &&
          window.innerWidth < 768
        }
      >
        <div className="space-y-2">
          <Label htmlFor="field">Field of Study</Label>
          <Select value={selectedField} onValueChange={(value) => {
            setSelectedField(value);
            setSelectedSpecialization("all");
          }}>
            <SelectTrigger id="field">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sciences</SelectLabel>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="computer-science">
                  Computer Science
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Mathematics</SelectLabel>
                <SelectItem value="pure-mathematics">
                  Pure Mathematics
                </SelectItem>
                <SelectItem value="applied-mathematics">
                  Applied Mathematics
                </SelectItem>
                <SelectItem value="statistics">Statistics</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Other</SelectLabel>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="social-sciences">
                  Social Sciences
                </SelectItem>
                <SelectItem value="humanities">Humanities</SelectItem>
                <SelectItem value="environmental-science">
                  Environmental Science
                </SelectItem>
                <SelectItem value="materials-science">
                  Materials Science
                </SelectItem>
                <SelectItem value="earth-sciences">
                  Earth Sciences
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            key={selectedField}
            value={selectedSpecialization}
            onValueChange={setSelectedSpecialization}
          >
            <SelectTrigger id="specialization">
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {(specializationsByField[selectedField] || specializationsByField[""]).map((spec) => (
                <SelectItem key={spec.value} value={spec.value}>
                  {spec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <div className="space-y-3">
            <Slider
              id="duration"
              value={durationSlider}
              onValueChange={setDurationSlider}
              max={3}
              step={1}
              className="w-full"
            />
            <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground">
              <div className={`text-center ${durationSlider[0] === 0 ? "font-semibold text-primary" : ""}`}>
                <div>Any</div>
                <div className="text-[10px]">&nbsp;</div>
              </div>
              <div className={`text-center ${durationSlider[0] === 1 ? "font-semibold text-primary" : ""}`}>
                <div>Short</div>
                <div className="text-[10px]">(1-3 mo)</div>
              </div>
              <div className={`text-center ${durationSlider[0] === 2 ? "font-semibold text-primary" : ""}`}>
                <div>Medium</div>
                <div className="text-[10px]">(3-6 mo)</div>
              </div>
              <div className={`text-center ${durationSlider[0] === 3 ? "font-semibold text-primary" : ""}`}>
                <div>Long</div>
                <div className="text-[10px]">(6+ mo)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Position Type</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paid"
                checked={selectedPositionTypes.includes("paid")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositionTypes([
                      ...selectedPositionTypes,
                      "paid",
                    ]);
                  } else {
                    setSelectedPositionTypes(
                      selectedPositionTypes.filter((t) => t !== "paid")
                    );
                  }
                }}
              />
              <label
                htmlFor="paid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Paid
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="volunteer"
                checked={selectedPositionTypes.includes("volunteer")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositionTypes([
                      ...selectedPositionTypes,
                      "volunteer",
                    ]);
                  } else {
                    setSelectedPositionTypes(
                      selectedPositionTypes.filter(
                        (t) => t !== "volunteer"
                      )
                    );
                  }
                }}
              />
              <label
                htmlFor="volunteer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-dowed peer-disabled:opacity-70"
              >
                Volunteer
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="credit"
                checked={selectedPositionTypes.includes("credit")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositionTypes([
                      ...selectedPositionTypes,
                      "credit",
                    ]);
                  } else {
                    setSelectedPositionTypes(
                      selectedPositionTypes.filter((t) => t !== "credit")
                    );
                  }
                }}
              />
              <label
                htmlFor="credit"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                For Credit
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="thesis"
                checked={selectedPositionTypes.includes("thesis")}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositionTypes([
                      ...selectedPositionTypes,
                      "thesis",
                    ]);
                  } else {
                    setSelectedPositionTypes(
                      selectedPositionTypes.filter((t) => t !== "thesis")
                    );
                  }
                }}
              />
              <label
                htmlFor="thesis"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Thesis/Dissertation
              </label>
            </div>
          </div>
        </div>
{/* 
        <div className="space-y-2">
          <Label>Skill Match</Label>
          <div className="flex items-center space-x-2">
            <Switch id="skill-match" />
            <Label htmlFor="skill-match" className="text-sm">
              Show only projects matching my skills
            </Label>
          </div>
        </div> */}

        <div className="space-y-2">
          <Label>Deadline</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="upcoming"
              checked={upcomingDeadlineOnly}
              onCheckedChange={(checked) =>
                setUpcomingDeadlineOnly(!!checked)
              }
            />
            <label
              htmlFor="upcoming"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Upcoming deadlines (next 30 days)
            </label>
          </div>
        </div>

        <Button className="w-full" onClick={onApplyFilters}>
          Apply Filters
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onResetFilters}
        >
          Reset
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
