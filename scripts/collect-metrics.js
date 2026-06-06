import { chromium } from "@playwright/test";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";

const execp = promisify(exec);
const METRIC_FILE = "qa/metrics.json";
const SERVER_URL = "http://127.0.0.1:4173";

async function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok || res.status === 404) return;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not start at ${url} within ${timeout}ms`);
}

async function startPreview() {
  await execp("npm run build");
  const server = exec("npx vite preview --host 127.0.0.1 --port 4173", {
    shell: true,
  });
  let started = false;
  const startPromise = waitForServer(SERVER_URL).then(() => {
    started = true;
  });

  await startPromise;
  return server;
}

async function stopServer(server) {
  if (!server) return;
  server.kill("SIGTERM");
}

async function collect() {
  await mkdir("qa", { recursive: true });
  const server = await startPreview();

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(SERVER_URL, { waitUntil: "networkidle" });

    const metrics = await page.evaluate(() => {
      const { navigationStart, domContentLoadedEventEnd, loadEventEnd } =
        window.performance.timing;
      const paints = window.performance
        .getEntriesByType("paint")
        .reduce((acc, entry) => {
          acc[entry.name] = Math.round(entry.startTime);
          return acc;
        }, {});
      const interactions = Array.from(
        document.querySelectorAll("button, input, select, textarea"),
      ).length;
      return {
        url: location.href,
        domContentLoadedMs: domContentLoadedEventEnd - navigationStart,
        loadEventMs: loadEventEnd - navigationStart,
        paints,
        interactiveElements: interactions,
        timestamp: new Date().toISOString(),
      };
    });

    await browser.close();
    await writeFile(METRIC_FILE, JSON.stringify(metrics, null, 2));
    console.log(`Metrics written to ${METRIC_FILE}`);
  } finally {
    await stopServer(server);
  }
}

collect().catch((error) => {
  console.error("Metric collection failed:", error);
  process.exit(1);
});
