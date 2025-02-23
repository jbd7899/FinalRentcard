import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { InsertRentCard } from '@shared/schema';

interface RentCardState {
  step: number;
  formData: Partial<InsertRentCard>;
  validation: {
    errors: Record<string, string>;
    isValid: boolean;
  };
}

interface RentCardActions {
  setStep: (step: number) => void;
  setFormData: (data: Partial<InsertRentCard>) => void;
  updateField: <K extends keyof InsertRentCard>(field: K, value: InsertRentCard[K]) => void;
  validateStep: (step: number) => boolean;
  reset: () => void;
}

const initialState: RentCardState = {
  step: 1,
  formData: {},
  validation: {
    errors: {},
    isValid: false
  }
};

export const useRentCardStore = create<RentCardState & RentCardActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setStep: (step) => set(
          { step },
          false,
          'rentCard/setStep'
        ),

        setFormData: (data) => set(
          { formData: data },
          false,
          'rentCard/setFormData'
        ),

        updateField: (field, value) => set(
          (state) => ({
            formData: { ...state.formData, [field]: value }
          }),
          false,
          'rentCard/updateField'
        ),

        validateStep: (step) => {
          const state = get();
          const stepFields = {
            1: ['firstName', 'lastName', 'email', 'phone', 'hasPets'],
            2: ['currentAddress', 'currentRent', 'hasRoommates'],
            3: ['currentEmployer', 'yearsEmployed', 'monthlyIncome', 'maxRent', 'moveInDate', 'creditScore']
          } as const;
          
          const currentStepFields = stepFields[step as keyof typeof stepFields] || [];
          const errors: Record<string, string> = {};
          
          currentStepFields.forEach((field) => {
            if (!state.formData[field]) {
              errors[field] = `${field} is required`;
            }
          });

          set(
            { validation: { errors, isValid: Object.keys(errors).length === 0 } },
            false,
            'rentCard/validateStep'
          );

          return Object.keys(errors).length === 0;
        },

        reset: () => set(
          initialState,
          false,
          'rentCard/reset'
        ),
      }),
      {
        name: 'rentcard-storage',
        partialize: (state) => ({ formData: state.formData }),
      }
    )
  )
); 