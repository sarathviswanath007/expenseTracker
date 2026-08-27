import { Target } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/shell/page-container";

export default function GoalsPage() {
  return (
    <PageContainer width="narrow" className="justify-center">
      <EmptyState
        icon={Target}
        title="Savings goals are coming soon"
        description="You'll be able to track what you're saving toward, how far along you are, and when you're on pace to get there. Your onboarding goals are already saved."
      />
    </PageContainer>
  );
}
