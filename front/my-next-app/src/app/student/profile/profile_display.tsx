"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Globe,
  Edit,
} from "lucide-react";

const getLinkIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "github":
      return <Github className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const getYearSuffix = (year: number) => {
  switch (year) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    case 4:
      return "4th";
    default:
      return `${year}th`;
  }
};

export default function ProfileDisplay() {
  return "hello";
  //   return (
  //     <div className="min-h-screen bg-white">
  //       <div className="container mx-auto px-4 py-8 max-w-4xl">
  //         {/* Header Section */}
  //         <div className="mb-8">
  //           <div className="flex items-center justify-between mb-4">
  //             <div className="flex items-center gap-3">
  //               <div className="p-3 rounded-full bg-black">
  //                 <User className="h-8 w-8 text-white" />
  //               </div>
  //               <div>
  //                 <h1 className="text-3xl font-bold text-black">Your Profile</h1>
  //                 <p className="text-gray-600">Profile created successfully!</p>
  //               </div>
  //             </div>
  //             <Button
  //               onClick={onEdit}
  //               variant="outline"
  //               className="gap-2 bg-transparent"
  //             >
  //               <Edit className="h-4 w-4" />
  //               Edit Profile
  //             </Button>
  //           </div>
  //           {/* Availability Status */}
  //           <div className="flex items-center gap-2">
  //             {profile.is_available ? (
  //               <>
  //                 <CheckCircle className="h-5 w-5 text-green-600" />
  //                 <span className="text-green-600 font-medium">
  //                   Available for Research
  //                 </span>
  //               </>
  //             ) : (
  //               <>
  //                 <XCircle className="h-5 w-5 text-red-600" />
  //                 <span className="text-red-600 font-medium">
  //                   Currently Unavailable
  //                 </span>
  //               </>
  //             )}
  //           </div>
  //         </div>
  //         <div className="grid gap-6 md:grid-cols-2">
  //           {/* Academic Information */}
  //           <Card className="border-2 border-gray-200">
  //             <CardHeader>
  //               <CardTitle className="flex items-center gap-2">
  //                 <GraduationCap className="h-5 w-5" />
  //                 Academic Information
  //               </CardTitle>
  //             </CardHeader>
  //             <CardContent className="space-y-4">
  //               <div className="flex items-center gap-3">
  //                 <Building2 className="h-4 w-4 text-gray-500" />
  //                 <div>
  //                   <p className="text-sm text-gray-500">Department</p>
  //                   <p className="font-medium">{profile.department}</p>
  //                 </div>
  //               </div>
  //               <div className="flex items-center gap-3">
  //                 <Calendar className="h-4 w-4 text-gray-500" />
  //                 <div>
  //                   <p className="text-sm text-gray-500">Academic Year</p>
  //                   <p className="font-medium">
  //                     {getYearSuffix(profile.year)} Year
  //                   </p>
  //                 </div>
  //               </div>
  //               <div className="flex items-center gap-3">
  //                 <BookOpen className="h-4 w-4 text-gray-500" />
  //                 <div>
  //                   <p className="text-sm text-gray-500">Major</p>
  //                   <p className="font-medium">{profile.major}</p>
  //                 </div>
  //               </div>
  //             </CardContent>
  //           </Card>
  //           {/* Links */}
  //           <Card className="border-2 border-gray-200">
  //             <CardHeader>
  //               <CardTitle className="flex items-center gap-2">
  //                 <ExternalLink className="h-5 w-5" />
  //                 Links & Contact
  //               </CardTitle>
  //             </CardHeader>
  //             <CardContent>
  //               <div className="space-y-3">
  //                 {profile.links.length > 0 ? (
  //                   profile.links.map((link, index) => (
  //                     <Button
  //                       key={index}
  //                       variant="outline"
  //                       className="w-full justify-start gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
  //                       asChild
  //                     >
  //                       <a
  //                         href={link.url}
  //                         target="_blank"
  //                         rel="noopener noreferrer"
  //                       >
  //                         {getLinkIcon(link.type)}
  //                         {link.type}
  //                       </a>
  //                     </Button>
  //                   ))
  //                 ) : (
  //                   <p className="text-gray-500 text-sm">No links added</p>
  //                 )}
  //               </div>
  //             </CardContent>
  //           </Card>
  //         </div>
  //         {/* Research Interests */}
  //         <Card className="mt-6 border-2 border-gray-200">
  //           <CardHeader>
  //             <CardTitle>Research Interests</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="flex flex-wrap gap-2">
  //               {profile.research_interest.split(",").map((interest, index) => (
  //                 <Badge
  //                   key={index}
  //                   variant="outline"
  //                   className="border-gray-300 text-gray-700 hover:bg-gray-50"
  //                 >
  //                   {interest.trim()}
  //                 </Badge>
  //               ))}
  //             </div>
  //           </CardContent>
  //         </Card>
  //         {/* Skills */}
  //         <Card className="mt-6 border-2 border-gray-200">
  //           <CardHeader>
  //             <CardTitle>Skills & Expertise</CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             {profile.skills.length > 0 ? (
  //               <div className="space-y-6">
  //                 {profile.skills.map((skillGroup, index) => (
  //                   <div key={index}>
  //                     <h3 className="font-semibold text-gray-900 mb-3">
  //                       {skillGroup.category}
  //                     </h3>
  //                     <div className="flex flex-wrap gap-2">
  //                       {skillGroup.items.map((skill, skillIndex) => (
  //                         <Badge
  //                           key={skillIndex}
  //                           className="bg-black text-white hover:bg-gray-800"
  //                         >
  //                           {skill}
  //                         </Badge>
  //                       ))}
  //                     </div>
  //                     {index < profile.skills.length - 1 && (
  //                       <Separator className="mt-4" />
  //                     )}
  //                   </div>
  //                 ))}
  //               </div>
  //             ) : (
  //               <p className="text-gray-500">No skills added</p>
  //             )}
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
}
