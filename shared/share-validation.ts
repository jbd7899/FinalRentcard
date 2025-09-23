import type { TenantProfile } from "./schema";

export type EmploymentRequirementField = "employer" | "position" | "monthlyIncome" | "startDate";

export type ShareReadinessSection = "employmentInfo" | "creditScore" | "maxRent";

export type ShareReadinessIssue =
  | { section: "employmentInfo"; missingFields: EmploymentRequirementField[] }
  | { section: "creditScore" }
  | { section: "maxRent" };

export interface ShareReadinessResult {
  isReady: boolean;
  issues: ShareReadinessIssue[];
}

type EmploymentInfoLike =
  | TenantProfile["employmentInfo"]
  | string
  | null
  | undefined;

type ParsedEmploymentInfo = Partial<Record<EmploymentRequirementField, unknown>>;

const parseEmploymentInfo = (employmentInfo: EmploymentInfoLike): ParsedEmploymentInfo | null => {
  if (!employmentInfo) {
    return null;
  }

  if (typeof employmentInfo === "string") {
    const trimmed = employmentInfo.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed) as ParsedEmploymentInfo;
    } catch (error) {
      console.warn("Unable to parse employment info for share readiness check:", error);
      return null;
    }
  }

  return employmentInfo as ParsedEmploymentInfo;
};

const toNumberValue = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : Number.NaN;
  }

  return Number.NaN;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasValidDateLikeValue = (value: unknown): boolean => {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime());
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return false;
};

const ALL_EMPLOYMENT_FIELDS: EmploymentRequirementField[] = [
  "employer",
  "position",
  "monthlyIncome",
  "startDate",
];

export const evaluateShareReadiness = (
  profile?: TenantProfile | null
): ShareReadinessResult => {
  const issues: ShareReadinessIssue[] = [];

  if (!profile) {
    issues.push({ section: "employmentInfo", missingFields: [...ALL_EMPLOYMENT_FIELDS] });
    issues.push({ section: "creditScore" });
    issues.push({ section: "maxRent" });
    return { isReady: false, issues };
  }

  const employmentDetails = parseEmploymentInfo(profile.employmentInfo);
  const missingEmploymentFields: EmploymentRequirementField[] = [];

  if (!employmentDetails || !isNonEmptyString(employmentDetails.employer)) {
    missingEmploymentFields.push("employer");
  }

  if (!employmentDetails || !isNonEmptyString(employmentDetails.position)) {
    missingEmploymentFields.push("position");
  }

  const monthlyIncomeValue = employmentDetails
    ? toNumberValue(employmentDetails.monthlyIncome)
    : Number.NaN;
  if (!employmentDetails || !Number.isFinite(monthlyIncomeValue) || monthlyIncomeValue <= 0) {
    missingEmploymentFields.push("monthlyIncome");
  }

  if (!employmentDetails || !hasValidDateLikeValue(employmentDetails.startDate)) {
    missingEmploymentFields.push("startDate");
  }

  if (missingEmploymentFields.length > 0) {
    issues.push({ section: "employmentInfo", missingFields: missingEmploymentFields });
  }

  const creditScoreValue = toNumberValue(profile.creditScore);
  if (!Number.isFinite(creditScoreValue) || creditScoreValue < 300) {
    issues.push({ section: "creditScore" });
  }

  const maxRentValue = toNumberValue(profile.maxRent);
  if (!Number.isFinite(maxRentValue) || maxRentValue <= 0) {
    issues.push({ section: "maxRent" });
  }

  return {
    isReady: issues.length === 0,
    issues,
  };
};

export const missingShareRequirements = (
  profile?: TenantProfile | null
): ShareReadinessIssue[] => evaluateShareReadiness(profile).issues;
