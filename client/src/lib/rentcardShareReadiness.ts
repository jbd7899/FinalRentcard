import type { TenantProfile } from '@shared/schema';

export type EmploymentInfoDetails = {
  employer?: string | null;
  position?: string | null;
  monthlyIncome?: number | string | null;
  startDate?: string | null;
};

export const SHARE_PREREQUISITES_MESSAGE =
  'Add your employment info, credit score, and rent budget to unlock sharing.';

const parseEmploymentInfo = (
  employmentInfo: TenantProfile['employmentInfo'] | string | null | undefined
): EmploymentInfoDetails | null => {
  if (!employmentInfo) {
    return null;
  }

  if (typeof employmentInfo === 'string') {
    try {
      return JSON.parse(employmentInfo) as EmploymentInfoDetails;
    } catch (error) {
      console.warn('Unable to parse employment info for share readiness check:', error);
      return null;
    }
  }

  return employmentInfo as EmploymentInfoDetails;
};

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  return NaN;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const canShareRentCardProfile = (profile?: TenantProfile | null): boolean => {
  if (!profile) {
    return false;
  }

  const employmentDetails = parseEmploymentInfo(profile.employmentInfo);
  if (!employmentDetails) {
    return false;
  }

  const monthlyIncomeValue = toNumberValue(employmentDetails.monthlyIncome);
  const hasEmploymentDetails =
    isNonEmptyString(employmentDetails.employer) &&
    isNonEmptyString(employmentDetails.position) &&
    isNonEmptyString(employmentDetails.startDate) &&
    Number.isFinite(monthlyIncomeValue) &&
    monthlyIncomeValue > 0;

  if (!hasEmploymentDetails) {
    return false;
  }

  const creditScoreValue = toNumberValue((profile as TenantProfile).creditScore);
  const maxRentValue = toNumberValue((profile as TenantProfile).maxRent);

  const hasCreditScore = Number.isFinite(creditScoreValue) && creditScoreValue >= 300;
  const hasMaxRent = Number.isFinite(maxRentValue) && maxRentValue > 0;

  return hasCreditScore && hasMaxRent;
};

export const isShareReadinessMissing = (profile?: TenantProfile | null): boolean =>
  Boolean(profile) && !canShareRentCardProfile(profile);
