import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tidewave from "tidewave/vite-plugin";

export default defineConfig({
  plugins: [tidewave(), react()],
});
