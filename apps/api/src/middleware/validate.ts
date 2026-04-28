import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/HttpErrors';

export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError(result.error.flatten()));
    }
    req.body = result.data as unknown;
    next();
  };
}
