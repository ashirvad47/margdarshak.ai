// File: actions/careerPrediction.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "@/actions/dashboard";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModelInstance = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  if (!userMlProfile.fieldOfStudy) {
    throw new Error("Your profile is missing key information (e.g., Field of Study) required for career prediction.");
  }

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

// Ensure this function is exported
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
    
    if (text === "") {
        throw new Error("AI returned an empty string for skill suggestions after cleaning.");
    }

    const skillsArray = JSON.parse(text);
    if (Array.isArray(skillsArray) && skillsArray.every(s => typeof s === 'string')) {
      return skillsArray.slice(0, 12);
    }
    console.warn("Gemini skill generation did not return a valid JSON array of strings. Raw text after cleaning:", text);
    throw new Error("AI skill generation returned an unexpected format.");
  } catch (error) {
    console.error(`Error in generateSkillsForCareerWithGemini for context "${careerNameOrContext}":`, error);
    let finalErrorMessage = `AI skill generation failed for ${careerNameOrContext}.`;
    if (error.message && error.message.includes("SAFETY")) {
        finalErrorMessage += " This might be due to content safety policies.";
    } else if (error.message) {
        finalErrorMessage += ` Details: ${error.message}`;
    }
    throw new Error(finalErrorMessage);
  }
}

export async function saveFinalCareerChoice(industry, subIndustry, skills, careerNameForSkillContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized: User not authenticated.");
  if (!industry) throw new Error("Industry is required.");
  if (!Array.isArray(skills)) throw new Error("Skills must be provided as an array.");

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true }
  });
  if (!user) throw new Error("User not found.");

  const validatedSkills = skills.map(skill => String(skill).trim()).filter(Boolean).slice(0, 25);

  let newInsightsData = null;
  let existingInsight = null;

  try {
    // Step 1: Check for existing insight OR generate new one if needed (OUTSIDE the transaction)
    existingInsight = await db.industryInsight.findUnique({
      where: { industry: industry },
    });

    if (!existingInsight) {
      console.log(`IndustryInsight for '${industry}' not found. Generating...`);
      try {
        newInsightsData = await generateAIInsights(industry); // This might throw
        // newInsightsData is now guaranteed to be an object if no error was thrown by generateAIInsights
      } catch (insightGenerationError) {
        console.error(`Failed to generate IndustryInsight for '${industry}' BEFORE transaction: ${insightGenerationError.message}.`);
        // Decide if you want to proceed without insights or throw.
        // For critical insights, it's better to throw and inform the user.
        throw new Error(`Could not generate essential industry insights for ${industry}. Your career choice was not saved. AI Reason: ${insightGenerationError.message}`);
      }
    }

    // Step 2: Perform database updates within a transaction
    const updatedUser = await db.$transaction(async (tx) => {
      if (newInsightsData && !existingInsight) { // Only create if it was generated and didn't exist
        console.log(`Saving newly generated IndustryInsight for '${industry}' within transaction.`);
        await tx.industryInsight.create({ // Use 'await' here
          data: {
            industry: industry,
            salaryRanges: newInsightsData.salaryRanges || [],
            growthRate: newInsightsData.growthRate || 0,
            demandLevel: newInsightsData.demandLevel || "Medium",
            topSkills: newInsightsData.topSkills || [],
            marketOutlook: newInsightsData.marketOutlook || "Neutral",
            keyTrends: newInsightsData.keyTrends || [],
            recommendedSkills: newInsightsData.recommendedSkills || [],
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        console.log(`Saved new IndustryInsight for '${industry}' within transaction.`);
      }

      const userWithFinalChoiceInTx = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: industry,
          subIndustry: subIndustry || null,
          skills: validatedSkills,
        },
      });
      return userWithFinalChoiceInTx;
    });

    console.log(`User ${user.id} finalized career choice to industry: ${industry}, subIndustry: ${subIndustry || 'N/A'}, skills: ${validatedSkills.join(', ')}`);
    revalidatePath("/onboarding");
    revalidatePath("/career-suggestions");
    revalidatePath("/dashboard");

    return {
      ...updatedUser,
      industry: updatedUser.industry,
      subIndustry: updatedUser.subIndustry,
      skills: updatedUser.skills
    };

  } catch (error) {
    console.error(`Error in saveFinalCareerChoice for user ${user.id}:`, error);
    // Check for Prisma transaction timeout specifically if possible, or general AI failure messages
    if (error.message?.includes("Transaction already closed") || error.message?.includes("timeout")) {
        throw new Error(`Failed to save your career choice due to a timeout while processing data. Please try again. Details: ${error.message}`);
    }
    if (error.message?.includes("AI did not provide a response") ||
        error.message?.includes("AI response structure was unexpected") ||
        error.message?.includes("AI returned empty or non-string content") ||
        error.message?.includes("AI returned an effectively empty JSON structure") ||
        error.message?.includes("AI returned data in an unexpected object structure") ||
        error.message?.includes("Failed to generate AI insights") ||
        error.message?.includes("Could not generate essential industry insights") ||
        error.message?.includes("SAFETY") ||
        error.message?.includes("content policy")
        ) {
      throw new Error(`Could not finalize career choice: The AI failed to generate necessary industry data. This might be due to content policies, an API issue, or the information requested. Details: ${error.message}`);
    }
    // Fallback for other errors, including the original "payload" type error if it somehow resurfaces
    if (error.code === 'ERR_INVALID_ARG_TYPE' && error.message.includes("payload")) {
        throw new Error(`Failed to save your career choice due to an internal data issue. Please try again. Details: ${error.message}`);
    }
    throw new Error(`Failed to save your career choice. Please try again. Error: ${error.message}`);
  }
}