import { defineTheme } from "@hyper-elements/react";

/**
 * The Meridian timing identity: Swiss timing-sheet minimalism — warm
 * paper, near-black ink, one signal red, tabular mono for every number
 * that came off a clock.
 */
export const meridian = defineTheme({
  colors: {
    background: "#fbfbf8",
    foreground: "#111417",
    primary: "#111417",
    primaryForeground: "#fbfbf8",
    muted: "#5a6470",
    border: "#e3e1d8",
    ink: "#111417",
    paper: "#fbfbf8",
    signal: "#e63312",
    teal: "#0d7a5f",
    slate: "#5a6470",
    line: "#e3e1d8",
    amber: "#e8a13a",
  },
  fonts: {
    body: "Archivo, Arial, sans-serif",
    heading: "Archivo, Arial, sans-serif",
    mono: "'Space Mono', 'Courier New', monospace",
  },
  fontSizes: { body: 14 },
  lineHeights: { body: 1.55 },
  components: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 30, lineHeight: 1.05, letterSpacing: 0.2 },
          2: { fontSize: 17, lineHeight: 1.2, letterSpacing: 0.6 },
          3: { fontSize: 13, lineHeight: 1.3, letterSpacing: 1 },
        },
      },
    },
    Text: {},
  },
  styles: {
    eyebrow: {
      fontFamily: "'Space Mono', 'Courier New', monospace",
      fontSize: 10,
      letterSpacing: 2.5,
      textTransform: "uppercase",
    },
  },
});

export const ink = "#111417";
export const paper = "#fbfbf8";
export const signal = "#e63312";
export const teal = "#0d7a5f";
export const slate = "#5a6470";
export const line = "#e3e1d8";
export const amber = "#e8a13a";
export const mono = "'Space Mono', 'Courier New', monospace";
export const zoneColors = ["#b8c4ce", "#6fa8a0", "#0d7a5f", "#e8a13a", "#e63312"];
