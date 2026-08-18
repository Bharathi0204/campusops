export interface CourseInput {
  code: string;
  name: string;
  credits: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const validateCourse = (
  data: Partial<CourseInput>
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Course code
  if (typeof data.code !== 'string' || data.code.trim() === '') {
    errors.code = 'Course code is required.';
  } else if (data.code.trim().length > 20) {
    errors.code = 'Course code must not exceed 20 characters.';
  }

  // Course name
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.name = 'Course name is required.';
  } else if (data.name.trim().length > 150) {
    errors.name = 'Course name must not exceed 150 characters.';
  }

  // Credits
  if (
    typeof data.credits !== 'number' ||
    !Number.isInteger(data.credits)
  ) {
    errors.credits = 'Credits must be a whole number.';
  } else if (data.credits <= 0) {
    errors.credits = 'Credits must be greater than 0.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};