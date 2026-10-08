// Single source of truth for the legal entity behind the LandyKe brand.
// Every page, PDF or template that names the operator must read from here.
const REGISTERED_OFFICE =
  "SDA Eldoville, Eldoville Street, Kapsoya, Eldoret, Uasin Gishu County, Kenya";

export const COMPANY = {
  legalName: "YaFred Holdings Limited",
  tradingName: "LandyKe",
  companyNumber: "PVT-OD16Y3EQ",
  /** Full registered office, as used in legal clauses. */
  registeredOffice: REGISTERED_OFFICE,
  /** Directions landmark for the registered office (not used in legal clauses). */
  registeredOfficeLandmark: "near Moi Girls",
  registeredOfficeShort: "Eldoville Street, Kapsoya, Eldoret",
  postalAddress: "P.O. Box 7172-30100, Eldoret",
  country: "Kenya",
  registrationDate: "8 October 2026",
  effectiveDate: "8 October 2026",
} as const;

/** "YaFred Holdings Limited t/a LandyKe" — used wherever the issuer is named. */
export const LEGAL_ISSUER = `${COMPANY.legalName} t/a ${COMPANY.tradingName}`;

/** Definitions clause shared by the Terms of Service and Privacy Policy. */
export const DEFINITIONS_CLAUSE = `'${COMPANY.tradingName}', 'we' and 'us' mean ${COMPANY.legalName} (Company No. ${COMPANY.companyNumber}), trading as ${COMPANY.tradingName}, with its registered office at ${COMPANY.registeredOffice}.`;

export function currentYear(): number {
  return new Date().getFullYear();
}
