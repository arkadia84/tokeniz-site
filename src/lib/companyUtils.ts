/**
 * Extract the user-input short name from a company record.
 * company_name format: "Tokenizio RWA LLC - Acme Holdings - Series 001"
 * Returns: "Acme Holdings"
 */
export function getShortName(company: { company_name: string; series_name?: string | null }): string {
  const parts = company.company_name.split(" - ");
  if (parts.length === 3) return parts[1];
  return company.company_name;
}
