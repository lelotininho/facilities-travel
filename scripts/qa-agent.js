import { exec } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const execp = promisify(exec);
const QA_DIR = "qa";
const PLAYWRIGHT_RESULTS = path.join(QA_DIR, "playwright-results.json");
const METRICS_FILE = path.join(QA_DIR, "metrics.json");
const REPORT_FILE = path.join(QA_DIR, "bug-report.md");

async function runCommand(command) {
  const { stdout, stderr } = await execp(command, {
    shell: true,
    maxBuffer: 20 * 1024 * 1024,
  });
  return { stdout, stderr };
}

async function ensureQaFolder() {
  await mkdir(QA_DIR, { recursive: true });
}

async function runRegression() {
  await ensureQaFolder();
  console.log("Running regression tests...");
  try {
    const { stdout, stderr } = await runCommand("npx playwright test");
    console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error("Regression tests failed.");
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function runMetrics() {
  await ensureQaFolder();
  console.log("Collecting metrics...");
  try {
    const { stdout, stderr } = await runCommand(
      "node scripts/collect-metrics.js",
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error("Metrics collection failed.");
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function runFormatting() {
  console.log("Checking formatting...");
  try {
    await runCommand("npx prettier --check .");
    console.log("Formatting is clean.");
    return { fixed: false, error: false };
  } catch (error) {
    console.warn("Formatting issues found. Applying Prettier fix...");
    await runCommand("npx prettier --write .");
    return { fixed: true, error: false };
  }
}

async function generateReport({
  regressionPassed,
  metricsPassed,
  formattingFixed,
}) {
  const reportLines = [
    "# QA Agent Report",
    "",
    `- Regression tests: ${regressionPassed ? "PASS" : "FAIL"}`,
    `- Metrics collection: ${metricsPassed ? "PASS" : "FAIL"}`,
    `- Auto-format applied: ${formattingFixed ? "yes" : "no"}`,
    "",
  ];

  if (regressionPassed) {
    reportLines.push("## Regression Summary");
    reportLines.push("The Playwright regression suite completed successfully.");
  } else {
    reportLines.push("## Regression Summary");
    reportLines.push(
      "The regression suite found failures. Review the Playwright report in `qa/playwright-results.json`.",
    );
  }

  if (metricsPassed) {
    reportLines.push("");
    reportLines.push("## Metrics Summary");
    try {
      const metrics = JSON.parse(await readFile(METRICS_FILE, "utf8"));
      reportLines.push(`- URL tested: ${metrics.url}`);
      reportLines.push(
        `- DOM Content Loaded: ${metrics.domContentLoadedMs} ms`,
      );
      reportLines.push(`- Load event: ${metrics.loadEventMs} ms`);
      reportLines.push(
        `- Paint entries: ${Object.keys(metrics.paints).join(", ")}`,
      );
      reportLines.push(
        `- Interactive elements found: ${metrics.interactiveElements}`,
      );
    } catch {
      reportLines.push("- Metrics details could not be read.");
    }
  } else {
    reportLines.push("");
    reportLines.push("## Metrics Summary");
    reportLines.push(
      "Metric collection failed. Check `qa/metrics.json` or console output.",
    );
  }

  reportLines.push("");
  reportLines.push("## Bug Notes");
  if (!regressionPassed) {
    reportLines.push(
      "- Regression tests detected issues in the app flow or page rendering.",
    );
  }
  if (!metricsPassed) {
    reportLines.push(
      "- Performance metrics could not be collected, or the app failed to load.",
    );
  }
  if (!formattingFixed) {
    reportLines.push("- No formatting changes were required.");
  }
  reportLines.push("");
  reportLines.push("## Recommended Next Steps");
  reportLines.push(
    "- Review failing Playwright tests in `qa/playwright-results.json`",
  );
  reportLines.push(
    "- If there are layout or rendering issues, fix the component structure and rerun `npm run qa`",
  );
  reportLines.push(
    "- Keep the `ANTHROPIC_API_KEY` secret configured in production to enable IA searches",
  );

  await writeFile(REPORT_FILE, reportLines.join("\n"));
  console.log(`QA report generated at ${REPORT_FILE}`);
}

async function runAgent() {
  const formattingResult = await runFormatting();
  const regressionPassed = await runRegression();
  const metricsPassed = await runMetrics();
  await generateReport({
    regressionPassed,
    metricsPassed,
    formattingFixed: formattingResult.fixed,
  });
  if (!regressionPassed || !metricsPassed) {
    process.exitCode = 1;
  }
}

async function reportOnly() {
  const metricsPassed = Boolean(await readFile(METRICS_FILE).catch(() => null));
  const regressionPassed = Boolean(
    await readFile(PLAYWRIGHT_RESULTS).catch(() => null),
  );
  await generateReport({
    regressionPassed,
    metricsPassed,
    formattingFixed: false,
  });
}

const command = process.argv[2] || "run";
if (command === "run") {
  runAgent().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else if (command === "report") {
  reportOnly().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  console.error("Usage: node scripts/qa-agent.js [run|report]");
  process.exit(1);
}
