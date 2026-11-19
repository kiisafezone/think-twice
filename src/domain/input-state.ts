import { z } from "zod";

/**
 * Explicit input states. Missing, unknown, and not-applicable values are never
 * coerced to zero or to a default. A blank value is NOT an input state: raw
 * null, undefined, or an empty string fails validation instead of becoming
 * `unknown`. A confirmed zero is `{ status: "known", value: 0 }`.
 *
 * `invalid` is deliberately not a state here. Invalid input is a validation
 * result (see validation.ts).
 */

export const INPUT_STATUSES = ["known", "unknown", "not_applicable"] as const;
export type InputStatus = (typeof INPUT_STATUSES)[number];

export type Known<T> = { readonly status: "known"; readonly value: T };
export type Unknown = { readonly status: "unknown" };
export type NotApplicable = { readonly status: "not_applicable" };

/** known | unknown. For required inputs where not-applicable has no approved meaning. */
export type RequiredInput<T> = Known<T> | Unknown;
/** known | unknown | not_applicable. */
export type InputState<T> = Known<T> | Unknown | NotApplicable;

export function knownSchema<T extends z.ZodType>(value: T) {
  return z.strictObject({ status: z.literal("known"), value });
}

export const unknownSchema = z.strictObject({ status: z.literal("unknown") });

export const notApplicableSchema = z.strictObject({
  status: z.literal("not_applicable"),
});

/** Schema for known | unknown | not_applicable. */
export function inputStateSchema<T extends z.ZodType>(value: T) {
  return z.discriminatedUnion("status", [
    knownSchema(value),
    unknownSchema,
    notApplicableSchema,
  ]);
}

/** Schema for known | unknown. */
export function requiredInputSchema<T extends z.ZodType>(value: T) {
  return z.discriminatedUnion("status", [knownSchema(value), unknownSchema]);
}

export function isKnown<T>(input: InputState<T>): input is Known<T> {
  return input.status === "known";
}
