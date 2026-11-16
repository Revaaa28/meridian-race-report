/**
 * Generate the full Meridian 2026 report run:
 *
 *   out/report-<athlete>.pdf   the three-page race report (Document → PDF)
 *   out/report-lindqvist.html  the first report as print HTML
 *   out/card-<athlete>.png     the finisher share card (Canvas → PNG)
 *
 * Every template is validated before it is rendered, and any error
 * diagnostic stops the run — a timing company does not ship a report
 * with a warning on it.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { ElementsError, formatDiagnostics, render, validate } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { renderPdf } from "@hyper-elements/react/pdf";
import FinisherCard from "./src/card";
import { athletes } from "./src/data";
import RaceReport from "./src/report";

const fontFiles: [string, string, number][] = [
  ["Archivo", "assets/fonts/Archivo-400.ttf", 400],
  ["Archivo", "assets/fonts/Archivo-500.ttf", 500],
  ["Archivo", "assets/fonts/Archivo-700.ttf", 700],
  ["Archivo", "assets/fonts/Archivo-900.ttf", 900],
  ["Space Mono", "assets/fonts/SpaceMono-400.ttf", 400],
  ["Space Mono", "assets/fonts/SpaceMono-700.ttf", 700],
];

async function loadFonts() {
  return Promise.all(
    fontFiles.map(async ([family, path, weight]) => ({
      family,
      src: await readFile(path),
      weight,
    })),
  );
}

function report(name: string, diagnostics: { severity?: string }[] | undefined) {
  if (diagnostics?.length) {
    console.log(`\n${name}:\n${formatDiagnostics(diagnostics as never)}`);
  }
  return diagnostics?.some((d) => d.severity === "error") ?? false;
}

async function main() {
  await mkdir("out", { recursive: true });
  const fonts = await loadFonts();
  let failed = false;

  for (const a of athletes) {
    const reportEl = <RaceReport a={a} />;
    const cardEl = <FinisherCard a={a} />;

    failed = report(`${a.slug} report validate`, validate(reportEl).diagnostics) || failed;
    failed = report(`${a.slug} card validate`, validate(cardEl).diagnostics) || failed;

    const { pdf, diagnostics: pdfDiags } = await renderPdf(reportEl, { fonts });
    failed = report(`${a.slug} pdf`, pdfDiags) || failed;
    await writeFile(`out/report-${a.slug}.pdf`, pdf);

    const png = await renderImage(cardEl, { fonts });
    failed = report(`${a.slug} card`, png.diagnostics) || failed;
    await writeFile(`out/card-${a.slug}.png`, png.image);

    console.log(`${a.name}: out/report-${a.slug}.pdf + out/card-${a.slug}.png`);
  }

  const { html } = await render(<RaceReport a={athletes[0]} />);
  await writeFile("out/report-lindqvist.html", html);
  console.log("print HTML: out/report-lindqvist.html");

  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  if (e instanceof ElementsError) {
    console.error(formatDiagnostics(e.diagnostics));
  } else {
    console.error(e);
  }
  process.exitCode = 1;
});
