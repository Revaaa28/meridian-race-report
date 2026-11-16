import { Canvas, Column, Row, Text } from "@hyper-elements/react";
import { athletes, race, type Athlete } from "./data";
import { fontFaces } from "./fonts";
import {
  avgHr,
  fastestSegment,
  finishSeconds,
  fmtDelta,
  fmtPace,
  fmtTime,
  isPb,
  paceScale,
  segments,
  slowestSegment,
  splitStory,
} from "./stats";
import { ink, meridian, mono, paper, signal, slate, teal } from "./theme";

const faintOnInk = "#9aa3ad";

/**
 * The finisher card — the square image runners actually post.
 *
 * Same athlete, same computed data as the PDF report: the pace bars
 * along the bottom are the race's segments (width = distance, height =
 * pace), with the fastest in teal and the slowest in signal red.
 */
/** With no athlete given, the card renders for the first athlete in
 *  the data file — that is what `hyper-elements check` renders. */
export default function FinisherCard({ a = athletes[0] }: { a?: Athlete }) {
  a = a ?? athletes[0];
  const segs = segments(a);
  const fast = fastestSegment(a);
  const slow = slowestSegment(a);
  const story = splitStory(a);
  const finish = finishSeconds(a);
  const { min, max } = paceScale(segs.map((s) => s.paceSecPerKm));

  return (
    <Canvas
      theme={meridian}
      width={1080}
      height={1080}
      lang="en"
      title={`Meridian Marathon finisher card — ${a.name}`}
      fonts={fontFaces}
      style={{ backgroundColor: ink }}
    >
      <Column style={{ height: 1080, padding: [64, 72, 0, 72], justifyContent: "space-between" }}>
        <Column style={{ gap: 40 }}>
          <Row stackOnMobile={false} style={{ alignItems: "start" }}>
            <Row stackOnMobile={false} style={{ gap: 7, flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.5, color: paper }}>MERIDIAN</Text>
              <Text style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.5, color: signal }}>MARATHON</Text>
            </Row>
            <Text style={{ fontFamily: mono, fontSize: 14, letterSpacing: 2, color: faintOnInk, textAlign: "right" }}>
              12 OCT 2026
            </Text>
          </Row>

          <Column style={{ gap: 6 }}>
            <Text style={{ fontSize: 54, fontWeight: 900, color: paper }}>{a.name}</Text>
            <Text style={{ fontFamily: mono, fontSize: 15, letterSpacing: 2, color: faintOnInk }}>
              BIB {a.bib} · {a.country} · {a.ageGroup}
            </Text>
          </Column>

          <Column style={{ gap: 4 }}>
            <Text style={{ apply: ["eyebrow"], color: signal, fontSize: 13 }}>Finish — chip time</Text>
            <Text style={{ fontSize: 168, fontWeight: 900, lineHeight: 1, color: paper }}>
              {fmtTime(finish)}
            </Text>
            <Row stackOnMobile={false} style={{ gap: 26, padding: [10, 0, 0, 0] }}>
              <Text style={{ fontFamily: mono, fontSize: 16, color: paper }}>
                PACE {fmtPace(finish / race.distanceKm)}/KM
              </Text>
              <Text style={{ fontFamily: mono, fontSize: 16, color: paper }}>HR {avgHr(a)} BPM</Text>
              <Text
                style={{
                  fontFamily: mono,
                  fontSize: 16,
                  color: story.kind === "positive" ? signal : teal,
                }}
              >
                SPLIT {fmtDelta(story.delta)}
              </Text>
              {isPb(a) ? (
                <Text style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: teal }}>
                  ★ PERSONAL BEST
                </Text>
              ) : null}
            </Row>
          </Column>
        </Column>

        <Column style={{ gap: 0 }}>
          <Row stackOnMobile={false} style={{ gap: 4, alignItems: "end", height: 150 }}>
            {segs.map((s) => {
              const h = 30 + ((s.paceSecPerKm - min) / (max - min || 1)) * 110;
              const fill = s.toKm === fast.toKm ? teal : s.toKm === slow.toKm ? signal : paper;
              return (
                <Column key={s.toKm} style={{ flex: s.distKm, height: h, backgroundColor: fill }} />
              );
            })}
          </Row>
          <Row stackOnMobile={false} style={{ padding: [16, 0, 26, 0] }}>
            <Column style={{ flex: 1 }}>
              <Text style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: faintOnInk }}>
                EVERY SEGMENT, AS RUN
              </Text>
            </Column>
            <Text style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: faintOnInk, textAlign: "right" }}>
              {race.site.toUpperCase()}
            </Text>
          </Row>
        </Column>
      </Column>
    </Canvas>
  );
}
