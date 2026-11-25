import { COMPANIES } from "@/content/system-design/company-questions/companies";

export interface CompanyChoice {
  id: string;
  name: string;
  group: "india" | "global";
}

export function companyChoices(): CompanyChoice[] {
  return COMPANIES.map((c) => ({ id: c.id, name: c.name, group: c.group === "india" ? "india" : "global" }));
}
