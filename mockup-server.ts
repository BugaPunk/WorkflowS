#!/usr/bin/env -S deno run -A --watch=static/,mockups/

import { serve } from "https://deno.land/std@0.216.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.216.0/http/file_server.ts";

const PORT = 8002;

console.log(`Servidor de mockups iniciado en http://localhost:${PORT}`);
console.log(`Abre tu navegador y visita http://localhost:${PORT}/mockups/index.html`);

await serve((req) => {
  return serveDir(req, {
    fsRoot: ".",
  });
}, { port: PORT });
