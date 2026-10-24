import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { Unhead } from "@unhead/react/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { intlayer } from "vite-intlayer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths(),
    tailwindcss(),
    Unhead(),
    intlayer(),
    tanstackStart({
      router: {
        routeFileIgnorePattern: ".content.(ts|tsx|js|mjs|cjs|jsx|json|jsonc|json5)$",
      },
    }),
    viteReact(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  environments: {
    ssr: {
      optimizeDeps: {
        include: [
          "react",
          "react-dom",
          "react-dom/server",
          "@unhead/react",
          "@unhead/react/plugins",
          "next-themes",
        ],
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.FASTAPI_INTERNAL_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  ssr: {
    noExternal: [
      "@tanstack/react-query",
      "@tanstack/react-router",
      "@tanstack/react-router-ssr-query",
    ],
  },
});
