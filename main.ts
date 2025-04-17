/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

// Inicializar el usuario administrador por defecto
try {
  const { initializeAdmin } = await import("./init-admin.ts");
  if (typeof initializeAdmin === "function") {
    await initializeAdmin();
  }
} catch (error) {
  console.error("Error al inicializar el usuario administrador:", error);
}

await start(manifest, config);
