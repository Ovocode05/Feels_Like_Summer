"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import ProfileDisplay from "./profile_display";
// import { submitProfile } from "@/actions/profile-actions";

interface Link {
  type: string;
  url: string;
}

interface Skill {
  category: string;
  items: string;
}

export default function ProfileForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  //   const [state, action, isPending] = useActionState(submitProfile, null);
  const [links, setLinks] = useState<Link[]>([{ type: "", url: "" }]);
  const [skills, setSkills] = useState<Skill[]>([{ category: "", items: "" }]);

  const addLink = () => {
    setLinks([...links, { type: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const addSkill = () => {
    setSkills([...skills, { category: "", items: "" }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;
    setSkills(updatedSkills);
  };

  return (
    <div>
      {!submitted ? (
        <div className="min-h-screen bg-white py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Create Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Basic Information
                    </h3>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        name="department"
                        placeholder="e.g., Computer Science"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="year">Academic Year *</Label>
                      <Select name="year" required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="major">Major *</Label>
                      <Input
                        id="major"
                        name="major"
                        placeholder="e.g., Software Engineering"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="research_interest">
                        Research Interests *
                      </Label>
                      <Textarea
                        id="research_interest"
                        name="research_interest"
                        placeholder="e.g., Machine Learning, Natural Language Processing, Computer Vision"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_available"
                        name="is_available"
                        defaultChecked
                      />
                      <Label htmlFor="is_available">
                        Available for research opportunities
                      </Label>
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Links & Contact
                      </h3>
                      <Button
                        type="button"
                        onClick={addLink}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Link
                      </Button>
                    </div>

                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Link Type</Label>
                          <Select
                            value={link.type}
                            onValueChange={(value) =>
                              updateLink(index, "type", value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                              <SelectItem value="GitHub">GitHub</SelectItem>
                              <SelectItem value="Portfolio">
                                Portfolio
                              </SelectItem>
                              <SelectItem value="Email">Email</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="hidden"
                            name={`link_type_${index}`}
                            value={link.type}
                          />
                        </div>
                        <div className="flex-2">
                          <Label>URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) =>
                              updateLink(index, "url", e.target.value)
                            }
                            placeholder="https://..."
                            className="mt-1"
                          />
                          <input
                            type="hidden"
                            name={`link_url_${index}`}
                            value={link.url}
                          />
                        </div>
                        {links.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeLink(index)}
                            size="sm"
                            variant="outline"
                            className="mb-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        Skills & Expertise
                      </h3>
                      <Button
                        type="button"
                        onClick={addSkill}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Category
                      </Button>
                    </div>

                    {skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label>Category</Label>
                            <Input
                              value={skill.category}
                              onChange={(e) =>
                                updateSkill(index, "category", e.target.value)
                              }
                              placeholder="e.g., Programming Languages"
                              className="mt-1"
                            />
                            <input
                              type="hidden"
                              name={`skill_category_${index}`}
                              value={skill.category}
                            />
                          </div>
                          {skills.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeSkill(index)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <Label>Skills (comma-separated)</Label>
                          <Textarea
                            value={skill.items}
                            onChange={(e) =>
                              updateSkill(index, "items", e.target.value)
                            }
                            placeholder="e.g., Python, JavaScript, Java, C++"
                            className="mt-1"
                          />
                          <input
                            type="hidden"
                            name={`skill_items_${index}`}
                            value={skill.items}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Error Display */}
                  {/* {state?.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{state.error}</p>
                    </div>
                  )} */}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    {isPending ? "Creating Profile..." : "Create Profile"}
                    Create Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <ProfileDisplay />
      )}
    </div>
  );
}
