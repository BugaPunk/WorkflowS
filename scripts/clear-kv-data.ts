#!/usr/bin/env -S deno run --unstable-kv -A

// Script para limpiar los datos almacenados en Deno KV
import { COLLECTIONS } from "../utils/db.ts";

async function main() {
  try {
    // Abrir la base de datos KV
    const kv = await Deno.openKv();
    
    console.log("=== Limpiando datos de Deno KV ===\n");
    
    // Eliminar usuarios
    console.log("Eliminando usuarios...");
    const usersIterator = kv.list({ prefix: COLLECTIONS.USERS });
    let userCount = 0;
    
    for await (const entry of usersIterator) {
      await kv.delete(entry.key);
      userCount++;
    }
    
    console.log(`Se eliminaron ${userCount} entradas relacionadas con usuarios.\n`);
    
    // Cerrar la base de datos
    kv.close();
    
    console.log("¡Limpieza completada!");
  } catch (error) {
    console.error("Error al limpiar Deno KV:", error);
  }
}

// Pedir confirmación antes de limpiar
console.log("¡ADVERTENCIA! Esta acción eliminará TODOS los datos de la base de datos.");
console.log("Esto incluye usuarios, sesiones y cualquier otro dato almacenado.");
console.log("Esta acción NO se puede deshacer.\n");

const confirmation = prompt("¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar): ");

if (confirmation === "SI") {
  main();
} else {
  console.log("Operación cancelada.");
}
