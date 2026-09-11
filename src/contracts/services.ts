/**
 * CONTRACT — FROZEN after M0.
 *
 * Platform boundaries. Every native side effect sits behind one of these so
 * domain code stays pure and tests never touch Expo modules.
 * Track C owns the real implementations in `src/services/`.
 */
import type { Child } from './models';
import type { ReminderPlan } from './reminders';
import type { ScheduleItem, ScheduleSummary } from './schedule';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export interface NotificationService {
  getPermission(): Promise<PermissionState>;
  requestPermission(): Promise<PermissionState>;
  /** Replaces ALL scheduled reminders with this plan. Idempotent. */
  sync(plan: ReminderPlan): Promise<void>;
  cancelAll(): Promise<void>;
  /** For the diagnostics screen. */
  getScheduledCount(): Promise<number>;
}

export interface PurchasePackage {
  identifier: string;
  priceString: string;
  title: string;
  description: string;
  /** e.g. '7 days'. Null when the package has no introductory trial. */
  trialPeriod: string | null;
}

export type PurchaseResult = 'purchased' | 'cancelled' | 'pending' | 'error';

export interface PurchaseService {
  init(): Promise<void>;
  isPremium(): boolean;
  /** Fires whenever entitlement changes. Returns an unsubscribe fn. */
  onEntitlementChange(cb: (isPremium: boolean) => void): () => void;
  getPackages(): Promise<PurchasePackage[]>;
  purchase(packageIdentifier: string): Promise<PurchaseResult>;
  restore(): Promise<boolean>;
}

export interface RecordExportInput {
  child: Child;
  items: ScheduleItem[];
  summary: ScheduleSummary;
  scheduleSource: string;
  generatedAt: Date;
}

export interface ExportService {
  /** Pure-ish: builds the printable HTML. Unit-testable without native modules. */
  buildHtml(input: RecordExportInput): string;
  /** Renders to PDF and opens the share sheet. */
  sharePdf(input: RecordExportInput): Promise<void>;
}

export interface BackupService {
  /** Serialises all children, records and prefs to a JSON string. */
  export(): Promise<string>;
  /** Replaces local data with the contents of a backup. Validates before writing. */
  import(json: string): Promise<{ children: number; records: number }>;
  shareBackupFile(): Promise<void>;
}
