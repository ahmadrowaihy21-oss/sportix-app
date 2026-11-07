#!/usr/bin/env node
// Verify the HTML emitted by the actual Netlify SSR bundle against its publish directory.
import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { default: handler } = await import(pathToFileURL(resolve(root, ".netlify/functions-internal/server/main.mjs")));
for (const path of ["/", "/demo"]) {
  const response = await handler(new Request(`https://hayvra.sportixpartners.com${path}`));
  if (response.status !== 200) throw new Error(`${path}: SSR returned ${response.status}`);
  const html = await response.text();
  const assets = new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)(?:\?[^" ]*)?"/g)].map((match) => match[1]));
  if (![...assets].some((asset) => asset.endsWith(".css"))) {
    throw new Error(`${path}: SSR did not include an application stylesheet`);
  }
  for (const asset of assets) {
    try {
      await access(resolve(root, "dist", `.${asset}`));
    } catch {
      throw new Error(`${path}: SSR references an unpublished asset: ${asset}`);
    }
  }
  console.log(`[build-assets] ${path}: ${assets.size} CSS/JS assets resolve`);
}
