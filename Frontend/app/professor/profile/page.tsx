"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  university: z.string().min(1, { message: "University is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  office: z.string().optional(),
  website: z.string().optional(),
  bio: z.string().min(1, { message: "Bio is required" }),
})

const researchInterestFormSchema = z.object({
  interest: z.string().min(1, { message: "Research interest is required" }),
})

const publicationFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  authors: z.string().min(1, { message: "Authors are required" }),
  journal: z.string().min(1, { message: "Journal/Conference is required" }),
  year: z.string().min(1, { message: "Year is required" }),
  link: z.string().optional(),
})

export default function ProfessorProfilePage() {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAddInterestOpen, setIsAddInterestOpen] = useState(false)
  const [isAddPublicationOpen, setIsAddPublicationOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const [profile, setProfile] = useState({
    name: "Professor Richard Davis",
    title: "Professor of Physics",
    department: "Department of Physics",
    university: "Massachusetts Institute of Technology",
    email: "richard.davis@mit.edu",
    phone: "(617) 555-1234",
    office: "Building 6, Room 123",
    website: "www.richarddavis.mit.edu",
    bio: "Dr. Richard Davis is a Professor of Physics at MIT, specializing in quantum information theory and quantum algorithms. His research focuses on developing new quantum computing methods for solving complex problems. He has published over 50 papers in leading journals and has received numerous awards for his contributions to the field of quantum computing.",
    avatar: "/placeholder.svg?height=128&width=128",
    researchInterests: [
      "Quantum Computing",
      "Quantum Algorithms",
      "Quantum Information Theory",
      "Quantum Error Correction",
      "Quantum Machine Learning",
    ],
    publications: [
      {
        id: 1,
        title: "Quantum Algorithms for Optimization Problems",
        authors: "Davis, R., Johnson, A., Smith, B.",
        journal: "Physical Review Letters",
        year: "2023",
        link: "https://doi.org/10.1103/PhysRevLett.123.456789",
      },
      {
        id: 2,
        title: "Advances in Quantum Error Correction",
        authors: "Davis, R., Williams, S., Chen, M.",
        journal: "Nature Quantum Information",
        year: "2022",
        link: "https://doi.org/10.1038/s41534-022-12345-6",
      },
      {
        id: 3,
        title: "Quantum Machine Learning for Climate Data Analysis",
        authors: "Davis, R., Lee, S., Brown, J.",
        journal: "Proceedings of the National Academy of Sciences",
        year: "2021",
        link: "https://doi.org/10.1073/pnas.2101234118",
      },
      {
        id: 4,
        title: "Quantum Computing Applications in Material Science",
        authors: "Davis, R., Taylor, R., Martinez, O.",
        journal: "Science",
        year: "2020",
        link: "https://doi.org/10.1126/science.abc1234",
      },
      {
        id: 5,
        title: "Theoretical Foundations of Quantum Information Processing",
        authors: "Davis, R., Wilson, T.",
        journal: "Reviews of Modern Physics",
        year: "2019",
        link: "https://doi.org/10.1103/RevModPhys.91.12345",
      },
    ],
    education: [
      {
        degree: "Ph.D. in Physics",
        institution: "California Institute of Technology",
        year: "2005",
      },
      {
        degree: "M.S. in Physics",
        institution: "Stanford University",
        year: "2001",
      },
      {
        degree: "B.S. in Physics",
        institution: "Harvard University",
        year: "1999",
      },
    ],
    awards: [
      {
        title: "National Science Foundation CAREER Award",
        year: "2010",
      },
      {
        title: "MIT School of Science Teaching Prize",
        year: "2015",
      },
      {
        title: "American Physical Society Fellow",
        year: "2018",
      },
    ],
    currentProjects: [
      {
        id: 1,
        title: "Quantum Computing Algorithms",
        description: "Developing novel quantum algorithms for optimization problems.",
        students: 3,
      },
      {
        id: 2,
        title: "Quantum Error Correction Methods",
        description: "Researching new methods for quantum error correction and fault tolerance.",
        students: 2,
      },
      {
        id: 3,
        title: "Quantum Machine Learning Applications",
        description: "Exploring applications of quantum computing in machine learning and AI.",
        students: 2,
      },
    ],
  })

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      title: profile.title,
      department: profile.department,
      university: profile.university,
      email: profile.email,
      phone: profile.phone,
      office: profile.office,
      website: profile.website,
      bio: profile.bio,
    },
  })

  const interestForm = useForm<z.infer<typeof researchInterestFormSchema>>({
    resolver: zodResolver(\
