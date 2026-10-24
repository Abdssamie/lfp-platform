import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_ANALYTICS_WRITE_KEY: z.string().optional(),
    SITE_URL: z.string().optional(),
  },
  runtimeEnv: (import.meta as unknown as { env: Record<string, string | undefined> }).env,
  emptyStringAsUndefined: true,
});
