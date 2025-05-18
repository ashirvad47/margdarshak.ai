// File: actions/dashboard.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"], 
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"], 
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 key trends. Ensure keyTrends are concise phrases.
    Include at least 8-10 recommended skills. Ensure recommendedSkills are concise and actionable.
    List a minimum of 5 top skills currently in demand.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  // Attempt to remove markdown only if it's likely present.
  let cleanedText = text.replace(/^```json\s*([\s\S]*?)\s*```$/, "$1").trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("Failed to parse AI insights JSON. Raw text:", text, "Cleaned text:", cleanedText, parseError);
    // It's often helpful to see more of the invalid JSON
    const errorContext = cleanedText.length > 500 ? cleanedText.substring(0, 500) + "..." : cleanedText;
    throw new Error(`AI returned malformed JSON for industry insights. Cleaned text snippet: ${errorContext}`);
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) {
    console.error("User industry not set for user:", userId);
    throw new Error("User industry not set. Please complete onboarding.");
  }

  if (!user.industryInsight) {
    console.log(`Insights for '${user.industry}' not found in DB. Generating...`);
    const insightsData = await generateAIInsights(user.industry);

    // Ensure all arrays are initialized even if AI returns undefined for them
    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        salaryRanges: insightsData.salaryRanges || [],
        growthRate: insightsData.growthRate || 0,
        demandLevel: insightsData.demandLevel || "Medium",
        topSkills: insightsData.topSkills || [],
        marketOutlook: insightsData.marketOutlook || "Neutral",
        keyTrends: insightsData.keyTrends || [],
        recommendedSkills: insightsData.recommendedSkills || [], // Ensures it's an array
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`Generated and saved new IndustryInsight for '${user.industry}'`);
    return industryInsight;
  }
  console.log(`Workspaceed insights for '${user.industry}' from DB.`);
  return user.industryInsight;
}

// ... (getTrendExplanationsWithGemini function remains the same as your working version)
export async function getTrendExplanationsWithGemini(trends, industry) {
  if (!trends || trends.length === 0) {
    return {};
  }
  if (!industry) {
    console.warn("getTrendExplanationsWithGemini: Industry not provided, explanations might be generic.");
    industry = "general";
  }

  const trendListForPrompt = trends.map((t, index) => `${index + 1}. "${t}"`).join('\n');
  const prompt = `
    For the following key industry trends in the "${industry}" sector, provide a concise, insightful, one-sentence explanation for each.
    The explanation should be suitable for a professional audience looking for quick insights.

    Trends:
    ${trendListForPrompt}

    Return the response strictly as a JSON object where each key is the exact trend string from the list above,
    and the value is its corresponding one-sentence explanation.

    Example JSON output format:
    {
      "AI & Machine Learning": "The increasing adoption of AI and machine learning is driving automation and new capabilities across the industry.",
      "Remote Work & Collaboration": "There's a growing shift towards remote work models, necessitating advanced collaboration tools and strategies."
    }

    IMPORTANT: Output ONLY the JSON object. Do not include any other text, notes, markdown formatting, or any introductory/concluding sentences.
    The keys in the JSON object MUST EXACTLY MATCH the trend strings provided in the list.
  `;

  let rawTextResponse = ""; 
  try {
    console.log(`Requesting trend explanations for industry "${industry}" with trends:`, trends);
    const result = await model.generateContent(prompt);
    const response = result.response;
    rawTextResponse = response.text();
    let cleanedText = rawTextResponse.trim();
    
    if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();
    } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();
    }

    const explanations = JSON.parse(cleanedText);
    if (trends.length > 0 && Object.keys(explanations).length === 0 && !cleanedText.includes("The increasing adoption")) { 
        console.warn("Gemini might have returned an empty JSON object for trend explanations. Raw response text:", rawTextResponse, "Cleaned text:", cleanedText);
        return trends.reduce((acc, trend) => {
            acc[trend] = "Detailed explanation currently unavailable.";
            return acc;
        }, {});
    }
    return explanations;
  } catch (error) {
    console.error(`Error generating trend explanations for industry "${industry}":`, error.message);
    console.error("Raw Gemini response text that may have caused parsing error:", rawTextResponse);
    return trends.reduce((acc, trend) => {
        acc[trend] = "Could not load explanation at this time due to an error.";
        return acc;
    }, {});
  }
}