// Node-only resolver for testing the existing Zustand stores without rewriting their imports.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = new URL("../", import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    let target;
    if (specifier.startsWith("@/"))
      target = new URL("src/" + specifier.slice(2), root);
    else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(new URL("src/", root).href)
    )
      target = new URL(specifier, context.parentURL);
    if (target) {
      for (const suffix of ["", ".ts", "/index.ts"]) {
        const candidate = fileURLToPath(target) + suffix;
        if (existsSync(candidate))
          return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
