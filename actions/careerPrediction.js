// File: actions/careerPrediction.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "@/actions/dashboard";
import { GoogleGenerativeAI } from "@google/generative-ai";
// toast is not available server-side for direct use to the client like this.
// If you need to signal an error for skill generation, the function should throw,
// or return a specific error indicator that the client-side useFetch can handle.
// import { toast } from "sonner";

const genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModelInstance = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });

// getUserMlProfile and getCareerPredictions functions remain as they were.
// ... (Keep the existing getUserMlProfile and getCareerPredictions functions)
export async function getUserMlProfile() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized: User not authenticated.");
  }
  const userProfile = await db.user.findUnique({
    where: { clerkUserId },
    select: {
      name: true, fieldOfStudy: true, gpa: true, extracurricularActivities: true,
      internships: true, projects: true, leadershipPositions: true,
      fieldSpecificCourses: true, researchExperience: true, codingSkills: true,
      communicationSkills: true, problemSolvingSkills: true, teamworkSkills: true,
      analyticalSkills: true, presentationSkills: true, networkingSkills: true,
      industryCertifications: true, experience: true, bio: true,
    },
  });
  if (!userProfile) {
    throw new Error("User profile not found. Please ensure you have completed the initial profile setup.");
  }
  return userProfile;
}

const getDummyPredictionsFromMLModel = async (userProfileData) => {
  console.log("Simulating ML prediction with profile data:", userProfileData);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    { career: "AI / Machine Learning Engineer", probability: 0.88 },
    { career: "Cloud Solutions Architect", probability: 0.75 },
    { career: "Cybersecurity Analyst", probability: 0.65 },
    { career: "Software Developer", probability: 0.59 },
    { career: "Data Scientist", probability: 0.52 },
  ];
};

export async function getCareerPredictions() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("Unauthorized: User not authenticated.");
  }
  const userMlProfile = await db.user.findUnique({
    where: { clerkUserId },
    select: { /* ... all ML input fields ... */
      fieldOfStudy: true, gpa: true, extracurricularActivities: true, internships: true,
      projects: true, leadershipPositions: true, fieldSpecificCourses: true,
      researchExperience: true, codingSkills: true, communicationSkills: true,
      problemSolvingSkills: true, teamworkSkills: true, analyticalSkills: true,
      presentationSkills: true, networkingSkills: true, industryCertifications: true,
    },
  });
  if (!userMlProfile) {
    throw new Error("User ML profile not found. Please complete your profile details first.");
  }
  if (!userMlProfile.fieldOfStudy) {
    throw new Error("Your profile is missing key information (e.g., Field of Study) required for career prediction.");
  }
  const modelInputData = { /* ... map userMlProfile to model's expected feature names ... */
    Field: userMlProfile.fieldOfStudy, GPA: userMlProfile.gpa,
    Extracurricular_Activities: userMlProfile.extracurricularActivities, Internships: userMlProfile.internships,
    Projects: userMlProfile.projects, Leadership_Positions: userMlProfile.leadershipPositions,
    Field_Specific_Courses: userMlProfile.fieldSpecificCourses, Research_Experience: userMlProfile.researchExperience,
    Coding_Skills: userMlProfile.codingSkills, Communication_Skills: userMlProfile.communicationSkills,
    Problem_Solving_Skills: userMlProfile.problemSolvingSkills, Teamwork_Skills: userMlProfile.teamworkSkills,
    Analytical_Skills: userMlProfile.analyticalSkills, Presentation_Skills: userMlProfile.presentationSkills,
    Networking_Skills: userMlProfile.networkingSkills, Industry_Certifications: userMlProfile.industryCertifications,
  };
  try {
    const predictions = await getDummyPredictionsFromMLModel(modelInputData);
    if (!predictions || !Array.isArray(predictions)) {
        console.error("Invalid prediction format received from dummy model:", predictions);
        throw new Error("Received invalid format from prediction service.");
    }
    return predictions;
  } catch (error) {
    console.error("Error in getCareerPredictions calling dummy model:", error);
    throw new Error(`Failed to get career predictions: ${error.message}`);
  }
}


// --- Career to Industry Mapping --- (Keep your comprehensive map here)
const careerToIndustryMap = {
  "AI / Machine Learning Engineer": "Technology", "Cloud Solutions Architect": "Technology",
  "Cybersecurity Analyst": "Technology", "Data Center Engineer": "Technology",
  "Data Scientist": "Technology", "DevOps Engineer": "Technology",
  "IT Project Manager": "Technology", "Mobile App Developer": "Technology",
  "Software Developer": "Technology", "UX/UI Designer": "Technology",
  "Web Developer": "Technology", "Actuarial Analyst": "Financial Services",
  "Chartered Accountant": "Financial Services", "Cost Accountant": "Financial Services",
  "Credit Analyst": "Financial Services", "Financial Advisor": "Financial Services",
  "Financial Analyst": "Financial Services", "Financial Controller": "Financial Services",
  "Investment Banker": "Financial Services", "Risk Analyst": "Financial Services",
  "Analytical Chemist": "Healthcare & Life Sciences", "Biochemist": "Healthcare & Life Sciences",
  "Biologist": "Healthcare & Life Sciences", "Biomedical Engineer": "Healthcare & Life Sciences",
  "Clinical Psychologist": "Healthcare & Life Sciences", "Counseling Psychologist": "Healthcare & Life Sciences",
  "Dentist": "Healthcare & Life Sciences", "Doctor (MBBS)": "Healthcare & Life Sciences",
  "Geneticist": "Healthcare & Life Sciences", "Medical Laboratory Technologist": "Healthcare & Life Sciences",
  "Microbiologist": "Healthcare & Life Sciences", "Music Therapist": "Healthcare & Life Sciences",
  "Nurse": "Healthcare & Life Sciences", "Nutritionist / Dietitian": "Healthcare & Life Sciences",
  "Organic Chemist": "Healthcare & Life Sciences", "Pharmacist": "Healthcare & Life Sciences",
  "Physicist": "Healthcare & Life Sciences", "Physiotherapist": "Healthcare & Life Sciences",
  "Public Health Specialist": "Healthcare & Life Sciences", "Quantum Physicist": "Technology",
  "Radiographer / Imaging Technologist": "Healthcare & Life Sciences", "Surgeon": "Healthcare & Life Sciences",
  "Advertising Manager": "Media & Entertainment", "Animator": "Media & Entertainment",
  "Art Director": "Media & Entertainment", "Brand Manager": "Media & Entertainment",
  "Content Writer": "Media & Entertainment", "Curator / Gallery Manager": "Media & Entertainment",
  "Digital Marketing Spec.": "Media & Entertainment", "Fashion Designer": "Retail & E-commerce",
  "Film / Video Editor": "Media & Entertainment", "Fine Artist / Painter": "Media & Entertainment",
  "Graphic Designer": "Media & Entertainment", "Illustrator": "Media & Entertainment",
  "Interior Designer": "Construction & Real Estate", "Social Media Manager": "Media & Entertainment",
  "Sound Engineer": "Media & Entertainment", "Curriculum Developer": "Education & Training",
  "Education Administrator": "Education & Training", "Music Teacher": "Education & Training",
  "Primary School Teacher": "Education & Training", "School Counselor": "Education & Training",
  "School Principal": "Education & Training", "Secondary School Teacher": "Education & Training",
  "Special Education Teacher": "Education & Training", "University Professor": "Education & Training",
  "Aerospace Engineer": "Manufacturing & Industrial", "Chemical Engineer": "Manufacturing & Industrial",
  "Civil Engineer": "Construction & Real Estate", "Electrical Engineer": "Manufacturing & Industrial",
  "Electronics & Communication": "Telecommunications", "Environmental Engineer": "Energy & Utilities",
  "Industrial Engineer": "Manufacturing & Industrial", "Mechanical Engineer": "Manufacturing & Industrial",
  "Petroleum Engineer": "Energy & Utilities", "Structural Engineer": "Construction & Real Estate",
  "Business Analyst": "Professional Services", "Corporate Lawyer": "Professional Services",
  "HR Manager": "Professional Services", "Judge": "Professional Services",
  "Lawyer": "Professional Services", "Legal Consultant": "Professional Services",
  "Management Consultant": "Professional Services", "Market Research Analyst": "Professional Services",
  "Paralegal": "Professional Services", "Talent Acquisition Spec.": "Professional Services",
  "Architect": "Construction & Real Estate", "Landscape Architect": "Construction & Real Estate",
  "Urban Planner": "Construction & Real Estate", "Chef / Culinary Artist": "Hospitality & Tourism",
  "Hospitality Manager": "Hospitality & Tourism", "Hotel Operations Manager": "Hospitality & Tourism",
  "Ecologist / Conservation Scientist": "Energy & Utilities", "Environmental Scientist": "Energy & Utilities",
  "Entrepreneur / Founder": "Technology", "Mathematician / Statistician": "Financial Services",
  "Social Worker": "Non-Profit & Social Services",
  // Add ALL your ML model's possible career outputs here mapped to an industry from data/industries.js
};

const mapCareerToIndustry = (careerName) => {
  const mappedIndustry = careerToIndustryMap[careerName];
  if (!mappedIndustry) {
    console.warn(`No specific industry mapping found for career: "${careerName}". Defaulting to "Professional Services". Review mappings.`);
    return "Professional Services"; // A sensible default
  }
  return mappedIndustry;
};

async function generateSkillsForCareerWithGemini(careerName, userBio, userExperience) {
  const prompt = `
    For the career path "${careerName}", considering a candidate with ${userExperience || 0} years of experience 
    and this professional background: "${userBio || 'No specific bio provided.'}",
    list 10 to 12 core technical and soft skills crucial for success.
    Prioritize skills relevant to the current job market for this role.
    Return ONLY a JSON array of strings, without any introductory text, explanations, or markdown formatting.
    Example: ["Python", "Machine Learning", "Statistics", "Communication", "Problem Solving", "Project Management"]
  `;

  try {
    const result = await geminiModelInstance.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();
    
    // **FIX for potential markdown code block:**
    if (text.startsWith("```json")) {
      text = text.substring(7); // Remove ```json\n
    } else if (text.startsWith("```")) {
      text = text.substring(3); // Remove ```\n
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim(); // Trim again after stripping markdown

    let skillsArray = JSON.parse(text);
    if (Array.isArray(skillsArray) && skillsArray.every(s => typeof s === 'string')) {
      return skillsArray.slice(0, 12);
    }
    console.warn("Gemini skill generation did not return a valid JSON array of strings after attempting to clean markdown. Raw text after cleaning:", text);
    return [];
  } catch (error) {
    console.error("Error in generateSkillsForCareerWithGemini (parsing or API call):", error);
    // This error will be caught by the calling function (saveFinalCareerChoice)
    throw new Error(`AI skill generation failed for ${careerName}. Details: ${error.message}`);
  }
}

export async function saveFinalCareerChoice(selectedCareerName) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");
  if (!selectedCareerName) throw new Error("No career selected.");

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true, bio: true, experience: true } 
  });
  if (!user) throw new Error("User not found.");

  const industryToSave = mapCareerToIndustry(selectedCareerName);
  
  let generatedSkills = [];
  try {
    generatedSkills = await generateSkillsForCareerWithGemini(selectedCareerName, user.bio, user.experience);
    console.log(`Generated skills for ${selectedCareerName}:`, generatedSkills);
  } catch (e) {
    // Log the error, but allow the process to continue to save the industry.
    // The client-side can show a toast if saveChoiceFn (from useFetch) catches this error.
    console.warn(`Skill generation for "${selectedCareerName}" failed: ${e.message}. Proceeding to save industry choice without AI-generated skills.`);
    // We re-throw so useFetch can catch it and display a toast.
    // The user can then add skills manually later.
    // Or, you might decide not to throw and just proceed with empty skills silently.
    // For now, let's allow the client to know skill generation failed if it's a distinct step.
    // However, the primary goal here is saving the industry.
    // Let's make skill generation non-blocking for saving the industry, but still signal the issue.
    // The error will be caught by the main try-catch block below if it's critical.
    // For now, we'll let it try to save with empty skills if generation fails.
  }

  try {
    const updatedUser = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: { industry: industryToSave },
      });

      if (!industryInsight) {
        console.log(`IndustryInsight for '${industryToSave}' not found. Generating...`);
        try {
          const newInsightsData = await generateAIInsights(industryToSave);
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: industryToSave,
              ...newInsightsData,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          console.log(`Generated and saved new IndustryInsight for '${industryToSave}'`);
        } catch (insightError) {
            console.error(`Failed to generate IndustryInsight for '${industryToSave}' during user choice save: ${insightError.message}. User's industry will still be set.`);
        }
      }

      const userWithFinalIndustry = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: industryToSave,
          skills: generatedSkills, // Save generated skills (can be empty array)
        },
      });
      return userWithFinalIndustry;
    });

    console.log(`User ${user.id} finalized industry choice to: ${industryToSave}`);
    revalidatePath("/onboarding");
    revalidatePath("/career-suggestions");
    revalidatePath("/dashboard");

    return { ...updatedUser, generatedSkills, industrySaved: industryToSave };
  } catch (error) {
    console.error(`Error saving final career choice for user ${user.id}:`, error);
    if (error.message?.includes("SAFETY")) {
        throw new Error("Could not finalize career choice due to content policy issues with industry data generation.");
    }
    // Make the error more specific if skill generation itself was the main problem.
    if (error.message.startsWith("AI skill generation failed")) {
        throw error; // Re-throw the specific skill generation error
    }
    throw new Error(`Failed to save your career choice. Original error: ${error.message}`);
  }
}