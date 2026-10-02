import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "server",
          environment: "node",
          include: ["server/tests/**/*.test.js"],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "client",
          environment: "jsdom",
          include: ["client/tests/**/*.test.{js,jsx}"],
          setupFiles: ["client/tests/setup.js"],
        },
      },
    ],
  },
});
