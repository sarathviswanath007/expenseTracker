import { getInsights } from "@/services/ai-insights.service";
import { InsightsView } from "@/components/insights/insights-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function InsightsPage(props: PageProps<"/insights">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);
  const result = await getInsights(month, year);

  return <InsightsView month={month} year={year} result={result} />;
}
