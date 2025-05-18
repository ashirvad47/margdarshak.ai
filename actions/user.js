// File: actions/user.js
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUser(data) { // This is the ML profile update
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (!user) throw new Error("User not found");

  const dataToUpdate = {
    experience: data.experience !== undefined ? Number(data.experience) : null,
    bio: data.bio || null,
    fieldOfStudy: data.fieldOfStudy || null,
    gpa: data.gpa !== undefined ? Number(data.gpa) : null,
    extracurricularActivities: data.extracurricularActivities !== undefined ? Number(data.extracurricularActivities) : null,
    internships: data.internships !== undefined ? Number(data.internships) : null,
    projects: data.projects !== undefined ? Number(data.projects) : null,
    leadershipPositions: data.leadershipPositions !== undefined ? Number(data.leadershipPositions) : null,
    fieldSpecificCourses: data.fieldSpecificCourses !== undefined ? Number(data.fieldSpecificCourses) : null,
    researchExperience: data.researchExperience !== undefined ? Number(data.researchExperience) : null,
    codingSkills: data.codingSkills !== undefined ? Number(data.codingSkills) : null,
    communicationSkills: data.communicationSkills !== undefined ? Number(data.communicationSkills) : null,
    problemSolvingSkills: data.problemSolvingSkills !== undefined ? Number(data.problemSolvingSkills) : null,
    teamworkSkills: data.teamworkSkills !== undefined ? Number(data.teamworkSkills) : null,
    analyticalSkills: data.analyticalSkills !== undefined ? Number(data.analyticalSkills) : null,
    presentationSkills: data.presentationSkills !== undefined ? Number(data.presentationSkills) : null,
    networkingSkills: data.networkingSkills !== undefined ? Number(data.networkingSkills) : null,
    industryCertifications: data.industryCertifications !== undefined ? Number(data.industryCertifications) : null,
  };

  try {
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });
    console.log("User ML profile updated in DB:", updatedUser.id);
    revalidatePath("/onboarding"); // For the checks on this page
    revalidatePath("/career-suggestions"); // If this page shows profile data
    return updatedUser;
  } catch (error) {
    console.error("Error updating user with ML profile:", error.message, error.stack);
    if (error.code) {
        throw new Error(`Database error during ML profile update: ${error.message} (Code: ${error.code})`);
    }
    throw new Error(`Failed to update ML profile: ${error.message}`);
  }
}
export async function updateUserSkills(newSkills) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

   if (!Array.isArray(newSkills) || !newSkills.every(skill => typeof skill === 'string')) {
    throw new Error("Invalid skills format. Expected an array of strings.");
  }

  const validatedSkills = newSkills.map(skill => skill.trim()).filter(Boolean).slice(0, 25);

  try {
    const updatedUser = await db.user.update({
      where: { clerkUserId },
      data: {
        skills: validatedSkills,
      },
    });
    console.log("User skills updated in DB:", updatedUser.id, validatedSkills);
    revalidatePath("/dashboard"); // Revalidate dashboard to show updated skills
    revalidatePath("/career-suggestions"); // If skills are shown there
    revalidatePath("/resume"); // If resume builder uses these skills
    return updatedUser; // Return the updated user object with new skills
  } catch (error) {
    console.error("Error updating user skills:", error.message);
    throw new Error(`Failed to update skills: ${error.message}`);
  }
}

export async function getUserOnboardingStatus() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    // Not authenticated, so not onboarded in any sense relevant to the app flow.
    return {
        isMlProfileCompleted: false,
        isFullyOnboarded: false,
        userExists: false, // Clerk middleware should handle unauth users, but good to be clear
    };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true, // To confirm user record exists in our DB
      fieldOfStudy: true, // Marker for ML profile completion
      industry: true,     // Marker for final industry/career choice (full onboarding)
    },
  });

  if (!user) {
    // User exists in Clerk but not in our DB yet.
    // checkUser() should handle creating them. If called after checkUser and still null, it's an issue.
    // For the purpose of status, if no DB record, they haven't started.
    console.warn(`getUserOnboardingStatus: User with clerkUserId ${clerkUserId} not found in DB. checkUser should have run.`);
    return {
      isMlProfileCompleted: false,
      isFullyOnboarded: false,
      userExists: false,
    };
  }

  // isMlProfileCompleted: True if 'fieldOfStudy' (a required field from the ML form) is present.
  // isFullyOnboarded: True if 'industry' (set after career choice) is present.
  return {
    isMlProfileCompleted: !!user.fieldOfStudy,
    isFullyOnboarded: !!user.industry,
    userExists: true,
  };
}