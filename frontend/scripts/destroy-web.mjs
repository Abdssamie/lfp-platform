import { execFileSync } from "node:child_process";
import path from "node:path";

import { readProjectConfig, repoRoot } from "./_project-config.mjs";

const projectConfig = readProjectConfig();
const appDir = path.join(repoRoot, "apps/web");

execFileSync("npx", ["wrangler", "delete", "--name", projectConfig.workerName], {
  cwd: appDir,
  stdio: "inherit",
});
