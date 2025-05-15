// app/(main)/onboarding/page.jsx
import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";
import { checkUser } from "@/lib/checkUser"; // Import checkUser

export default async function OnboardingPage() {
  // Ensure user exists in DB before checking onboarding status
  const dbUser = await checkUser();
  if (!dbUser) {
    // This could happen if checkUser fails or if the user is not authenticated.
    // Redirecting to sign-in is a safe fallback.
    redirect("/sign-in");
    return null; // Stop further execution to prevent errors
  }

  // Now that dbUser exists (or was created), proceed to check their onboarding status.
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
    return null; // Stop further execution
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}