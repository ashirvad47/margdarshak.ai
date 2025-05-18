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

  let rawText = "";
  let textToParse = "";

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      let noResponseErrorMsg = `AI did not provide a response for industry: ${industry}.`;
      if (result.promptFeedback && result.promptFeedback.blockReason) {
        noResponseErrorMsg += ` Blocked due to: ${result.promptFeedback.blockReason}.`;
         if (result.promptFeedback.safetyRatings) {
            noResponseErrorMsg += ` Safety ratings: ${JSON.stringify(result.promptFeedback.safetyRatings)}`;
        }
      } else {
        noResponseErrorMsg += ` Full API result: ${JSON.stringify(result)}`;
      }
      console.error(noResponseErrorMsg);
      throw new Error(noResponseErrorMsg);
    }

    if (typeof response.text !== 'function' || !response.candidates || response.candidates.length === 0) {
        let detailedError = `AI response structure was unexpected for industry: ${industry}.`;
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            detailedError += ` Blocked due to: ${response.promptFeedback.blockReason}.`;
             if (response.promptFeedback.safetyRatings) {
                detailedError += ` Safety ratings: ${JSON.stringify(response.promptFeedback.safetyRatings)}`;
            }
        } else if (response.text && typeof response.text === 'string') { // Handle cases where .text is a direct string (e.g. error messages)
             rawText = response.text;
        } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text) {
             rawText = response.candidates[0].content.parts[0].text || "";
        } else {
            detailedError += ` Missing candidates or text method. Full response: ${JSON.stringify(response)}`;
            console.error(detailedError);
            throw new Error(detailedError);
        }
        // If rawText is still not set (and not explicitly blocked), it means structure is truly unexpected
        if (!rawText && !(response.promptFeedback && response.promptFeedback.blockReason)) {
            console.error(detailedError + ` Raw text fallback failed. Full response: ${JSON.stringify(response)}`);
            throw new Error(detailedError + ` Raw text fallback failed.`);
        }
    } else {
        rawText = response.text();
    }

    if (typeof rawText !== 'string' || rawText.trim() === "") {
        let emptyTextErrorMsg = `AI returned empty or non-string content for industry: ${industry}.`;
         if (response?.promptFeedback && response.promptFeedback.blockReason) {
            emptyTextErrorMsg += ` Blocked due to: ${response.promptFeedback.blockReason}.`;
        }
        console.error(emptyTextErrorMsg, "Raw text received (if available):", rawText);
        throw new Error(emptyTextErrorMsg);
    }

    textToParse = rawText.trim();

    // More robust stripping of markdown code fences
    const commonJsonPrefix = "```json";
    const commonBacktickPrefix = "```";

    if (textToParse.startsWith(commonJsonPrefix)) {
        textToParse = textToParse.substring(commonJsonPrefix.length);
    } else if (textToParse.startsWith(commonBacktickPrefix)) {
        textToParse = textToParse.substring(commonBacktickPrefix.length);
    }

    if (textToParse.endsWith(commonBacktickPrefix)) {
        textToParse = textToParse.substring(0, textToParse.length - commonBacktickPrefix.length);
    }
    
    textToParse = textToParse.trim(); // Trim whitespace that might have been between backticks and JSON content

    if (textToParse === "") {
        console.error(`Cleaned AI response is empty for industry: ${industry}. Original raw text was:`, rawText);
        throw new Error(`AI returned an effectively empty JSON structure for industry: ${industry}. This might be due to content policies or an API issue.`);
    }

    const parsedJson = JSON.parse(textToParse);

    if (typeof parsedJson !== 'object' || parsedJson === null || !Array.isArray(parsedJson.salaryRanges)) {
        console.error("Parsed JSON is not a valid insight object:", parsedJson, "for industry:", industry, "Text attempted to parse:", textToParse);
        throw new Error(`AI returned data in an unexpected object structure for industry: ${industry} after parsing. Please check AI output or prompt.`);
    }
    return parsedJson;

  } catch (error) {
    console.error(`Critical error in generateAIInsights for industry "${industry}": ${error.message}. Original raw text (if available): "${rawText}", Text attempted for parsing: "${textToParse}"`, error.stack);
    throw new Error(`Failed to generate AI insights for ${industry}. Reason: ${error.message || "Unknown AI error"}`);
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, industry: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) {
    console.error("User industry not set for user:", userId);
    throw new Error("User industry not set. Please complete onboarding.");
  }

  let existingInsight = await db.industryInsight.findUnique({
      where: { industry: user.industry },
  });

  if (existingInsight) {
      console.log(`Workspaceed insights for '${user.industry}' from DB.`);
      return existingInsight;
  }

  console.log(`Insights for '${user.industry}' not found or needs update. Generating...`);
  try {
    const insightsData = await generateAIInsights(user.industry);

    const newIndustryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        salaryRanges: insightsData.salaryRanges || [],
        growthRate: insightsData.growthRate || 0,
        demandLevel: insightsData.demandLevel || "Medium",
        topSkills: insightsData.topSkills || [],
        marketOutlook: insightsData.marketOutlook || "Neutral",
        keyTrends: insightsData.keyTrends || [],
        recommendedSkills: insightsData.recommendedSkills || [],
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`Generated and saved new IndustryInsight for '${user.industry}'`);
    return newIndustryInsight;

  } catch (error) {
    console.error(`Failed to get or generate industry insights for ${user.industry} in getIndustryInsights: ${error.message}`);
    throw new Error(`Could not retrieve industry insights for ${user.industry}. Please try again later or contact support if the issue persists. AI Reason: ${error.message}`);
  }
}

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

    if (!response || typeof response.text !== 'function') {
        let errorDetail = "AI response for trend explanations was missing or malformed.";
        if (result.promptFeedback && result.promptFeedback.blockReason) {
            errorDetail += ` Blocked due to: ${result.promptFeedback.blockReason}.`;
        }
        console.error(errorDetail, `Full result: ${JSON.stringify(result)}`);
        throw new Error(errorDetail);
    }

    rawTextResponse = response.text();
    let cleanedText = rawTextResponse.trim(); // Use a new variable for modifications

    const commonJsonPrefix = "```json";
    const commonBacktickPrefix = "```";

    if (cleanedText.startsWith(commonJsonPrefix)) {
        cleanedText = cleanedText.substring(commonJsonPrefix.length);
    } else if (cleanedText.startsWith(commonBacktickPrefix)) {
        cleanedText = cleanedText.substring(commonBacktickPrefix.length);
    }

    if (cleanedText.endsWith(commonBacktickPrefix)) {
        cleanedText = cleanedText.substring(0, cleanedText.length - commonBacktickPrefix.length);
    }
    
    cleanedText = cleanedText.trim();
    
    if (cleanedText === "") {
        throw new Error("AI returned an empty string for trend explanations after cleaning.");
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
    console.error("Raw Gemini response text for trends that may have caused parsing error:", rawTextResponse);
    return trends.reduce((acc, trend) => {
        acc[trend] = "Could not load explanation at this time due to an error.";
        return acc;
    }, {});
  }
}