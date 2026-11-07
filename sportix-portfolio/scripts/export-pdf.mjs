import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const OUT = "/workspace/public/downloads/SPORTIX_AI_Executive_Portfolio.pdf";
const BASE = process.env.PORTFOLIO_URL ?? "http://127.0.0.1:8080";

const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(`${BASE}/print`, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(1500);

const handles = await page.locator(".slide-stage").all();
if (handles.length < 24) {
  throw new Error(`expected 24 slides, found ${handles.length}`);
}

const pdf = await PDFDocument.create();
const pageW = 1920;
const pageH = 1080;

for (let i = 0; i < handles.length; i++) {
  const buf = await handles[i].screenshot({ type: "png" });
  const img = await pdf.embedPng(buf);
  const p = pdf.addPage([pageW, pageH]);
  p.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
  console.log(`slide ${i + 1}/${handles.length}`);
}

const bytes = await pdf.save();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, bytes);
await browser.close();
console.log("wrote", OUT, bytes.length);
