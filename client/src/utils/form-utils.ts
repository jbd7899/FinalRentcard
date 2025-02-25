/**
 * Utility functions for form handling
 */

/**
 * Converts string values to numbers for numeric fields
 * @param data Form data object
 * @param numericFields Array of field names that should be converted to numbers
 * @returns New object with converted values
 */
export function convertFormNumericValues<T>(
  data: T,
  numericFields: string[]
): T {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const result = { ...data } as T;
  
  numericFields.forEach((field) => {
    const value = (data as any)[field];
    if (value !== undefined && value !== null && value !== '') {
      (result as any)[field] = typeof value === 'string' ? parseInt(value, 10) : value;
    }
  });
  
  return result;
}

/**
 * Converts nested object string values to numbers
 * @param data Form data object
 * @param nestedFields Object mapping nested object keys to arrays of fields to convert
 * @returns New object with converted values
 */
export function convertNestedNumericValues<T>(
  data: T,
  nestedFields: Record<string, string[]>
): T {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const result = { ...data } as T;
  
  Object.entries(nestedFields).forEach(([objectKey, fields]) => {
    if ((result as any)[objectKey] && typeof (result as any)[objectKey] === 'object') {
      const nestedObject = { ...(result as any)[objectKey] };
      
      fields.forEach((field) => {
        const value = nestedObject[field];
        if (value !== undefined && value !== null && value !== '') {
          nestedObject[field] = typeof value === 'string' ? parseInt(value, 10) : value;
        }
      });
      
      (result as any)[objectKey] = nestedObject;
    }
  });
  
  return result;
}

/**
 * Validates specific fields in a form
 * @param form React Hook Form instance
 * @param fields Array of field names to validate
 * @returns Promise resolving to boolean indicating if validation passed
 */
export async function validateFormFields(
  form: any,
  fields: string[]
): Promise<boolean> {
  const result = await form.trigger(fields);
  return result;
}

/**
 * Validates nested fields in a form
 * @param form React Hook Form instance
 * @param nestedFields Object with nested field paths
 * @returns Boolean indicating if all fields are valid
 */
export function validateNestedFields(
  form: any,
  nestedFields: string[]
): boolean {
  return nestedFields.every(field => {
    if (field.includes('.')) {
      const [objectKey, fieldKey] = field.split('.');
      const values = form.getValues();
      return values[objectKey] && values[objectKey][fieldKey] !== undefined && values[objectKey][fieldKey] !== null;
    }
    return !!form.getValues()[field];
  });
} 