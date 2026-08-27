import { Download } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/shell/page-container";

export default function ExportPage() {
  return (
    <PageContainer width="narrow" className="justify-center">
      <EmptyState
        icon={Download}
        title="Exports are coming soon"
        description="You'll be able to download your expenses, budgets, and analytics as CSV, Excel, or PDF for any month."
      />
    </PageContainer>
  );
}
