// app/(main)/onboarding/page.jsx
import { redirect } from "next/navigation";
// import { industries } from "@/data/industries"; // No longer needed here
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";
import { checkUser } from "@/lib/checkUser";

export default async function OnboardingPage() {
  const dbUser = await checkUser();
  if (!dbUser) {
    redirect("/sign-in"); // Or appropriate error handling
    return null;
  }

  const { isMlProfileCompleted, isFullyOnboarded } = await getUserOnboardingStatus();

  if (isFullyOnboarded) {
    // If they have completed ML profile AND selected an industry (final step)
    redirect("/dashboard");
    return null;
  }

  if (isMlProfileCompleted && !isFullyOnboarded) {
    // If they have completed ML profile but NOT selected an industry yet
    redirect("/career-suggestions"); // Redirect to the next step (ML suggestions page)
    return null;
  }

  // If !isMlProfileCompleted, they land here to fill the ML onboarding form
  return (
    <main>
      {/* industries prop is no longer passed to OnboardingForm */}
      <OnboardingForm />
    </main>
  );
}