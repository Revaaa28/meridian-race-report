import { checkpointsKm, type Athlete } from "./data";

/**
 * The stats engine. Pure functions over the raw timing export: if a
 * number appears in the report, it was computed here — the templates
 * only format and draw.
 */

export interface Segment {
  fromKm: number;
  toKm: number;
  distKm: number;
  seconds: number;
  paceSecPerKm: number;
  hr: number;
}

export function segments(a: Athlete): Segment[] {
  return checkpointsKm.map((toKm, i) => {
    const fromKm = i === 0 ? 0 : checkpointsKm[i - 1];
    const prevTime = i === 0 ? 0 : a.splitsSeconds[i - 1];
    const seconds = a.splitsSeconds[i] - prevTime;
    const distKm = toKm - fromKm;
    return { fromKm, toKm, distKm, seconds, paceSecPerKm: seconds / distKm, hr: a.segmentHr[i] };
  });
}

export function finishSeconds(a: Athlete): number {
  return a.splitsSeconds[a.splitsSeconds.length - 1];
}

export function fmtTime(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

export function fmtPace(secPerKm: number): string {
  const s = Math.round(secPerKm);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtDelta(seconds: number): string {
  const sign = seconds < 0 ? "−" : "+";
  return `${sign}${fmtTime(Math.abs(seconds))}`;
}

export interface SplitStory {
  firstHalf: number;
  secondHalf: number;
  /** secondHalf − firstHalf: negative means a negative split. */
  delta: number;
  kind: "negative" | "positive" | "even";
}

export function splitStory(a: Athlete): SplitStory {
  const halfIdx = checkpointsKm.indexOf(21.0975);
  const firstHalf = a.splitsSeconds[halfIdx];
  const secondHalf = finishSeconds(a) - firstHalf;
  const delta = secondHalf - firstHalf;
  const kind = Math.abs(delta) <= 30 ? "even" : delta < 0 ? "negative" : "positive";
  return { firstHalf, secondHalf, delta, kind };
}

/** The finish time if the second half had been run at first-half pace. */
export function evenSplitEquivalent(a: Athlete): number {
  const { firstHalf } = splitStory(a);
  return (firstHalf / 21.0975) * 42.195;
}

export interface ZoneShare {
  zone: number;
  label: string;
  seconds: number;
  pct: number;
}

const zoneBounds = [0.7, 0.8, 0.87, 0.93, 1.01];
const zoneLabels = ["Recovery", "Aerobic", "Tempo", "Threshold", "VO2 max"];

export function hrZones(a: Athlete): ZoneShare[] {
  const segs = segments(a);
  const totals = [0, 0, 0, 0, 0];
  for (const seg of segs) {
    const frac = seg.hr / a.maxHr;
    const z = zoneBounds.findIndex((b) => frac < b);
    totals[z === -1 ? 4 : z] += seg.seconds;
  }
  const total = finishSeconds(a);
  return totals.map((seconds, i) => ({
    zone: i + 1,
    label: zoneLabels[i],
    seconds,
    pct: (seconds / total) * 100,
  }));
}

/**
 * The scale a pace chart should use. A metronome runner's segments sit
 * within a few seconds of each other; normalising to that raw range
 * would draw a flat race as a mountain range, so the scale never
 * spans less than 40 s/km.
 */
export function paceScale(paces: number[]): { min: number; max: number } {
  let min = Math.min(...paces);
  let max = Math.max(...paces);
  if (max - min < 40) {
    const mid = (min + max) / 2;
    min = mid - 20;
    max = mid + 20;
  }
  return { min: min - 4, max: max + 4 };
}

export function fastestSegment(a: Athlete): Segment {
  return segments(a).reduce((best, s) => (s.paceSecPerKm < best.paceSecPerKm ? s : best));
}

export function slowestSegment(a: Athlete): Segment {
  return segments(a).reduce((worst, s) => (s.paceSecPerKm > worst.paceSecPerKm ? s : worst));
}

export function avgHr(a: Athlete): number {
  const segs = segments(a);
  const weighted = segs.reduce((sum, s) => sum + s.hr * s.seconds, 0);
  return Math.round(weighted / finishSeconds(a));
}

/** True when this race beat the athlete's PB (debuts have no PB to beat). */
export function isPb(a: Athlete): boolean {
  return a.pbSeconds !== null && finishSeconds(a) < a.pbSeconds;
}

/** One or two plain-English sentences of analysis, composed from the numbers. */
export function analysis(a: Athlete): string[] {
  const story = splitStory(a);
  const fast = fastestSegment(a);
  const slow = slowestSegment(a);
  const out: string[] = [];

  if (story.kind === "negative") {
    out.push(
      `You ran the second half ${fmtTime(Math.abs(story.delta))} faster than the first — a negative split, ` +
        `and the surest sign the early patience was worth it. Your fastest segment came at ${fast.fromKm}–${fast.toKm} km ` +
        `(${fmtPace(fast.paceSecPerKm)}/km), deep into the race, when most of the field was slowing down.`,
    );
  } else if (story.kind === "positive") {
    const equiv = evenSplitEquivalent(a);
    out.push(
      `The first half cost you. You reached halfway in ${fmtTime(story.firstHalf)} but the second half took ` +
        `${fmtTime(story.secondHalf)} — ${fmtTime(story.delta)} slower. The fade concentrated at ${slow.fromKm}–${slow.toKm} km ` +
        `(${fmtPace(slow.paceSecPerKm)}/km). Held at first-half pace, the same fitness finishes in ${fmtTime(equiv)}: ` +
        `the engine is there, the pacing bill came due after 30 km.`,
    );
  } else {
    out.push(
      `Metronome racing: your two halves differ by just ${fmtTime(Math.abs(story.delta))}, and your fastest and slowest ` +
        `full segments are separated by only ${Math.round(slow.paceSecPerKm - fast.paceSecPerKm)} seconds per kilometre. ` +
        `Even pacing like this is a skill most marathoners never learn — it is also the platform bigger goals are built on.`,
    );
  }

  if (isPb(a)) {
    out.push(
      `This is a personal best by ${fmtTime(a.pbSeconds! - finishSeconds(a))}` +
        (a.lastYearSeconds
          ? `, and ${fmtTime(a.lastYearSeconds - finishSeconds(a))} faster than your Meridian race last year.`
          : "."),
    );
  } else if (a.pbSeconds === null) {
    out.push(
      `A marathon debut — and a disciplined one. This finish is now the mark every future race gets measured against.`,
    );
  } else {
    out.push(
      `${fmtTime(finishSeconds(a) - a.pbSeconds!)} outside your personal best of ${fmtTime(a.pbSeconds)}. ` +
        `The gap is pacing, not fitness: your first 15 km were run at PB pace.`,
    );
  }
  return out;
}

/** The next goal, derived from the shape of this race. */
export function nextGoal(a: Athlete): { headline: string; body: string } {
  const story = splitStory(a);
  const finish = finishSeconds(a);
  if (story.kind === "positive") {
    return {
      headline: `Target: ${fmtTime(evenSplitEquivalent(a))}`,
      body: "Run the first half 60–90 seconds slower and this finish is already yours — no extra fitness required. Practice the restraint in long runs: first 10 km deliberately easy, every time.",
    };
  }
  if (a.pbSeconds === null) {
    const target = Math.floor(finish * 0.97);
    return {
      headline: `Target: ${fmtTime(target)}`,
      body: "A debut this controlled usually has 3% in it within a year. Keep the even pacing, add one weekly session at goal pace, and let the second marathon be the brave one.",
    };
  }
  // The next round barrier below this finish — and if the finish sits
  // just above one (under two minutes), aim at the barrier beyond it.
  let target = Math.floor(finish / 300) * 300;
  if (finish - target < 120) target -= 300;
  return {
    headline: `Target: ${fmtTime(target)}`,
    body: "You closed faster than you started, which means the ceiling is higher than this result. A block of threshold work at your 30–35 km pace is where the next minutes live.",
  };
}
