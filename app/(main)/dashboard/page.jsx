// app/(main)/dashboard/page.jsx
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser"; // Potentially call checkUser here too for robustness

export default async function DashboardPage() {
  // Ensure user exists in DB before checking onboarding status
  // This checkUser call might be redundant if Header already does it,
  // but good for direct page loads.
  const dbUser = await checkUser();
  if (!dbUser) {
    // This could happen if checkUser fails or user is not authenticated by Clerk
    // Redirect to sign-in or show an error page
    redirect("/sign-in"); // Or handle appropriately
  }

  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights(); // This also relies on the user being in the DB

  return (
    // Container and styling handled by the layout.js for this route
    <div>
      <DashboardView insights={insights} />
    </div>
  );
}