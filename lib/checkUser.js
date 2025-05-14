import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser(); // Clerk's user object

  if (!user) {
    return null; // Or handle as unauthenticated
  }

  try {
    // Find existing user in your DB
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id, // user.id is the Clerk user ID
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // If not found, create a new user in your DB
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0].emailAddress; // Fallback for name

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        // industry, bio, experience, skills will be null/empty initially
      },
    });
    console.log("New user created in DB:", newUser.id, newUser.email); // For debugging
    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message); // Log the actual error
    // Depending on the error, you might re-throw or return null
    // For now, let's not throw, to see if it gets past this.
    return null;
  }
};