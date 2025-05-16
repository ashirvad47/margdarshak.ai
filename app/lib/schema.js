// app/lib/schema.js
import { z } from "zod";
import { degreeFields } from "@/data/degreeFields"; // Import the degree fields

// Helper for optional number strings that can be empty or valid numbers
const optionalNumberString = (min, max, fieldName) =>
  z.string()
    .transform((val) => (val === "" ? undefined : Number(val))) // Convert "" to undefined, else to number
    .pipe(
      z.number()
        .int(`${fieldName} must be a whole number.`)
        .min(min, `${fieldName} must be at least ${min}.`)
        .max(max, `${fieldName} cannot exceed ${max}.`)
        .optional() // Make the number itself optional after transformation
    );

const optionalFloatString = (min, max, fieldName) =>
  z.string()
    .transform((val) => (val === "" ? undefined : Number(val)))
    .pipe(
      z.number()
        .min(min, `${fieldName} must be at least ${min}.`)
        .max(max, `${fieldName} cannot exceed ${max}.`)
        .optional()
    );

export const mlOnboardingSchema = z.object({
  // Retained fields
  experience: z // Kept 'experience' from old schema, assuming it's years of experience
    .string()
    .transform((val) => (val === "" || val === null || val === undefined ? undefined : parseInt(val, 10)))
    .pipe(
      z.number({invalid_type_error: "Years of experience must be a number."})
        .int("Years of experience must be a whole number.")
        .min(0, "Experience must be at least 0 years.")
        .max(60, "Experience cannot exceed 60 years.")
        .optional() // Making it optional if it can be empty initially
    ),
  bio: z.string().max(1000, "Bio should not exceed 1000 characters.").optional().or(z.literal("")), // Allow empty string

  // New ML Model Fields
  fieldOfStudy: z.string({ required_error: "Please select your field of study." })
                 .refine(val => degreeFields.includes(val), { message: "Invalid field of study."}),

  gpa: optionalFloatString(0, 10, "GPA"), // Assuming GPA scale 0-10, adjust if different (e.g., 0-4)

  extracurricularActivities: optionalNumberString(0, 100, "Extracurricular Activities count"), // Max 100 as an example
  internships: optionalNumberString(0, 50, "Internships count"),
  projects: optionalNumberString(0, 100, "Projects count"),

  leadershipPositions: optionalNumberString(0, 1, "Leadership Positions"), // Binary 0 or 1
  fieldSpecificCourses: optionalNumberString(0, 100, "Field Specific Courses count"),
  researchExperience: optionalNumberString(0, 1, "Research Experience"), // Binary 0 or 1

  codingSkills: optionalNumberString(0, 4, "Coding Skills rating"), // Ordinal 0-4
  communicationSkills: optionalNumberString(0, 4, "Communication Skills rating"),
  problemSolvingSkills: optionalNumberString(0, 4, "Problem Solving Skills rating"),
  teamworkSkills: optionalNumberString(0, 4, "Teamwork Skills rating"),
  analyticalSkills: optionalNumberString(0, 4, "Analytical Skills rating"),
  presentationSkills: optionalNumberString(0, 4, "Presentation Skills rating"),
  networkingSkills: optionalNumberString(0, 4, "Networking Skills rating"),
  industryCertifications: optionalNumberString(0, 1, "Industry Certifications"), // Binary 0 or 1
});

// Keep your other schemas (contactSchema, entrySchema, resumeSchema, coverLetterSchema)
// ... (rest of your existing schema.js)
export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  );

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

// --- Deprecated onboardingSchema, replaced by mlOnboardingSchema ---
// export const onboardingSchema = z.object({
//   industry: z.string({
//     required_error: "Please select an industry",
//   }),
//   subIndustry: z.string({
//     required_error: "Please select a specialization",
//   }),
//   bio: z.string().max(500).optional(),
//   experience: z // This was the old experience field
//     .string()
//     .transform((val) => parseInt(val, 10))
//     .pipe(
//       z
//         .number()
//         .min(0, "Experience must be at least 0 years")
//         .max(50, "Experience cannot exceed 50 years")
//     ),
//   skills: z.string().transform((val) => // This was the old skills field
//     val
//       ? val
//           .split(",")
//           .map((skill) => skill.trim())
//           .filter(Boolean)
//       : undefined
//   ),
// });