#!/usr/bin/env -S deno run --unstable-kv -A

// Script para ver los datos almacenados en Deno KV
import { COLLECTIONS } from "../utils/db.ts";

async function main() {
  try {
    // Abrir la base de datos KV
    const kv = await Deno.openKv();
    
    console.log("=== Datos almacenados en Deno KV ===\n");
    
    // Listar usuarios
    console.log("=== USUARIOS ===");
    const usersIterator = kv.list({ prefix: COLLECTIONS.USERS });
    let userCount = 0;
    
    for await (const entry of usersIterator) {
      // Filtrar solo los usuarios principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === "users") {
        userCount++;
        console.log(`Usuario ${userCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Nombre de usuario: ${entry.value.username}`);
        console.log(`  Correo: ${entry.value.email}`);
        console.log(`  Rol: ${entry.value.role}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }
    
    if (userCount === 0) {
      console.log("No hay usuarios registrados.\n");
    }
    
    // Listar sesiones
    console.log("=== SESIONES ===");
    const sessionsIterator = kv.list({ prefix: [...COLLECTIONS.USERS, "sessions"] });
    let sessionCount = 0;
    
    for await (const entry of sessionsIterator) {
      sessionCount++;
      console.log(`Sesión ${sessionCount}:`);
      console.log(`  ID: ${entry.key[entry.key.length - 1]}`);
      console.log(`  Usuario ID: ${entry.value.userId}`);
      console.log(`  Nombre de usuario: ${entry.value.username}`);
      console.log(`  Correo: ${entry.value.email}`);
      console.log(`  Rol: ${entry.value.role}`);
      console.log(`  Creada: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log(`  Expira: ${new Date(entry.value.expiresAt).toLocaleString()}`);
      console.log("");
    }
    
    if (sessionCount === 0) {
      console.log("No hay sesiones activas.\n");
    }
    
    // Cerrar la base de datos
    kv.close();
  } catch (error) {
    console.error("Error al acceder a Deno KV:", error);
  }
}

main();
