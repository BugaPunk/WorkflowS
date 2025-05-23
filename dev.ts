#!/usr/bin/env -S deno run -A --unstable-kv --watch=static/,routes/,layouts/,components/,islands/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";
import { initializeAdmin } from "./utils/initializeAdmin.ts";

import "$std/dotenv/load.ts";

// Inicializar usuario administrador por defecto
await initializeAdmin();

// Iniciar el servidor de desarrollo
await dev(import.meta.url, "./main.ts", config);
