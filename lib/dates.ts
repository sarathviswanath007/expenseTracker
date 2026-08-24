export function parseMonthYearParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const now = new Date();
  const rawMonth = Array.isArray(searchParams.month)
    ? searchParams.month[0]
    : searchParams.month;
  const rawYear = Array.isArray(searchParams.year)
    ? searchParams.year[0]
    : searchParams.year;

  const month = Number(rawMonth);
  const year = Number(rawYear);

  return {
    month: month >= 1 && month <= 12 ? month : now.getMonth() + 1,
    year: year >= 2000 && year <= 2100 ? year : now.getFullYear(),
  };
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
