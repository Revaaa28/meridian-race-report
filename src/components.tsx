import { Column, Rect, Row, Svg, Text } from "@hyper-elements/react";
import type { Athlete } from "./data";
import { fastestSegment, hrZones, paceScale, segments, slowestSegment } from "./stats";
import { ink, mono, paper, signal, slate, teal, zoneColors } from "./theme";

/**
 * Charts and blocks shared by the report and the finisher card.
 * Every chart is drawn from the computed segments — the Svg is a
 * picture of the data, not decoration.
 */

/**
 * The shape of the race: one bar per timing segment, bar width
 * proportional to the segment's distance, height to its pace (taller =
 * slower). Fastest segment in teal, slowest in signal red, the half-way
 * mat marked with a hairline.
 */
export function PaceChart({ a, width = 648, height = 200 }: { a: Athlete; width?: number; height?: number }) {
  const segs = segments(a);
  const fast = fastestSegment(a);
  const slow = slowestSegment(a);
  const { min, max } = paceScale(segs.map((s) => s.paceSecPerKm));
  const baseline = height - 8;
  const halfX = (21.0975 / 42.195) * width;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {segs.map((s) => {
        const x = (s.fromKm / 42.195) * width;
        const w = (s.distKm / 42.195) * width - 3;
        const h = 24 + ((s.paceSecPerKm - min) / (max - min)) * (height - 60);
        const fill = s.toKm === fast.toKm ? teal : s.toKm === slow.toKm ? signal : ink;
        return <Rect key={s.toKm} x={x} y={baseline - h} width={w} height={h} style={{ fill }} />;
      })}
      <Rect x={halfX} y={0} width={1.5} height={baseline} style={{ fill: slate, opacity: 0.45 }} />
      <Rect x={0} y={baseline} width={width} height={2} style={{ fill: ink }} />
    </Svg>
  );
}

/** Time-in-zone as one stacked bar, widths proportional to seconds. */
export function ZoneBar({ a, width = 648, height = 32 }: { a: Athlete; width?: number; height?: number }) {
  const zones = hrZones(a);
  let x = 0;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {zones.map((z, i) => {
        const w = (z.pct / 100) * width;
        const rect = <Rect key={z.zone} x={x} y={0} width={Math.max(w - 2, 0)} height={height} style={{ fill: zoneColors[i] }} />;
        x += w;
        return rect;
      })}
    </Svg>
  );
}

/** A pill that only exists when the data earns it (PB, negative split…). */
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <Column style={{ backgroundColor: color, borderRadius: 999, padding: [6, 13] }}>
      <Text style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: paper }}>
        {label}
      </Text>
    </Column>
  );
}

export function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Column style={{ gap: 2, flex: 1 }}>
      <Text style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: slate }}>{label}</Text>
      <Text style={{ fontSize: 23, fontWeight: 900, color: ink }}>{value}</Text>
      {sub ? <Text style={{ fontSize: 11, color: slate }}>{sub}</Text> : null}
    </Column>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Row stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
      <Column style={{ width: 5, height: 18, backgroundColor: signal }} />
      <Text style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: ink }}>{children}</Text>
    </Row>
  );
}
