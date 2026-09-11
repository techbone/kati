/**
 * CONTRACT — FROZEN after M0.
 * Changes require agreement from all three track owners. See docs/ARCHITECTURE.md.
 *
 * Primitive value types shared across every layer.
 */

/** Calendar date, always `YYYY-MM-DD`, always interpreted in the device's local timezone. */
export type ISODate = string & { readonly __brand: 'ISODate' };

/** Full instant, `YYYY-MM-DDTHH:mm:ss.sssZ`. Used only for audit fields. */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

export type ChildId = string & { readonly __brand: 'ChildId' };

/** Stable identifier for one dose in the national schedule, e.g. `penta-1`. */
export type DoseId = string & { readonly __brand: 'DoseId' };

/** Stable identifier for a vaccine, e.g. `penta`. */
export type VaccineId = string & { readonly __brand: 'VaccineId' };

/** Stable identifier for a clinic visit in the schedule, e.g. `week-6`. */
export type VisitId = string & { readonly __brand: 'VisitId' };

export const asISODate = (v: string): ISODate => v as ISODate;
export const asISOTimestamp = (v: string): ISOTimestamp => v as ISOTimestamp;
export const asChildId = (v: string): ChildId => v as ChildId;
export const asDoseId = (v: string): DoseId => v as DoseId;
export const asVaccineId = (v: string): VaccineId => v as VaccineId;
export const asVisitId = (v: string): VisitId => v as VisitId;
