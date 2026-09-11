/**
 * In-memory implementation of the AppStore contract.
 *
 * Track B builds every screen against this while Track A builds the real
 * SQLite-backed store. When Track A lands, Track B changes exactly one import
 * and nothing else — if a screen needs a change at that point, the contract
 * was wrong and we fix the contract, not the screen.
 */
import { create } from 'zustand';

import {
  asChildId,
  asISOTimestamp,
  type AppStore,
  type Child,
  type DoseRecord,
  type ISODate,
  type Prefs,
} from '@/contracts';

const DEFAULT_PREFS: Prefs = {
  reminders: { enabled: true, hour: 8, minute: 0, leadDays: [7, 1, 0] },
  onboarded: false,
  scheduleVersion: 'PLACEHOLDER-0',
};

const now = () => asISOTimestamp(new Date().toISOString());

export const useMockStore = create<AppStore>((set, get) => ({
  hydrated: false,
  children: [],
  activeChildId: null,
  recordsByChild: {},
  prefs: DEFAULT_PREFS,
  isPremium: false,

  async hydrate() {
    set({ hydrated: true });
  },

  async addChild(input) {
    const id = asChildId(`child-${Date.now()}`);
    const child: Child = {
      id,
      name: input.name,
      birthDate: input.birthDate,
      sex: input.sex,
      photoUri: input.photoUri ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => ({
      children: [...s.children, child],
      activeChildId: s.activeChildId ?? id,
      recordsByChild: { ...s.recordsByChild, [id]: [] },
    }));
    return id;
  },

  async updateChild(id, patch) {
    set((s) => ({
      children: s.children.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now() } : c)),
    }));
  },

  async deleteChild(id) {
    set((s) => {
      const children = s.children.filter((c) => c.id !== id);
      const { [id]: _removed, ...rest } = s.recordsByChild;
      return {
        children,
        recordsByChild: rest,
        activeChildId: s.activeChildId === id ? (children[0]?.id ?? null) : s.activeChildId,
      };
    });
  },

  async setActiveChild(id) {
    set({ activeChildId: id });
  },

  async markGiven(childId, doseId, givenDate: ISODate, note) {
    upsertRecord(set, get, {
      childId,
      doseId,
      status: 'given',
      givenDate,
      note: note ?? null,
      updatedAt: now(),
    });
  },

  async markSkipped(childId, doseId, note) {
    upsertRecord(set, get, {
      childId,
      doseId,
      status: 'skipped',
      givenDate: null,
      note: note ?? null,
      updatedAt: now(),
    });
  },

  async clearRecord(childId, doseId) {
    set((s) => ({
      recordsByChild: {
        ...s.recordsByChild,
        [childId]: (s.recordsByChild[childId] ?? []).filter((r) => r.doseId !== doseId),
      },
    }));
  },

  async setPrefs(patch) {
    set((s) => ({ prefs: { ...s.prefs, ...patch } }));
  },

  setPremium(isPremium) {
    set({ isPremium });
  },

  async refreshReminders() {
    // No-op in the mock. Track C wires the real scheduler in M3.
  },
}));

type Setter = (fn: (s: AppStore) => Partial<AppStore>) => void;

function upsertRecord(set: Setter, get: () => AppStore, record: DoseRecord) {
  const existing = get().recordsByChild[record.childId] ?? [];
  const next = existing.some((r) => r.doseId === record.doseId)
    ? existing.map((r) => (r.doseId === record.doseId ? record : r))
    : [...existing, record];
  set((s) => ({ recordsByChild: { ...s.recordsByChild, [record.childId]: next } }));
}
