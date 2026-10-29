import { createHead as createServerHead } from "@unhead/react/server";

export const head = createServerHead({
  plugins: [],
  init: [
    {
      script: [
        {
          defer: true,
          src: "https://analytics.moondesk.tech/api/script.js",
          "data-site-id": "5",
        },
      ],
    },
  ],
});
