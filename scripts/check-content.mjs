import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = await mkdtemp(join(tmpdir(), "tennis-content-"));

try {
  const result = await build({
    root,
    logLevel: "silent",
    build: {
      ssr: "src/content/library.ts",
      outDir,
      emptyOutDir: true,
    },
  });
  const builds = Array.isArray(result) ? result : [result];
  const entry = builds.flatMap((item) => item.output).find((item) => item.type === "chunk" && item.isEntry);
  if (!entry) throw new Error("Content validation bundle has no entry file.");
  await import(`${pathToFileURL(join(outDir, entry.fileName)).href}?run=${Date.now()}`);
  console.log("Tennis content library passed its quality checks.");
} finally {
  await rm(outDir, { recursive: true, force: true });
}
