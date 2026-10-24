import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(__dirname, "..");
export const projectConfigPath = path.join(repoRoot, "project.config.json");

export function readProjectConfig() {
  return JSON.parse(fs.readFileSync(projectConfigPath, "utf8"));
}

export function getWebWranglerConfig(projectConfig = readProjectConfig()) {
  return {
    $schema: "../node_modules/wrangler/config-schema.json",
    name: projectConfig.workerName,
    compatibility_date: projectConfig.cloudflare.compatibilityDate,
    compatibility_flags: projectConfig.cloudflare.compatibilityFlags,
    main: "@tanstack/react-start/server-entry",
    observability: {
      enabled: projectConfig.cloudflare.observabilityEnabled,
    },
  };
}
