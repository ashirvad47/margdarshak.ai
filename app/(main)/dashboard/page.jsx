// File: app/(main)/dashboard/page.jsx
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";

export default async function DashboardPage() {
  const dbUser = await checkUser(); // Ensure user exists in our DB
  if (!dbUser) {
    console.error("DashboardPage: dbUser is null after checkUser. Redirecting to sign-in.");
    redirect("/sign-in");
    return null;
  }

  const { isMlProfileCompleted, isFullyOnboarded } = await getUserOnboardingStatus();

  if (!isFullyOnboarded) {
    if (!isMlProfileCompleted) {
      console.log("DashboardPage: ML profile not complete. Redirecting to /onboarding.");
      redirect("/onboarding");
    } else {
      // ML profile is done, but final industry choice isn't.
      console.log("DashboardPage: Not fully onboarded (industry not chosen). Redirecting to /career-suggestions.");
      redirect("/career-suggestions");
    }
    return null;
  }

  // If fully onboarded, proceed to fetch insights
  console.log("DashboardPage: User is fully onboarded. Fetching insights.");
  const insights = await getIndustryInsights(); // This relies on user.industry being set

  if (!insights) {
      // This could happen if industry was set, but insight generation failed and was not retried.
      // Or if user.industry points to an industry with no insight record.
      console.error("DashboardPage: Insights not found for user's industry. User might need to re-select or insights need generation.");
      // Potentially redirect to an error page or back to career-suggestions with a message
      // For now, render DashboardView which should handle null insights gracefully.
  }

  return (
    <div>
      <DashboardView insights={insights} />
    </div>
  );
}