import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/services/budget.service";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const { completed, goals, userId } = await getOnboardingStatus();

  if (!userId) {
    redirect("/login");
  }

  if (completed) {
    redirect("/dashboard");
  }

  return <OnboardingWizard userId={userId} initialGoals={goals} />;
}
