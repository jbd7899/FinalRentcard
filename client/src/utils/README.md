# Form Utilities and Multi-Step Form Component

This directory contains utilities and components for handling forms in the application, with a focus on multi-step forms.

## Form Utilities (`form-utils.ts`)

The `form-utils.ts` file provides utility functions for handling form data, particularly for multi-step forms:

### `convertFormNumericValues<T>(data: T, numericFields: string[]): T`

Converts string values to numbers for specified fields in a form data object.

```typescript
import { convertFormNumericValues } from '@/utils/form-utils';

const formData = {
  name: 'John',
  age: '30',
  income: '5000'
};

const processedData = convertFormNumericValues(formData, ['age', 'income']);
// Result: { name: 'John', age: 30, income: 5000 }
```

### `convertNestedNumericValues<T>(data: T, nestedFields: Record<string, string[]>): T`

Converts string values to numbers for specified fields in nested objects within form data.

```typescript
import { convertNestedNumericValues } from '@/utils/form-utils';

const formData = {
  name: 'John',
  financials: {
    income: '5000',
    expenses: '3000'
  }
};

const processedData = convertNestedNumericValues(formData, {
  financials: ['income', 'expenses']
});
// Result: { name: 'John', financials: { income: 5000, expenses: 3000 } }
```

### `validateFormFields(form: any, fields: string[]): Promise<boolean>`

Validates specific fields in a form using React Hook Form's `trigger` method.

```typescript
import { validateFormFields } from '@/utils/form-utils';

const isValid = await validateFormFields(form, ['name', 'email']);
```

### `validateNestedFields(form: any, nestedFields: string[]): boolean`

Validates nested fields in a form, supporting dot notation for nested properties.

```typescript
import { validateNestedFields } from '@/utils/form-utils';

const isValid = validateNestedFields(form, ['user.name', 'user.email']);
```

## Multi-Step Form Component (`multi-step-form.tsx`)

The `MultiStepForm` component provides a reusable way to create multi-step forms with validation and navigation.

### Usage

```tsx
import { MultiStepForm, StepConfig } from '@/components/ui/multi-step-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define your form schema
const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18)
});

type FormData = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0
    }
  });

  const handleSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  const handleStepChange = (step: number) => {
    console.log('Step changed to:', step);
  };

  // Define your form steps
  const formSteps: StepConfig[] = [
    {
      fields: ['name'],
      component: <NameStep />,
      title: 'Personal Information',
      description: 'Enter your name'
    },
    {
      fields: ['email', 'age'],
      component: <ContactStep />,
      title: 'Contact Information',
      description: 'Enter your contact details'
    }
  ];

  return (
    <MultiStepForm
      steps={formSteps}
      form={form}
      onStepChange={handleStepChange}
      onSubmit={handleSubmit}
      isSubmitting={false}
      submitButtonText="Submit"
    />
  );
}
```

### Props

- `steps`: Array of step configurations
- `form`: React Hook Form instance
- `onStepChange`: Callback when step changes
- `onSubmit`: Callback when form is submitted
- `isSubmitting`: Boolean indicating if form is submitting
- `submitButtonText`: Text for the submit button
- `showProgressBar`: Boolean to show/hide progress bar
- `className`: Additional CSS classes

### Step Configuration

Each step is defined with a `StepConfig` object:

```typescript
interface StepConfig {
  fields: string[];        // Fields to validate in this step
  component: ReactNode;    // Component to render for this step
  title?: string;          // Optional title for the step
  description?: string;    // Optional description for the step
}
```

## Benefits

- **Consistent Form Handling**: Standardized approach to form validation and submission
- **Type Safety**: TypeScript integration for better type checking
- **Reusability**: Components and utilities can be reused across the application
- **Maintainability**: Centralized form logic makes it easier to maintain and update
- **User Experience**: Consistent UI for multi-step forms improves user experience 