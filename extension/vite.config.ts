import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      // Copy static extension assets into dist/ after each build
      name: "copy-ext-static",
      closeBundle() {
        copyFileSync("manifest.json", "dist/manifest.json");
        mkdirSync("dist/icons", { recursive: true });
        // Copy icon files from public/icons → dist/icons
        try {
          for (const file of readdirSync("public/icons")) {
            copyFileSync(`public/icons/${file}`, `dist/icons/${file}`);
          }
        } catch {
          console.warn("No public/icons directory found — skipping icon copy");
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content:    resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        // Predictable names required by manifest.json
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
