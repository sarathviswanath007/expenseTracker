import { getDashboardSummary } from "@/services/analytics.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);
  const summary = await getDashboardSummary(month, year);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6">
      <DashboardView month={month} year={year} summary={summary} />
    </div>
  );
}
