// tests/setup.ts
import { getKv } from "../utils/db.ts";

// Extender el tipo globalThis para incluir getKv
declare global {
  var getKv: typeof getKv;
}

// Variable global para almacenar la referencia original a getKv
let originalGetKv: typeof getKv;

// Configurar una base de datos de prueba
export async function setupTestDatabase(): Promise<Deno.Kv> {
  // Guardar la referencia original
  originalGetKv = globalThis.getKv;

  // Crear una base de datos en memoria para pruebas
  const kv = await Deno.openKv(":memory:");

  // Sobrescribir la función getKv para que use la base de datos de prueba
  globalThis.getKv = () => kv;

  return kv;
}

// Limpiar la base de datos después de las pruebas
export async function teardownTestDatabase(kv: Deno.Kv): Promise<void> {
  // Cerrar la conexión a la base de datos
  await kv.close();

  // Restaurar la función original
  globalThis.getKv = originalGetKv;
}
