import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights Cron" , id: "generate-industry-insights-cron"}, // Added ID for clarity
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries from IndustryInsight table", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true }, // We only need the main industry name
      });
    });

    if (!industries || industries.length === 0) {
      console.log("No industries found in IndustryInsight table to update.");
      return { message: "No industries to update." };
    }

    for (const { industry } of industries) {
      // Construct a prompt similar to generateAIInsights, but for general update (no subIndustry/userExperience)
      const prompt = `
          Analyze the current state of the ${industry} industry and provide general insights.
          Provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string (e.g., USA, India, Remote)" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
            "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          - For salaryRanges: Include at least 5 common roles. Provide general salary ranges.
          - Ensure all string array fields (topSkills, keyTrends, recommendedSkills) have at least 5 items, and recommendedSkills ideally 8-10.
        `;

      try {
        const res = await step.run(`Generate insights for ${industry}`, async () => {
             const generationResult = await model.generateContent(prompt);
             return generationResult.response.text(); // Get raw text
        });

        let cleanedText = res.trim(); // `res` here is the raw text from the AI
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
            console.error(`Cron: Cleaned AI response is empty for industry: ${industry}. Raw text was:`, res);
            throw new Error(`Cron: AI returned an effectively empty JSON structure for industry: ${industry}.`);
        }
        
        const insights = JSON.parse(cleanedText);

        if (typeof insights !== 'object' || insights === null || !Array.isArray(insights.salaryRanges)) {
             console.error(`Cron: Parsed JSON is not a valid insight object for ${industry}:`, insights, "Cleaned text was:", cleanedText);
            throw new Error(`Cron: AI returned data in an unexpected object structure for industry: ${industry}.`);
        }


        await step.run(`Update ${industry} insights in DB`, async () => {
          await db.industryInsight.update({
            where: { industry }, // Ensure this matches your unique key
            data: {
              salaryRanges: insights.salaryRanges || [],
              growthRate: insights.growthRate || 0,
              demandLevel: insights.demandLevel || "Medium",
              topSkills: insights.topSkills || [],
              marketOutlook: insights.marketOutlook || "Neutral",
              keyTrends: insights.keyTrends || [],
              recommendedSkills: insights.recommendedSkills || [],
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        });
        console.log(`Cron: Successfully updated insights for ${industry}`);
      } catch (error) {
          // Log the error for the specific industry and continue with the next one
          console.error(`Cron: Failed to generate or update insights for industry "${industry}": ${error.message}. Skipping this industry.`);
          // Optionally, you could send a notification or retry this specific industry later
      }
    }
    return { message: `Finished updating insights for ${industries.length} industries.` };
  }
);