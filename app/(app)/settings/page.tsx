import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/shell/page-container";

export default function SettingsPage() {
  return (
    <PageContainer width="narrow" className="justify-center">
      <EmptyState
        icon={Settings}
        title="Settings are coming soon"
        description="Currency, alert thresholds, and account preferences will live here. For now you can change your currency and thresholds on the Budgets page."
      />
    </PageContainer>
  );
}
