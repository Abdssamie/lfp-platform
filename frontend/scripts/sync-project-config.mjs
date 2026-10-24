import fs from "node:fs";
import path from "node:path";

import { getWebWranglerConfig, readProjectConfig, repoRoot } from "./_project-config.mjs";

const projectConfig = readProjectConfig();
const wranglerPath = path.join(repoRoot, "apps/web/wrangler.jsonc");
const wranglerConfig = `${JSON.stringify(getWebWranglerConfig(projectConfig), null, 2)}\n`;

fs.writeFileSync(wranglerPath, wranglerConfig);
console.log(`Synced ${path.relative(repoRoot, wranglerPath)} from project.config.json`);
