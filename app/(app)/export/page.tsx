import { ExportView } from "@/components/export/export-view";
import { parseMonthYearParams } from "@/lib/dates";

export default async function ExportPage(props: PageProps<"/export">) {
  const searchParams = await props.searchParams;
  const { month, year } = parseMonthYearParams(searchParams);

  return <ExportView month={month} year={year} />;
}
