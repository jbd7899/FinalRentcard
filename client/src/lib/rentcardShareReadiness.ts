import type { TenantProfile } from '@shared/schema';
import {
  EmploymentRequirementField,
  ShareReadinessIssue,
  ShareReadinessResult,
  ShareReadinessSection,
  evaluateShareReadiness,
} from '@shared/share-validation';

export const SHARE_PREREQUISITES_MESSAGE =
  'Add your employment info, credit score, and rent budget to unlock sharing.';

export interface ShareChecklistItem {
  id: string;
  label: string;
  href: string;
  section: ShareReadinessSection;
}

export interface ShareReadinessSummary extends ShareReadinessResult {
  checklist: ShareChecklistItem[];
}

export const SHARE_SECTION_LINKS: Record<ShareReadinessSection, string> = {
  employmentInfo: '/tenant/rentcard#employment',
  creditScore: '/tenant/rentcard#credit',
  maxRent: '/tenant/rentcard#rent-preferences',
};

const EMPLOYMENT_FIELD_LABELS: Record<EmploymentRequirementField, string> = {
  employer: 'Add your employer name',
  position: 'Add your job title',
  monthlyIncome: 'Enter your monthly income',
  startDate: 'Add your employment start date',
};

const createEmploymentChecklistItems = (
  missingFields: EmploymentRequirementField[]
): ShareChecklistItem[] => {
  const uniqueFields = Array.from(new Set(missingFields));
  const items: ShareChecklistItem[] = [];

  uniqueFields.forEach((field) => {
    const label = EMPLOYMENT_FIELD_LABELS[field];
    if (!label) {
      return;
    }

    items.push({
      id: `employmentInfo.${field}`,
      label,
      href: SHARE_SECTION_LINKS.employmentInfo,
      section: 'employmentInfo',
    });
  });

  return items;
};

export const buildShareChecklistFromIssues = (
  issues: ShareReadinessIssue[]
): ShareChecklistItem[] => {
  const checklist: ShareChecklistItem[] = [];

  issues.forEach((issue) => {
    if (issue.section === 'employmentInfo') {
      checklist.push(...createEmploymentChecklistItems(issue.missingFields));
      return;
    }

    if (issue.section === 'creditScore') {
      checklist.push({
        id: 'creditScore',
        label: 'Add your current credit score',
        href: SHARE_SECTION_LINKS.creditScore,
        section: 'creditScore',
      });
      return;
    }

    if (issue.section === 'maxRent') {
      checklist.push({
        id: 'maxRent',
        label: 'Set your maximum rent budget',
        href: SHARE_SECTION_LINKS.maxRent,
        section: 'maxRent',
      });
    }
  });

  return checklist;
};

export const getShareReadinessSummary = (
  profile?: TenantProfile | null
): ShareReadinessSummary => {
  const evaluation = evaluateShareReadiness(profile);
  const checklist = buildShareChecklistFromIssues(evaluation.issues);

  return {
    ...evaluation,
    checklist,
  };
};

export const canShareRentCardProfile = (
  profile?: TenantProfile | null
): boolean => getShareReadinessSummary(profile).isReady;

export const isShareReadinessMissing = (
  profile?: TenantProfile | null
): boolean => !getShareReadinessSummary(profile).isReady;

export type { ShareReadinessIssue, ShareReadinessSection };
