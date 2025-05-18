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
      console.log("DashboardPage: Not fully onboarded (industry not chosen). Redirecting to /career-suggestions.");
      redirect("/career-suggestions");
    }
    return null;
  }

  console.log("DashboardPage: User is fully onboarded. Fetching insights.");
  const insights = await getIndustryInsights(); 

  if (!insights) {
      console.error("DashboardPage: Insights not found for user's industry. User might need to re-select or insights need generation.");
  }

  return (
    <div>
      <DashboardView
        insights={insights}
        // Pass the user's skills and industry from the dbUser object
        userSkills={dbUser?.skills || []} 
        userIndustry={dbUser?.industry || ""} 
      />
    </div>
  );
}