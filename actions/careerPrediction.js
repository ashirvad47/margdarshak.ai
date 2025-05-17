// File: actions/careerPrediction.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "@/actions/dashboard"; // For IndustryInsight creation
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModelInstance = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });

// getUserMlProfile and getCareerPredictions (dummy) functions remain the same
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
      // subIndustry: true, // Already selected in prisma schema, ensure it's here if needed later
    },
  });
  if (!userProfile) {
    throw new Error("User profile not found. Please ensure you have completed the initial profile setup.");
  }
  return userProfile;
}

const getDummyPredictionsFromMLModel = async (userProfileData) => {
  console.log("Simulating ML prediction with profile data:", userProfileData);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  // These careers should ideally be keys in your careerToIndustryAndSubIndustryMap
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
    select: {
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
  if (!userMlProfile.fieldOfStudy) { // Basic check for profile completeness
    throw new Error("Your profile is missing key information (e.g., Field of Study) required for career prediction.");
  }

  // Map to the keys your (dummy or real) model expects
  const modelInputData = {
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

// MODIFIED function signature and prompt for generateSkillsForCareerWithGemini
export async function generateSkillsForCareerWithGemini(careerNameOrContext, industry, subIndustry, userBio, userExperience) {
  let promptContext = `For the career path related to "${careerNameOrContext}" within the "${industry}" industry`;
  if (subIndustry) {
    promptContext += ` (specifically in the "${subIndustry}" sub-industry)`;
  }
  promptContext += `, considering a candidate with ${userExperience || 0} years of experience 
    and this professional background: "${userBio || 'No specific bio provided.'}",
    list 10 to 12 core technical and soft skills crucial for success.
    Prioritize skills relevant to the current job market for this role.
    Return ONLY a JSON array of strings, without any introductory text, explanations, or markdown formatting.
    Example: ["Python", "Machine Learning", "Statistics", "Communication", "Problem Solving", "Project Management"]`;

  try {
    const result = await geminiModelInstance.generateContent(promptContext);
    const response = result.response;
    let text = response.text().trim();
    
    if (text.startsWith("```json")) {
      text = text.substring(7);
    } else if (text.startsWith("```")) {
      text = text.substring(3);
    }
    if (text.endsWith("```")) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    const skillsArray = JSON.parse(text);
    if (Array.isArray(skillsArray) && skillsArray.every(s => typeof s === 'string')) {
      return skillsArray.slice(0, 12); // Return up to 12 skills
    }
    console.warn("Gemini skill generation did not return a valid JSON array of strings. Raw text after cleaning:", text);
    throw new Error("AI skill generation returned an unexpected format."); // Make error more specific
  } catch (error) {
    console.error(`Error in generateSkillsForCareerWithGemini for context "${careerNameOrContext}":`, error);
    throw new Error(`AI skill generation failed for ${careerNameOrContext}. Details: ${error.message}`);
  }
}

// MODIFIED function signature for saveFinalCareerChoice
export async function saveFinalCareerChoice(industry, subIndustry, skills, careerNameForSkillContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized: User not authenticated.");
  if (!industry) throw new Error("Industry is required.");
  // subIndustry is now mandatory if the chosen industry has sub-industries.
  // This validation should ideally happen on the client, but a check here is also good.
  // For now, we assume client sends valid subIndustry or null/empty string if not applicable.

  if (!Array.isArray(skills)) {
    throw new Error("Skills must be provided as an array.");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true } 
  });
  if (!user) throw new Error("User not found.");

  // Validate skills (simple validation for now)
  const validatedSkills = skills.map(skill => String(skill).trim()).filter(Boolean).slice(0, 25); // Max 25 skills

  try {
    const updatedUser = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: { industry: industry }, // Use the main industry for insights
      });

      if (!industryInsight) {
        console.log(`IndustryInsight for '${industry}' not found. Generating...`);
        try {
          const newInsightsData = await generateAIInsights(industry); 
          if (typeof newInsightsData !== 'object' || newInsightsData === null) {
            console.error("generateAIInsights returned a non-object payload:", newInsightsData, "for industry:", industry);
            // Decide how to handle: throw, or create a minimal IndustryInsight
            // For now, let's throw to make it obvious during debugging.
            // In production, you might want to create a placeholder IndustryInsight.
            throw new Error(`Failed to generate valid insights data structure for industry: ${industry}. Received: ${JSON.stringify(newInsightsData)}`);
          }
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: industry,
              ...newInsightsData,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          console.log(`Generated and saved new IndustryInsight for '${industry}'`);
        } catch (insightError) {
            console.error(`Failed to generate IndustryInsight for '${industry}' during user choice save: ${insightError.message}. User's industry/subIndustry/skills will still be set.`);
            // Allow transaction to continue, dashboard might show "insights unavailable"
        }
      }

      const userWithFinalChoice = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: industry,
          subIndustry: subIndustry || null, // Save subIndustry, store null if empty/not applicable
          skills: validatedSkills, // Save the skills passed from the frontend
        },
      });
      return userWithFinalChoice;
    });

    console.log(`User ${user.id} finalized career choice to industry: ${industry}, subIndustry: ${subIndustry || 'N/A'}, skills: ${validatedSkills.join(', ')}`);
    revalidatePath("/onboarding");
    revalidatePath("/career-suggestions");
    revalidatePath("/dashboard");

    return { 
      ...userWithFinalChoice, // Ensure this is the user object from the transaction
      industry: userWithFinalChoice.industry, // Use the updated values
      subIndustry: userWithFinalChoice.subIndustry,
      skills: userWithFinalChoice.skills // CRITICAL: Return the skills as saved
  };
  } catch (error) {
    console.error(`Error saving final career choice for user ${user.id}:`, error);
    if (error.message?.includes("SAFETY")) { // Check for specific safety errors from Gemini
        throw new Error("Could not finalize career choice due to content policy issues, possibly with industry data generation.");
    }
    throw new Error(`Failed to save your career choice. Original error: ${error.message}`);
  }
}