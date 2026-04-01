import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["bin/gitlore.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist/bin",
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
