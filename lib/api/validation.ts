// lib/api/validation.ts
import { ApiException } from './utils';

type ValidationSchema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validate?: (value: any) => boolean;
  }
};

export const validateInput = <T>(data: any, schema: ValidationSchema): T => {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    // Check required fields
    if (rules.required && (data[field] === undefined || data[field] === null)) {
      errors.push(`'${field}' is required`);
      continue;
    }

    // Skip validation for non-required undefined fields
    if (data[field] === undefined) {
      continue;
    }

    // Type validation
    const valueType = Array.isArray(data[field]) ? 'array' : typeof data[field];
    if (valueType !== rules.type) {
      errors.push(`'${field}' must be of type ${rules.type}`);
    }

    // Min/max validation for strings and arrays
    if ((rules.type === 'string' || rules.type === 'array') && data[field]) {
      if (rules.min !== undefined && data[field].length < rules.min) {
        errors.push(`'${field}' must be at least ${rules.min} characters long`);
      }
      if (rules.max !== undefined && data[field].length > rules.max) {
        errors.push(`'${field}' must be at most ${rules.max} characters long`);
      }
    }

    // Min/max validation for numbers
    if (rules.type === 'number') {
      if (rules.min !== undefined && data[field] < rules.min) {
        errors.push(`'${field}' must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && data[field] > rules.max) {
        errors.push(`'${field}' must be at most ${rules.max}`);
      }
    }

    // Pattern validation for strings
    if (rules.type === 'string' && rules.pattern && !rules.pattern.test(data[field])) {
      errors.push(`'${field}' has an invalid format`);
    }

    // Custom validation
    if (rules.validate && !rules.validate(data[field])) {
      errors.push(`'${field}' is invalid`);
    }
  }

  if (errors.length > 0) {
    throw new ApiException(400, 'Validation error', errors);
  }

  return data as T;
};