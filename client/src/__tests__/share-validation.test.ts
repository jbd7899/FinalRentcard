import { describe, expect, it } from 'vitest';
import { evaluateShareReadiness } from '@shared/share-validation';
import type { TenantProfile } from '@shared/schema';

describe('evaluateShareReadiness', () => {
  it('identifies all sections as missing when profile is absent', () => {
    const result = evaluateShareReadiness(null);

    expect(result.isReady).toBe(false);
    const employmentIssue = result.issues.find((issue) => issue.section === 'employmentInfo');
    expect(employmentIssue).toBeDefined();
    expect(employmentIssue?.missingFields).toEqual([
      'employer',
      'position',
      'monthlyIncome',
      'startDate',
    ]);
    expect(result.issues.map((issue) => issue.section)).toContain('creditScore');
    expect(result.issues.map((issue) => issue.section)).toContain('maxRent');
  });

  it('returns precise employment field guidance when some details are missing', () => {
    const profile = {
      id: 1,
      userId: 'tenant-1',
      employmentInfo: JSON.stringify({
        employer: 'Acme Co.',
        position: '',
        monthlyIncome: '0',
        startDate: '',
      }),
      creditScore: '710',
      maxRent: '1800',
      moveInDate: null,
      rentalHistory: null,
    } as unknown as TenantProfile;

    const result = evaluateShareReadiness(profile);

    expect(result.isReady).toBe(false);
    const employmentIssue = result.issues.find((issue) => issue.section === 'employmentInfo');
    expect(employmentIssue).toBeDefined();
    expect(employmentIssue?.missingFields).toEqual(['position', 'monthlyIncome', 'startDate']);
    expect(result.issues.some((issue) => issue.section === 'creditScore')).toBe(false);
    expect(result.issues.some((issue) => issue.section === 'maxRent')).toBe(false);
  });

  it('flags financial fields when credit score or rent budget are insufficient', () => {
    const profile = {
      id: 2,
      userId: 'tenant-2',
      employmentInfo: {
        employer: 'Contoso',
        position: 'Designer',
        monthlyIncome: 4200,
        startDate: '2022-09-15',
      },
      creditScore: 250,
      maxRent: 0,
      moveInDate: null,
      rentalHistory: null,
    } as unknown as TenantProfile;

    const result = evaluateShareReadiness(profile);

    expect(result.isReady).toBe(false);
    expect(result.issues.some((issue) => issue.section === 'creditScore')).toBe(true);
    expect(result.issues.some((issue) => issue.section === 'maxRent')).toBe(true);
    const employmentIssue = result.issues.find((issue) => issue.section === 'employmentInfo');
    expect(employmentIssue).toBeUndefined();
  });

  it('returns ready status when all prerequisite fields are satisfied', () => {
    const profile = {
      id: 3,
      userId: 'tenant-3',
      employmentInfo: {
        employer: 'Globex',
        position: 'Engineer',
        monthlyIncome: 5200,
        startDate: '2021-05-01',
      },
      creditScore: 720,
      maxRent: 2400,
      moveInDate: null,
      rentalHistory: {
        previousAddresses: [],
      },
    } as unknown as TenantProfile;

    const result = evaluateShareReadiness(profile);

    expect(result.isReady).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
