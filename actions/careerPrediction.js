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
    console.error("User ML profile is missing 'fieldOfStudy'. Cannot proceed with prediction.");
    throw new Error("Your profile is missing key information (Field of Study) required for career prediction. Please complete your onboarding.");
  }

  const featuresForApi = {
    Field: userMlProfile.fieldOfStudy, // Assumed to be always present
    GPA: userMlProfile.gpa === null || userMlProfile.gpa === undefined ? 0.0 : parseFloat(userMlProfile.gpa),
    Leadership_Positions: userMlProfile.leadershipPositions === null || userMlProfile.leadershipPositions === undefined ? 0 : parseInt(userMlProfile.leadershipPositions, 10),
    Research_Experience: userMlProfile.researchExperience === null || userMlProfile.researchExperience === undefined ? 0 : parseInt(userMlProfile.researchExperience, 10),
    Industry_Certifications: userMlProfile.industryCertifications === null || userMlProfile.industryCertifications === undefined ? 0 : parseInt(userMlProfile.industryCertifications, 10),
    Extracurricular_Activities: userMlProfile.extracurricularActivities === null || userMlProfile.extracurricularActivities === undefined ? 0 : parseInt(userMlProfile.extracurricularActivities, 10),
    Internships: userMlProfile.internships === null || userMlProfile.internships === undefined ? 0 : parseInt(userMlProfile.internships, 10),
    Projects: userMlProfile.projects === null || userMlProfile.projects === undefined ? 0 : parseInt(userMlProfile.projects, 10),
    Field_Specific_Courses: userMlProfile.fieldSpecificCourses === null || userMlProfile.fieldSpecificCourses === undefined ? 0 : parseInt(userMlProfile.fieldSpecificCourses, 10),
    Coding_Skills: userMlProfile.codingSkills === null || userMlProfile.codingSkills === undefined ? 0 : parseInt(userMlProfile.codingSkills, 10),
    Communication_Skills: userMlProfile.communicationSkills === null || userMlProfile.communicationSkills === undefined ? 0 : parseInt(userMlProfile.communicationSkills, 10),
    Problem_Solving_Skills: userMlProfile.problemSolvingSkills === null || userMlProfile.problemSolvingSkills === undefined ? 0 : parseInt(userMlProfile.problemSolvingSkills, 10),
    Teamwork_Skills: userMlProfile.teamworkSkills === null || userMlProfile.teamworkSkills === undefined ? 0 : parseInt(userMlProfile.teamworkSkills, 10),
    Analytical_Skills: userMlProfile.analyticalSkills === null || userMlProfile.analyticalSkills === undefined ? 0 : parseInt(userMlProfile.analyticalSkills, 10),
    Presentation_Skills: userMlProfile.presentationSkills === null || userMlProfile.presentationSkills === undefined ? 0 : parseInt(userMlProfile.presentationSkills, 10),
    Networking_Skills: userMlProfile.networkingSkills === null || userMlProfile.networkingSkills === undefined ? 0 : parseInt(userMlProfile.networkingSkills, 10),
  };

  const payload = {
    features: featuresForApi,
  };

  try {
    console.log("Sending payload to FastAPI:", JSON.stringify(payload, null, 2));
    // Ensure your FastAPI server is running locally on http://127.0.0.1:8000
    const response = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Get more details if possible
      console.error(`FastAPI Error ${response.status}: ${response.statusText}`, errorBody);
      throw new Error(`Failed to get predictions from API. Status: ${response.status}. Details: ${errorBody}`);
    }

    const predictionsData = await response.json();

    // The FastAPI endpoint returns: { predicted_career: "...", top_predictions: [{career: "...", probability: ...}, ...] }
    // We need to adapt this to the format previously expected from getDummyPredictionsFromMLModel,
    // which was an array like: [{ career: "...", probability: ...}, ...]
    // The main `predicted_career` is usually the first one in `top_predictions` or closely related.
    // For now, let's just return the `top_predictions` array, which matches the dummy format.

    if (!predictionsData.top_predictions || !Array.isArray(predictionsData.top_predictions)) {
        console.error("Invalid prediction format received from FastAPI:", predictionsData);
        throw new Error("Received invalid format from prediction service (FastAPI). Expected 'top_predictions' array.");
    }

    console.log("Received predictions from FastAPI:", predictionsData.top_predictions);
    return predictionsData.top_predictions;

  } catch (error) {
    console.error("Error in getCareerPredictions calling FastAPI:", error);
    if (error.message.startsWith("Failed to get predictions from API") || 
        error.message.startsWith("Received invalid format") ||
        error.message.includes("fetch failed")) { 
        throw new Error(`Could not connect to the prediction service or the service returned an error: ${error.message}. Please ensure the FastAPI server is running and accessible.`);
    }
    throw new Error(`Failed to connect to or process response from the prediction service: ${error.message}`);
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
    select: { id: true, experience: true } // Fetch user's experience
  });
  if (!user) throw new Error("User not found.");

  const validatedSkills = skills.map(skill => String(skill).trim()).filter(Boolean).slice(0, 25);

  let newInsightsData = null;
  let existingInsight = null;

  try {
    existingInsight = await db.industryInsight.findUnique({
      where: { industry: industry },
    });

    if (!existingInsight) {
      console.log(`IndustryInsight for '${industry}' not found. Generating with context (Sub: ${subIndustry}, Exp: ${user.experience})...`);
      try {
        // Pass industry, subIndustry, and user.experience
        newInsightsData = await generateAIInsights(industry, subIndustry, user.experience);
      } catch (insightGenerationError) {
        console.error(`Failed to generate IndustryInsight for '${industry}' BEFORE transaction: ${insightGenerationError.message}.`);
        throw new Error(`Could not generate essential industry insights for ${industry}. Your career choice was not saved. AI Reason: ${insightGenerationError.message}`);
      }
    }

    const updatedUser = await db.$transaction(async (tx) => {
      if (newInsightsData && !existingInsight) {
        console.log(`Saving newly generated IndustryInsight for '${industry}' within transaction.`);
        await tx.industryInsight.create({
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
            // lastUpdated will be default by Prisma
          },
        });
        console.log(`Saved new IndustryInsight for '${industry}' within transaction.`);
      }
      // If existingInsight exists but might be stale and needs an update with new context,
      // you could add an update call here. For now, we only create if it's missing.
      // else if (existingInsight && newInsightsData) { /* logic to update existingInsight */ }


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
    if (error.code === 'ERR_INVALID_ARG_TYPE' && error.message.includes("payload")) { // Should be less likely now
        throw new Error(`Failed to save your career choice due to an internal data issue. Please try again. Details: ${error.message}`);
    }
    throw new Error(`Failed to save your career choice. Please try again. Error: ${error.message}`);
  }
}