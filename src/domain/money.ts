import { z } from "zod";

/**
 * Money is stored as whole Rupiah (IDR) in the JavaScript safe-integer range.
 * Floating-point money is never accepted. See docs/architecture/DOMAIN_MODEL.md.
 */

/** Non-negative whole Rupiah. Used for every user-entered money input. */
export const rupiahSchema = z
  .number()
  .int()
  .min(0)
  .refine((value) => Number.isSafeInteger(value), "unsafe_integer")
  .brand<"Rupiah">();
export type Rupiah = z.infer<typeof rupiahSchema>;

/**
 * Signed whole Rupiah. Reserved for derived metrics that may legitimately be
 * negative, such as monthly free cash. It is never an accepted user input.
 */
export const signedRupiahSchema = z
  .number()
  .int()
  .refine((value) => Number.isSafeInteger(value), "unsafe_integer")
  .brand<"SignedRupiah">();
export type SignedRupiah = z.infer<typeof signedRupiahSchema>;

/**
 * Add two non-negative Rupiah amounts without allowing an unsafe integer.
 * The branded inputs are validated user/domain amounts; the runtime guard
 * also protects callers that bypass TypeScript.
 */
export function addRupiah(left: Rupiah, right: Rupiah): Rupiah {
  if (
    !Number.isSafeInteger(left) ||
    !Number.isSafeInteger(right) ||
    left < 0 ||
    right < 0
  ) {
    throw new RangeError("invalid_rupiah_operand");
  }

  const sum = left + right;
  if (!Number.isSafeInteger(sum)) {
    throw new RangeError("rupiah_overflow");
  }

  return sum as Rupiah;
}
