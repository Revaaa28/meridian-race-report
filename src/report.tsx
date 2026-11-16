import {
  Column,
  Divider,
  Document,
  Heading,
  PageBreak,
  PageFooter,
  PageNumber,
  Row,
  Table,
  TableCell,
  TableRow,
  Text,
} from "@hyper-elements/react";
import { Badge, PaceChart, SectionTitle, StatBlock, ZoneBar } from "./components";
import { athletes, race, type Athlete } from "./data";
import { fontFaces } from "./fonts";
import {
  analysis,
  avgHr,
  fastestSegment,
  finishSeconds,
  fmtPace,
  fmtTime,
  hrZones,
  isPb,
  nextGoal,
  segments,
  slowestSegment,
  splitStory,
} from "./stats";
import { ink, line, meridian, mono, paper, signal, slate, teal, zoneColors } from "./theme";

function badges(a: Athlete) {
  const story = splitStory(a);
  const out = [];
  if (a.pbSeconds === null) out.push(<Badge key="debut" label="MARATHON DEBUT" color={slate} />);
  else if (isPb(a)) out.push(<Badge key="pb" label="PERSONAL BEST" color={teal} />);
  if (story.kind === "negative") out.push(<Badge key="split" label="NEGATIVE SPLIT" color={teal} />);
  if (story.kind === "even") out.push(<Badge key="split" label="EVEN SPLIT" color={teal} />);
  if (story.kind === "positive") out.push(<Badge key="split" label="POSITIVE SPLIT" color={signal} />);
  return out;
}

function checkpointLabel(km: number): string {
  if (km === 21.0975) return "Half";
  if (km === 42.195) return "Finish";
  return `${km} km`;
}

/**
 * The official race report — a three-page Document per athlete.
 *
 * Page one is the result and the shape of the race, page two is the
 * evidence (every split, every zone), page three is what it means and
 * what to chase next. Every figure is computed by src/stats.ts from the
 * raw splits in src/data.ts; render.tsx generates one PDF per athlete.
 */
/** With no athlete given, the report renders for the first athlete in
 *  the data file — that is what `hyper-elements check` renders. */
export default function RaceReport({ a = athletes[0] }: { a?: Athlete }) {
  a = a ?? athletes[0];
  const segs = segments(a);
  const fast = fastestSegment(a);
  const slow = slowestSegment(a);
  const zones = hrZones(a);
  const goal = nextGoal(a);
  const finish = finishSeconds(a);

  return (
    <Document
      theme={meridian}
      size="A4"
      margin={46}
      lang="en"
      title={`Meridian Marathon 2026 — race report, ${a.name}`}
      fonts={fontFaces}
    >
      <PageFooter>
        <Row stackOnMobile={false} style={{ padding: [10, 0, 0, 0] }}>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1.5, color: slate }}>
              MERIDIAN MARATHON 2026 — RACE REPORT · BIB {a.bib}
            </Text>
          </Column>
          <Text style={{ fontFamily: mono, fontSize: 9, color: slate, textAlign: "right" }}>
            PAGE <PageNumber /> OF <PageNumber total />
          </Text>
        </Row>
      </PageFooter>

      {/* ── Page 1: the result ─────────────────────────────── */}
      <Row stackOnMobile={false} style={{ alignItems: "start" }}>
        <Row stackOnMobile={false} style={{ gap: 7, flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.5, color: ink }}>MERIDIAN</Text>
          <Text style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.5, color: signal }}>MARATHON</Text>
        </Row>
        <Column style={{ alignItems: "end", gap: 2, textAlign: "right" }}>
          <Text style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, color: slate }}>
            OFFICIAL RACE REPORT
          </Text>
          <Text style={{ fontFamily: mono, fontSize: 10, color: slate }}>{race.date}</Text>
        </Column>
      </Row>
      <Column style={{ height: 3, backgroundColor: signal }} />

      <Column style={{ gap: 4, padding: [18, 0, 0, 0] }}>
        <Heading level={1}>{a.name}</Heading>
        <Text style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1.5, color: slate }}>
          BIB {a.bib} · {a.country} · {a.ageGroup} · {race.finishers} FINISHERS
        </Text>
      </Column>

      <Column style={{ gap: 8, padding: [22, 0, 0, 0] }}>
        <Text style={{ apply: ["eyebrow"], color: signal }}>Finish — chip time</Text>
        <Text style={{ fontSize: 66, fontWeight: 900, lineHeight: 1, color: ink }}>{fmtTime(finish)}</Text>
        <Row stackOnMobile={false} style={{ gap: 8, padding: [4, 0, 0, 0] }}>
          {badges(a)}
        </Row>
      </Column>

      <Row stackOnMobile={false} style={{ gap: 20, padding: [26, 0, 0, 0] }}>
        <StatBlock label="AVG PACE" value={`${fmtPace(finish / race.distanceKm)}`} sub="per kilometre" />
        <StatBlock label="AVG HEART RATE" value={`${avgHr(a)}`} sub="bpm, time-weighted" />
        <StatBlock
          label={`FASTEST — ${fast.fromKm}–${fast.toKm} KM`}
          value={fmtPace(fast.paceSecPerKm)}
          sub="per kilometre"
        />
        <StatBlock
          label={`SLOWEST — ${slow.fromKm}–${slow.toKm} KM`}
          value={fmtPace(slow.paceSecPerKm)}
          sub="per kilometre"
        />
      </Row>

      <Column style={{ gap: 8, padding: [28, 0, 0, 0] }}>
        <SectionTitle>THE SHAPE OF YOUR RACE</SectionTitle>
        <PaceChart a={a} />
        <Row stackOnMobile={false}>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: slate }}>
              One bar per timing segment — width is distance, height is pace. Hairline: the half-way mat.
            </Text>
          </Column>
          <Text style={{ fontFamily: mono, fontSize: 10, color: slate, textAlign: "right" }}>
            FASTEST {fmtPace(fast.paceSecPerKm)} · SLOWEST {fmtPace(slow.paceSecPerKm)}
          </Text>
        </Row>
      </Column>

      <Text style={{ fontSize: 11, color: slate, padding: [20, 0, 0, 0] }}>
        Conditions: {race.conditions}. Results are provisional until ratified by the timing provider;
        chip time is the official time for age-group awards.
      </Text>

      <PageBreak />

      {/* ── Page 2: the evidence ───────────────────────────── */}
      <Column style={{ gap: 26 }}>
        <Column style={{ gap: 12 }}>
          <SectionTitle>SPLITS</SectionTitle>
          <Table
            style={{
              cellPadding: [8, 6],
              rowBorder: { width: 1, style: "solid", color: line },
              fontSize: 13,
            }}
          >
            <TableRow header>
              <TableCell style={{ fontWeight: 900 }}>Checkpoint</TableCell>
              <TableCell style={{ fontWeight: 900 }}>Clock</TableCell>
              <TableCell style={{ fontWeight: 900 }}>Segment</TableCell>
              <TableCell style={{ fontWeight: 900 }}>Pace /km</TableCell>
              <TableCell style={{ fontWeight: 900 }}>HR</TableCell>
            </TableRow>
            {segs.map((s, i) => (
              <TableRow key={s.toKm}>
                <TableCell style={{ fontWeight: 700 }}>{checkpointLabel(s.toKm)}</TableCell>
                <TableCell style={{ fontFamily: mono }}>{fmtTime(a.splitsSeconds[i])}</TableCell>
                <TableCell style={{ fontFamily: mono }}>{fmtTime(s.seconds)}</TableCell>
                <TableCell style={{ fontFamily: mono }}>{fmtPace(s.paceSecPerKm)}</TableCell>
                <TableCell style={{ fontFamily: mono }}>{s.hr}</TableCell>
              </TableRow>
            ))}
          </Table>
        </Column>

        <Column style={{ gap: 12 }}>
          <SectionTitle>HEART-RATE ZONES</SectionTitle>
          <ZoneBar a={a} />
          <Column style={{ gap: 5 }}>
            {zones
              .filter((z) => z.pct >= 0.5)
              .map((z, i) => (
                <Row key={z.zone} stackOnMobile={false} style={{ gap: 10, alignItems: "center" }}>
                  <Column style={{ width: 11, height: 11, backgroundColor: zoneColors[z.zone - 1] }} />
                  <Column style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12 }}>
                      Z{z.zone} — {z.label}
                    </Text>
                  </Column>
                  <Text style={{ fontFamily: mono, fontSize: 12, color: slate }}>
                    {z.pct.toFixed(1)}% · {fmtTime(z.seconds)}
                  </Text>
                </Row>
              ))}
          </Column>
          <Text style={{ fontSize: 11, color: slate }}>
            Zones are set from your max heart rate of {a.maxHr} bpm and weighted by time in each segment.
          </Text>
        </Column>
      </Column>

      <PageBreak />

      {/* ── Page 3: the meaning ────────────────────────────── */}
      <Column style={{ gap: 24 }}>
        <Column style={{ gap: 12 }}>
          <SectionTitle>WHAT THE NUMBERS SAY</SectionTitle>
          {analysis(a).map((paragraph, i) => (
            <Text key={i} style={{ fontSize: 14 }}>
              {paragraph}
            </Text>
          ))}
        </Column>

        <Column style={{ backgroundColor: ink, borderRadius: 14, padding: [26, 28], gap: 10 }}>
          <Text style={{ apply: ["eyebrow"], color: "#e8a13a" }}>Next goal</Text>
          <Text style={{ fontSize: 28, fontWeight: 900, color: paper }}>{goal.headline}</Text>
          <Text style={{ fontSize: 13, color: "#c9ced4" }}>{goal.body}</Text>
        </Column>

        <Divider />
        <Text style={{ fontSize: 12, color: slate }}>
          Your finisher card — the square image made from this same data — is ready at{" "}
          {race.site}/cards/{a.bib}. Post it, tag the race, and we will see you on the start line of
          the 5th edition: 11 October 2027.
        </Text>
      </Column>
    </Document>
  );
}
