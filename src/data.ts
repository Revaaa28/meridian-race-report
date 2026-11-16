/**
 * Meridian Marathon 2026 — the raw timing export.
 *
 * This is all the kit is given: cumulative chip times and heart rate at
 * each timing mat, exactly as a timing provider would export them.
 * Every number printed in the report — paces, zones, badges, the
 * analysis sentences — is computed from these rows by src/stats.ts.
 * Nothing in the templates is hard-coded.
 */

export const race = {
  name: "MERIDIAN MARATHON",
  edition: "4th edition",
  date: "Sunday, 12 October 2026",
  distanceKm: 42.195,
  finishers: "12,408",
  conditions: "11°C at the start, light north wind, dry",
  site: "meridianmarathon.example",
} as const;

/** Timing mats, in km. The half sits at 21.0975. */
export const checkpointsKm = [5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195];

export interface Athlete {
  slug: string;
  name: string;
  bib: string;
  country: string;
  ageGroup: string;
  maxHr: number;
  /** Personal best before this race, in seconds. Null = marathon debut. */
  pbSeconds: number | null;
  /** Last year's Meridian finish, in seconds. Null = first time here. */
  lastYearSeconds: number | null;
  /** Cumulative chip time (seconds) at each checkpoint in checkpointsKm. */
  splitsSeconds: number[];
  /** Average heart rate (bpm) over the segment ending at each checkpoint. */
  segmentHr: number[];
}

export const athletes: Athlete[] = [
  {
    slug: "lindqvist",
    name: "Sarah Lindqvist",
    bib: "1042",
    country: "SWE",
    ageGroup: "F35–39",
    maxHr: 188,
    pbSeconds: 10791, // 2:59:51
    lastYearSeconds: 11052, // 3:04:12
    splitsSeconds: [1310, 2590, 3850, 5375, 6342, 7572, 8792, 10002, 10524],
    segmentHr: [148, 152, 156, 158, 161, 163, 166, 169, 174],
  },
  {
    slug: "okafor",
    name: "Daniel Okafor",
    bib: "2217",
    country: "GBR",
    ageGroup: "M40–44",
    maxHr: 184,
    pbSeconds: 11380, // 3:09:40
    lastYearSeconds: null,
    splitsSeconds: [1340, 2660, 3970, 5574, 6627, 8037, 9562, 11152, 11876],
    segmentHr: [150, 156, 160, 163, 167, 171, 174, 172, 170],
  },
  {
    slug: "tanaka",
    name: "Mika Tanaka",
    bib: "0873",
    country: "JPN",
    ageGroup: "F18–24",
    maxHr: 196,
    pbSeconds: null, // debut
    lastYearSeconds: null,
    splitsSeconds: [1410, 2810, 4215, 5917, 7009, 8404, 9809, 11209, 11819],
    segmentHr: [158, 160, 161, 162, 163, 164, 165, 166, 168],
  },
];
