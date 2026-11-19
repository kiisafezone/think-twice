import { describe, expect, it } from "vitest";
import {
  createDecisionHistoryStore,
  DECISION_HISTORY_KEY,
  type StoragePort,
} from "../../src/features/history/storage/local-decision-history";

class MemoryStorage implements StoragePort {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const record = {
  id: "decision-1",
  createdAt: "2026-11-20T10:00:00.000Z",
  itemName: "Laptop kerja",
  category: "Elektronik",
  ruleVersion: "v1",
  outcome: "wait_and_reassess" as const,
  affordabilityStatus: "unavailable" as const,
  affordabilityScore: null,
  rationalityStatus: "calculated" as const,
  rationalityScore: 45,
  decisiveReason: "Sebagian informasi penting belum tersedia.",
  supportingFactors: [],
  nextSteps: ["Lengkapi informasi yang belum tersedia."],
  missingFields: [{
    assessment: "affordability" as const,
    field: "financialProfile.availableCash",
    whyItMatters: "Kas tersedia diperlukan.",
  }],
};

describe("local decision history storage", () => {
  it("starts with an empty history", () => {
    const store = createDecisionHistoryStore(new MemoryStorage());
    expect(store.read()).toEqual({ status: "ok", records: [] });
  });

  it("saves only the validated summary and reads it back", () => {
    const storage = new MemoryStorage();
    const store = createDecisionHistoryStore(storage);

    expect(store.save(record)).toEqual({ status: "ok", records: [record] });
    expect(store.read()).toEqual({ status: "ok", records: [record] });

    const persisted = storage.getItem(DECISION_HISTORY_KEY);
    expect(persisted).not.toContain("income");
    expect(persisted).not.toContain("availableCash");
    expect(persisted).not.toContain("monthlyInstallment");
  });

  it("replaces a record with the same id instead of duplicating it", () => {
    const store = createDecisionHistoryStore(new MemoryStorage());
    store.save(record);
    const updated = { ...record, outcome: "safe_to_buy" as const };

    const result = store.save(updated);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.records).toHaveLength(1);
      expect(result.records[0].outcome).toBe("safe_to_buy");
    }
  });

  it("deletes one record and clears all records", () => {
    const store = createDecisionHistoryStore(new MemoryStorage());
    store.save(record);
    store.save({ ...record, id: "decision-2" });

    const removed = store.remove("decision-1");
    expect(removed.status).toBe("ok");
    if (removed.status === "ok") expect(removed.records.map((entry) => entry.id)).toEqual(["decision-2"]);

    expect(store.clear()).toEqual({ status: "ok", records: [] });
    expect(store.read()).toEqual({ status: "ok", records: [] });
  });

  it("does not overwrite corrupted history", () => {
    const storage = new MemoryStorage();
    storage.setItem(DECISION_HISTORY_KEY, "{not-json");
    const store = createDecisionHistoryStore(storage);

    expect(store.read()).toEqual({ status: "corrupt", records: [] });
    expect(store.save(record)).toEqual({ status: "corrupt", records: [] });
    expect(storage.getItem(DECISION_HISTORY_KEY)).toBe("{not-json");
  });

  it("rejects invalid records", () => {
    const store = createDecisionHistoryStore(new MemoryStorage());
    expect(store.save({ ...record, affordabilityScore: 101 })).toEqual({
      status: "invalid_record",
      records: [],
    });
  });

  it("reports storage failures instead of claiming success", () => {
    const brokenStorage: StoragePort = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
      removeItem() { throw new Error("blocked"); },
    };
    const store = createDecisionHistoryStore(brokenStorage);

    expect(store.read()).toEqual({ status: "unavailable", records: [] });
    expect(store.save(record)).toEqual({ status: "unavailable", records: [] });
    expect(store.clear()).toEqual({ status: "unavailable", records: [] });
  });
});
