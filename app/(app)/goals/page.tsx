import { getGoals } from "@/services/goal.service";
import { GoalsView } from "@/components/goals/goals-view";

export default async function GoalsPage() {
  const result = await getGoals();

  return <GoalsView result={result} />;
}
