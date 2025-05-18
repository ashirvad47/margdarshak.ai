// File: actions/interview.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MODIFIED function signature and logic
export async function generateQuiz(params) {
  const {
    skills: selectedSkills, // Array of skill strings, or null/undefined for all user's skills
    numQuestions = 10,     // Default to 10 questions
    difficulty = "Medium", // Default to Medium
  } = params || {};

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true, // Needed for saving assessment later
      industry: true,
      skills: true, // User's general skills from their profile
    },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("User industry not set. Please complete onboarding.");

  let skillsForPrompt = selectedSkills;
  if (!skillsForPrompt || skillsForPrompt.length === 0) {
    skillsForPrompt = user.skills; // Default to user's profile skills if none are specifically selected
  }
  if (!skillsForPrompt || skillsForPrompt.length === 0) {
    // If still no skills, throw an error or use a very generic industry-based quiz
    console.warn(`No skills provided for quiz generation for user ${user.id} in industry ${user.industry}. Generating general industry questions.`);
    // skillsForPrompt = ["general " + user.industry + " knowledge"]; // Fallback, or could error out
  }


  const prompt = `
    Generate ${numQuestions} technical interview questions for a ${user.industry} professional.
    The difficulty level should be ${difficulty}.
    ${skillsForPrompt && skillsForPrompt.length > 0 ? `Focus on the following skills/topics: ${skillsForPrompt.join(", ")}.` : "Cover general topics relevant to the industry."}
    
    Each question should be multiple choice with 4 options.
    Provide a correct answer and a brief explanation for each question.

    Return the response strictly in this JSON format only, with no additional text or markdown:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
        // ... more questions up to numQuestions
      ]
    }
  `;

  try {
    console.log("Generating quiz with params:", { industry: user.industry, skillsForPrompt, numQuestions, difficulty });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    let cleanedText = text.replace(/^```json\s*([\s\S]*?)\s*```$/, "$1").trim();
    if (cleanedText.startsWith("```json")) { // Extra aggressive cleaning if the above fails
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


    const quiz = JSON.parse(cleanedText);

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
        console.error("Generated quiz does not have a valid questions array. Raw:", text, "Cleaned:", cleanedText);
        throw new Error("AI failed to return questions in the expected format.");
    }
    
    // Ensure the AI respects the number of questions, otherwise slice it.
    return quiz.questions.slice(0, numQuestions); 
  } catch (error) {
    console.error("Error generating quiz:", error.message, "Raw text from AI:", error.rawResponse || text);
    throw new Error(`Failed to generate quiz questions: ${error.message}`);
  }
}

// saveQuizResult and getAssessments remain largely the same,
// but saveQuizResult might want to store the quiz parameters (skills, num, difficulty)
// with the assessment for more detailed history.

export async function saveQuizResult(questions, answers, score, quizParams) { // Added quizParams
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(q => `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`)
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong (difficulty: ${quizParams?.difficulty || 'Medium'}):
      ${quizParams?.skills?.length > 0 ? `Skills tested: ${quizParams.skills.join(', ')}` : ''}

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes; instead, focus on what to learn/practice.
    `;
    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessmentData = {
      userId: user.id,
      quizScore: score,
      questions: questionResults,
      category: quizParams?.skills?.join(', ') || "General", // Use skills as category or "General"
      improvementTip,
      // Store quiz parameters if your schema is updated
      // quizParameters: quizParams ? JSON.stringify(quizParams) : null, 
    };
    
    // If you add quizParameters (JSON type) to your Assessment model:
    // if (quizParams) {
    //   assessmentData.quizParameters = quizParams; 
    // }

    const assessment = await db.assessment.create({ data: assessmentData });
    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) { // Should not happen if Clerk middleware is effective
      console.error("getAssessments: User not found in DB for clerkUserId:", clerkUserId);
      return []; // Return empty or throw error
  }

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }, // Changed to desc to show recent first
    });
    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}

// New action to get user's skills for the form
export async function getUserSkillsForQuiz() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { skills: true }
    });
    if (!user) throw new Error("User not found");
    return user.skills || [];
}