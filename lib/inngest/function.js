// lib/inngest/function.js
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { industries as appIndustries } from '@/data/industries'; // Your predefined list of industries

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const GENERAL_SUB_INDUSTRY_PLACEHOLDER = "_GENERAL_";

// This is the AI interaction part, specifically for the cron's general insights
async function generateGeneralInsightsForCronAI(industryName) {
  const promptContext = `Analyze the current state of the ${industryName} industry and provide general insights suitable for a range of experience levels. Do not refer to any specific sub-industry unless it's a dominant aspect of the main industry itself.`;
  const prompt = `
    ${promptContext}
    Provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [ { "role": "string", "min": number, "max": number, "median": number, "location": "string (e.g., USA, India, Remote)" } ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"]
    }
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    - For salaryRanges: Include at least 5 common roles for the ${industryName} industry. Provide general salary ranges.
    - For growthRate and marketOutlook: These should pertain to the main ${industryName}.
    - Ensure all string array fields (topSkills, keyTrends, recommendedSkills) have at least 5 items, and recommendedSkills ideally 8-10, relevant to the general ${industryName} industry.
  `;

  let rawText = "";
  let textToParse = "";
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      let noResponseErrorMsg = `Cron AI: No response for industry: ${industryName}.`;
      if (result.promptFeedback && result.promptFeedback.blockReason) {
        noResponseErrorMsg += ` Blocked due to: ${result.promptFeedback.blockReason}.`;
      }
      console.error(noResponseErrorMsg, `Full API result: ${JSON.stringify(result)}`);
      throw new Error(noResponseErrorMsg);
    }
    
    if (response.text && typeof response.text === 'function') {
        rawText = response.text();
    } else if (response.text && typeof response.text === 'string') { 
        rawText = response.text;
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0] && response.candidates[0].content.parts[0].text) {
        rawText = response.candidates[0].content.parts[0].text || "";
    } else {
        let detailedError = `Cron AI: Unexpected response structure for industry: ${industryName}.`;
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            detailedError += ` Blocked: ${response.promptFeedback.blockReason}.`;
        }
        console.error(detailedError, `Full response: ${JSON.stringify(response)}`);
        throw new Error(detailedError);
    }

    if (typeof rawText !== 'string' || rawText.trim() === "") {
        let emptyTextErrorMsg = `Cron AI: Empty/non-string content for: ${industryName}.`;
         if (response?.promptFeedback && response.promptFeedback.blockReason) {
            emptyTextErrorMsg += ` Blocked: ${response.promptFeedback.blockReason}.`;
        }
        console.error(emptyTextErrorMsg, "Raw text:", rawText);
        throw new Error(emptyTextErrorMsg);
    }

    textToParse = rawText.trim();
    const commonJsonPrefix = "```json";
    const commonBacktickPrefix = "```";
    if (textToParse.startsWith(commonJsonPrefix)) { textToParse = textToParse.substring(commonJsonPrefix.length); }
    else if (textToParse.startsWith(commonBacktickPrefix)) { textToParse = textToParse.substring(commonBacktickPrefix.length); }
    if (textToParse.endsWith(commonBacktickPrefix)) { textToParse = textToParse.substring(0, textToParse.length - commonBacktickPrefix.length); }
    textToParse = textToParse.trim();

    if (textToParse === "") {
        console.error(`Cron AI: Cleaned response empty for: ${industryName}. Raw:`, rawText);
        throw new Error(`Cron AI: Empty JSON structure for: ${industryName}.`);
    }

    const parsedJson = JSON.parse(textToParse);
    if (typeof parsedJson !== 'object' || parsedJson === null || !Array.isArray(parsedJson.salaryRanges)) {
        console.error(`Cron AI: Invalid JSON object for: ${industryName}. Parsed:`, parsedJson, "Cleaned text:", cleanedText);
        throw new Error(`Cron AI: Unexpected object structure for: ${industryName}.`);
    }
    return parsedJson;
  } catch (error) {
    console.error(`Cron AI: Critical error for "${industryName}": ${error.message}. Raw: "${rawText}", Parsed: "${textToParse}"`, error.stack);
    throw new Error(`Cron AI: Failed for ${industryName}. Reason: ${error.message}`);
  }
}

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights Cron", id: "generate-industry-insights-cron" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ step }) => { // Removed 'event' as it's not used
    // Use the predefined list of main industries from data/industries.js
    const industriesToUpdate = appIndustries.map(item => item.name);

    if (!industriesToUpdate || industriesToUpdate.length === 0) {
      console.log("Cron: No industries defined in data/industries.js to update.");
      return { message: "No industries configured to update." };
    }

    console.log(`Cron: Starting update for ${industriesToUpdate.length} main industries.`);

    for (const industryName of industriesToUpdate) {
      try {
        const insights = await step.run(`Generate general insights for ${industryName}`, async () => {
          // Call the AI generation function specific to cron's needs
          return await generateGeneralInsightsForCronAI(industryName);
        });

        await step.run(`Upsert general insight for ${industryName}`, async () => {
          await db.industryInsight.upsert({
            where: {
              IndustrySubIndustryUnique: { 
                industry: industryName,
                subIndustry: GENERAL_SUB_INDUSTRY_PLACEHOLDER,
              }
            },
            update: {
              salaryRanges: insights.salaryRanges || [],
              growthRate: insights.growthRate || 0,
              demandLevel: insights.demandLevel || "Medium",
              topSkills: insights.topSkills || [],
              marketOutlook: insights.marketOutlook || "Neutral",
              keyTrends: insights.keyTrends || [],
              recommendedSkills: insights.recommendedSkills || [],
              // lastUpdated is handled by @updatedAt
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next update in 7 days
            },
            create: {
              industry: industryName,
              subIndustry: GENERAL_SUB_INDUSTRY_PLACEHOLDER, // Store with the placeholder
              salaryRanges: insights.salaryRanges || [],
              growthRate: insights.growthRate || 0,
              demandLevel: insights.demandLevel || "Medium",
              topSkills: insights.topSkills || [],
              marketOutlook: insights.marketOutlook || "Neutral",
              keyTrends: insights.keyTrends || [],
              recommendedSkills: insights.recommendedSkills || [],
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        });
        console.log(`Cron: Successfully updated/created general insight for ${industryName}`);
      } catch (error) {
        console.error(`Cron: Failed to generate or update insight for industry "${industryName}": ${error.message}. Skipping this industry.`);
        // Optionally, you could implement more sophisticated error tracking or retries for specific industries here.
      }
    }
    return { message: `Cron job finished. Attempted to update general insights for ${industriesToUpdate.length} main industries.` };
  }
);