import { type ZodSchema } from 'zod';

export const toFormikValidate =
  <T extends Record<string, unknown>>(schema: ZodSchema) =>
  (values: T): Partial<Record<string, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !(key in errors)) {
        errors[key] = issue.message;
      }
    }
    return errors;
  };
