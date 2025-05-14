"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // The 'id' check was removed from here as 'data' contains form input, not an ID.

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    // Select only necessary fields if not already minimal
    select: { id: true, industry: true, experience: true, skills: true, bio: true }
  });

  if (!user) throw new Error("User not found");
  if (!user.industry || user.experience === null) { // Check if user has essential onboarding info
    throw new Error("User profile is not complete. Please complete onboarding first.");
  }


  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.

    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ") || "Not specified"}
    - Professional Background: ${user.bio || "Not specified"}

    Job Description:
    ${data.jobDescription}

    Requirements:
    1. Use a professional, enthusiastic tone.
    2. Highlight relevant skills and experience from the candidate's background that match the job description.
    3. Show understanding of the company's needs if inferable from the job description.
    4. Keep it concise (around 3-4 paragraphs, max 400 words).
    5. Format the letter in well-structured markdown, including a proper salutation and closing.
    6. If possible, incorporate 1-2 quantifiable achievements if they can be logically inferred or if the candidate's bio provides any.
    7. Relate candidate's background to specific requirements mentioned in the job description.
    8. Address it to "Hiring Manager" if no specific name is available.

    Format the letter in markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "draft", // Changed to draft, user can finalize
        userId: user.id,
      },
    });

    return coverLetter; // This will include the new ID
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    // Consider more specific error messages if possible
    if (error.message.includes("SAFETY")) {
        throw new Error("Failed to generate cover letter due to content policy. Please revise the job description or try again.");
    }
    throw new Error("Failed to generate cover letter. Please try again later.");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) throw new Error("Cover letter ID is required."); // Correct place for this check

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const letter = await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id, // Ensure user can only access their own letters
    },
  });

  if (!letter) throw new Error("Cover letter not found or access denied.");
  return letter;
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) throw new Error("Cover letter ID is required."); // Correct place for this check

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Optional: Check if the letter actually belongs to the user before deleting
  const letterExists = await db.coverLetter.findFirst({
    where: { id, userId: user.id },
  });

  if (!letterExists) {
    throw new Error("Cover letter not found or you do not have permission to delete it.");
  }

  return await db.coverLetter.delete({
    where: {
      id,
      // No need for userId here if we already confirmed ownership,
      // but Prisma unique constraint on ID is enough for delete.
    },
  });
}