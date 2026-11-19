import type { z } from "zod";

/**
 * Validation outcome with explicit, privacy-safe issues. Issues carry only a
 * code, a path, and a message; the rejected input value is never included.
 * Invalid input is reported, never converted to unknown or a default.
 */
export type ValidationIssue = {
  readonly code: string;
  readonly path: readonly string[];
  readonly message: string;
};

export type ValidationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

export function validateWith<S extends z.ZodType>(
  schema: S,
  raw: unknown,
): ValidationResult<z.output<S>> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => ({
      code: issue.code,
      path: issue.path.map((segment) => String(segment)),
      message: issue.message,
    })),
  };
}
