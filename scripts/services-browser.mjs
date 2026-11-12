// Real browser acceptance; no mocked network, DOM or store injection.
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
const built = process.argv.includes("--built");
const port = built ? 8081 : 8080;
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  "npm",
  [
    "run",
    built ? "preview" : "dev",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      VITE_AUTH_ENABLED: "false",
      ...(built ? { NETLIFY: "true" } : {}),
    },
    stdio: "ignore",
    detached: true,
  },
);
let browser;
let page;
const errors = [];
const checks = [];
try {
  for (let i = 0; i < 120; i++) {
    try {
      const response = await fetch(base);
      if (response.ok) break;
    } catch {}
    if (i === 119) throw new Error("Preview server did not become ready");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  browser = await chromium.launch(
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  );
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  // Only bypass the existing onboarding overlay, not application state.
  await context.addInitScript(() =>
    sessionStorage.setItem("sportix-onboarded", "1"),
  );
  page = await context.newPage();
  await mkdir("evidence/browser", { recursive: true });
  page.on("response", (response) => {
    if (response.status() >= 400)
      console.error(`HTTP ${response.status()} ${response.url()}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error")
      errors.push(`${message.text()} ${message.location().url ?? ""}`);
  });
  await page.goto(`${base}/services`);
  await page.getByTestId("offer-demo-club").waitFor();
  assert.equal(await page.locator('[data-testid^="offer-"]').count(), 8);
  checks.push("All eight partner service types render");
  await page
    .getByTestId("offer-demo-club")
    .getByRole("button", { name: "طلب الخدمة", exact: true })
    .click();
  const confirm = page.getByRole("region", { name: "Request confirmation" });
  assert.equal(
    await confirm
      .getByRole("button", { name: "تأكيد وإرسال الطلب" })
      .isEnabled(),
    false,
  );
  await confirm.getByRole("checkbox").check();
  await confirm.getByRole("button", { name: "تأكيد وإرسال الطلب" }).click();
  await page.getByText("بانتظار الشريك", { exact: true }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "الطلبات", exact: true }).click();
  await page.getByText("بانتظار الشريك", { exact: true }).waitFor();
  checks.push("Consent required; request persists after reload");
  await page.getByRole("link", { name: "مساحة الشريك" }).click();
  await page.getByRole("button", { name: "الطلبات", exact: true }).click();
  await page.getByRole("button", { name: "قبول الطلب", exact: true }).click();
  await page
    .getByRole("button", { name: "محاكاة إتمام الخدمة", exact: true })
    .click();
  await page.getByText("مكتمل", { exact: true }).waitFor();
  await page.getByRole("link", { name: "رحلة الرياضي", exact: true }).click();
  await page.getByRole("button", { name: "الطلبات", exact: true }).click();
  await page.getByRole("combobox", { name: /^Rating / }).selectOption("5");
  await page.getByText("تقييمك: 5 / 5", { exact: true }).waitFor();
  checks.push("Athlete → partner acceptance/completion → athlete rating");
  await page.getByRole("button", { name: "الخدمات", exact: true }).click();
  await page
    .getByTestId("offer-demo-impact")
    .getByRole("button", { name: "طلب الخدمة" })
    .click();
  await page
    .getByRole("region", { name: "Request confirmation" })
    .getByRole("checkbox")
    .check();
  await page.getByRole("button", { name: "تأكيد وإرسال الطلب" }).click();
  await page.getByRole("button", { name: "إلغاء الطلب", exact: true }).click();
  await page.getByText("ملغى", { exact: true }).waitFor();
  checks.push("Cancellation is visible to athlete");
  await page.goto(`${base}/sport-id`);
  await page.getByText("رحلتي مع الشركاء", { exact: true }).waitFor();
  await page.getByText(/طلبات الخدمات: 2/).waitFor();
  checks.push("SPORT ID projects the shared request history");
  await mkdir("evidence/browser", { recursive: true });
  for (const [size, width, height] of [
    ["desktop", 1280, 900],
    ["mobile", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of [
      "services",
      "partners",
      "communities",
      "go-sportix",
      "sport-id",
      "marketplace",
    ]) {
      await page.goto(`${base}/${route}`);
      await page.locator("main, header").first().waitFor();
      await page.waitForTimeout(350);
      assert.ok((await page.locator("body").innerText()).trim().length > 100);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      assert.equal(overflow, false, `Horizontal overflow: ${route} / ${size}`);
      await page.screenshot({
        path: `evidence/browser/${built ? "built" : "dev"}-${route}-${size}.png`,
        fullPage: true,
      });
    }
  }
  // A passing journey must also be free of page and console errors.
  assert.deepEqual(errors, []);
  checks.push(
    "Six routes render without overflow or console errors at desktop and mobile sizes",
  );
  await writeFile(
    `evidence/browser/${built ? "built" : "dev"}-results.json`,
    JSON.stringify({ passed: true, checks }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, checks }, null, 2));
} catch (error) {
  if (page) {
    await page
      .screenshot({
        path: `evidence/browser/${built ? "built" : "dev"}-failure.png`,
        fullPage: true,
      })
      .catch(() => {});
    await writeFile(
      `evidence/browser/${built ? "built" : "dev"}-failure.json`,
      JSON.stringify(
        {
          message: String(error),
          checks,
          errors,
          body: await page
            .locator("body")
            .innerText()
            .catch(() => ""),
        },
        null,
        2,
      ),
    );
  }
  console.error(JSON.stringify({ checks, errors }));
  throw error;
} finally {
  if (browser) await browser.close();
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {}
}
