import { z } from "zod";
import { OUTCOMES } from "../../../domain/outcomes";

const savedDecisionSchema = z.strictObject({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  itemName: z.string().min(1),
  category: z.string().min(1),
  ruleVersion: z.string().min(1),
  outcome: z.enum(OUTCOMES),
  affordabilityStatus: z.enum(["calculated", "unavailable", "invalid"]),
  affordabilityScore: z.number().int().min(0).max(100).nullable(),
  rationalityStatus: z.enum(["calculated", "unavailable", "invalid"]),
  rationalityScore: z.number().int().min(0).max(100).nullable(),
  decisiveReason: z.string().min(1),
  supportingFactors: z.array(z.string()),
  nextSteps: z.array(z.string()),
  missingFields: z.array(z.strictObject({
    assessment: z.enum(["affordability", "rationality"]),
    field: z.string(),
    whyItMatters: z.string(),
  })),
});
const historySchema = z.strictObject({
  version: z.literal(1),
  records: z.array(savedDecisionSchema),
});

export type SavedDecision = z.infer<typeof savedDecisionSchema>;

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type HistoryReadResult =
  | { status: "ok"; records: SavedDecision[] }
  | { status: "corrupt" | "unavailable"; records: [] };

export type HistoryWriteResult =
  | { status: "ok"; records: SavedDecision[] }
  | { status: "corrupt" | "unavailable" | "invalid_record"; records: [] };

export const DECISION_HISTORY_KEY = "think-twice:decision-history:v1";

export function createDecisionHistoryStore(storage: StoragePort) {
  function read(): HistoryReadResult {
    try {
      const raw = storage.getItem(DECISION_HISTORY_KEY);
      if (raw === null) return { status: "ok", records: [] };
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        return { status: "corrupt", records: [] };
      }
      const parsed = historySchema.safeParse(parsedJson);
      return parsed.success
        ? { status: "ok", records: parsed.data.records }
        : { status: "corrupt", records: [] };
    } catch {
      return { status: "unavailable", records: [] };
    }
  }

  function save(record: SavedDecision): HistoryWriteResult {
    const validatedRecord = savedDecisionSchema.safeParse(record);
    if (!validatedRecord.success) return { status: "invalid_record", records: [] };
    const current = read();
    if (current.status !== "ok") return current;
    const records = [
      validatedRecord.data,
      ...current.records.filter((entry) => entry.id !== validatedRecord.data.id),
    ];
    try {
      storage.setItem(DECISION_HISTORY_KEY, JSON.stringify({ version: 1, records }));
      return { status: "ok", records };
    } catch {
      return { status: "unavailable", records: [] };
    }
  }

  function remove(id: string): HistoryWriteResult {
    const current = read();
    if (current.status !== "ok") return current;
    const records = current.records.filter((entry) => entry.id !== id);
    try {
      storage.setItem(DECISION_HISTORY_KEY, JSON.stringify({ version: 1, records }));
      return { status: "ok", records };
    } catch {
      return { status: "unavailable", records: [] };
    }
  }

  function clear(): HistoryWriteResult {
    try {
      storage.removeItem(DECISION_HISTORY_KEY);
      return { status: "ok", records: [] };
    } catch {
      return { status: "unavailable", records: [] };
    }
  }

  return { read, save, remove, clear };
}
