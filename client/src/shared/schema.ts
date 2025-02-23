import { z } from 'zod';
import { VALIDATION } from '@/constants';

// Helper function for string-to-number conversion with validation
const stringToNumber = (min: number, max?: number, message?: string) =>
  z.string()
    .transform((val) => Number(val))
    .refine(
      (num) => !isNaN(num) && num >= min && (max === undefined || num <= max),
      { message: message }
    );

export const insertRentCardSchema = z.object({
  firstName: z.string().min(VALIDATION.RENTCARD.NAME.MIN_LENGTH, VALIDATION.RENTCARD.NAME.MESSAGE),
  lastName: z.string().min(VALIDATION.RENTCARD.NAME.MIN_LENGTH, VALIDATION.RENTCARD.NAME.MESSAGE),
  email: z.string().email(VALIDATION.EMAIL.MESSAGE),
  phone: z.string()
    .min(VALIDATION.PHONE.MIN_LENGTH, VALIDATION.PHONE.MESSAGE)
    .regex(VALIDATION.PHONE.REGEX, VALIDATION.PHONE.REGEX_MESSAGE),
  hasPets: z.boolean(),
  currentEmployer: z.string().min(VALIDATION.RENTCARD.EMPLOYER.MIN_LENGTH, VALIDATION.RENTCARD.EMPLOYER.MESSAGE),
  yearsEmployed: stringToNumber(
    VALIDATION.RENTCARD.YEARS_EMPLOYED.MIN,
    VALIDATION.RENTCARD.YEARS_EMPLOYED.MAX,
    VALIDATION.RENTCARD.YEARS_EMPLOYED.MESSAGE
  ),
  monthlyIncome: stringToNumber(
    VALIDATION.RENTCARD.INCOME.MIN,
    undefined,
    VALIDATION.RENTCARD.INCOME.MESSAGE
  ),
  currentAddress: z.string().min(VALIDATION.RENTCARD.ADDRESS.MIN_LENGTH, VALIDATION.RENTCARD.ADDRESS.MESSAGE),
  currentRent: stringToNumber(
    VALIDATION.RENTCARD.RENT.MIN,
    undefined,
    VALIDATION.RENTCARD.RENT.MESSAGE
  ),
  moveInDate: z.string(),
  maxRent: stringToNumber(
    VALIDATION.RENTCARD.RENT.MIN,
    undefined,
    VALIDATION.RENTCARD.RENT.MESSAGE
  ),
  hasRoommates: z.boolean(),
  creditScore: stringToNumber(
    VALIDATION.RENTCARD.CREDIT_SCORE.MIN,
    VALIDATION.RENTCARD.CREDIT_SCORE.MAX,
    VALIDATION.RENTCARD.CREDIT_SCORE.MESSAGE
  ),
});

export type InsertRentCard = z.input<typeof insertRentCardSchema>;
export type InsertRentCardOutput = z.output<typeof insertRentCardSchema>;

export const insertScreeningPageSchema = z.object({
  businessName: z.string().min(VALIDATION.SCREENING.BUSINESS_NAME.MIN_LENGTH, VALIDATION.SCREENING.BUSINESS_NAME.MESSAGE),
  contactName: z.string().min(VALIDATION.SCREENING.CONTACT_NAME.MIN_LENGTH, VALIDATION.SCREENING.CONTACT_NAME.MESSAGE),
  businessEmail: z.string().email(VALIDATION.EMAIL.MESSAGE),
  screeningCriteria: z.object({
    minCreditScore: z.number()
      .min(VALIDATION.SCREENING.CREDIT_SCORE.MIN)
      .max(VALIDATION.SCREENING.CREDIT_SCORE.MAX)
      .default(650),
    minMonthlyIncome: z.number()
      .min(VALIDATION.SCREENING.MONTHLY_INCOME.MIN)
      .default(3000),
    noEvictions: z.boolean().default(true),
    cleanRentalHistory: z.boolean().default(true),
  }),
});

export type InsertScreeningPage = z.infer<typeof insertScreeningPageSchema>; 