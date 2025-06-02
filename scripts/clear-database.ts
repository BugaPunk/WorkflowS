#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para vaciar completamente la base de datos Deno KV
 * Ejecutar con: deno run --unstable-kv -A scripts/clear-database.ts
 * 
 * ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
 */

import { getKv } from "../utils/db.ts";

console.log("🗑️  SCRIPT DE LIMPIEZA DE BASE DE DATOS");
console.log("=====================================");
console.log("⚠️  ADVERTENCIA: Este script eliminará TODOS los datos");
console.log("=====================================\n");

async function clearDatabase() {
  const kv = getKv();
  
  console.log("🔍 Escaneando base de datos...");
  
  // Obtener todas las claves de la base de datos
  const allKeys: Deno.KvKey[] = [];
  
  // Escanear todas las entradas
  const iterator = kv.list({ prefix: [] });
  
  for await (const entry of iterator) {
    allKeys.push(entry.key);
  }
  
  console.log(`📊 Encontradas ${allKeys.length} entradas en la base de datos`);
  
  if (allKeys.length === 0) {
    console.log("✅ La base de datos ya está vacía");
    return;
  }
  
  // Mostrar tipos de datos encontrados
  const dataTypes = new Set<string>();
  for (const key of allKeys) {
    if (key.length > 0) {
      dataTypes.add(String(key[0]));
    }
  }
  
  console.log("\n📋 Tipos de datos encontrados:");
  for (const type of dataTypes) {
    const count = allKeys.filter(key => key[0] === type).length;
    console.log(`   • ${type}: ${count} entradas`);
  }
  
  // Confirmar eliminación
  console.log("\n❓ ¿Estás seguro de que quieres eliminar TODOS los datos?");
  console.log("   Escribe 'CONFIRMAR' para continuar:");
  
  // Leer confirmación del usuario
  const confirmation = prompt("Confirmación:");
  
  if (confirmation !== "CONFIRMAR") {
    console.log("❌ Operación cancelada");
    return;
  }
  
  console.log("\n🗑️  Eliminando datos...");
  
  // Eliminar en lotes para mejor rendimiento
  const batchSize = 100;
  let deletedCount = 0;
  
  for (let i = 0; i < allKeys.length; i += batchSize) {
    const batch = allKeys.slice(i, i + batchSize);
    
    // Crear operación atómica para el lote
    let atomic = kv.atomic();
    
    for (const key of batch) {
      atomic = atomic.delete(key);
    }
    
    // Ejecutar el lote
    const result = await atomic.commit();
    
    if (result.ok) {
      deletedCount += batch.length;
      console.log(`   ✅ Eliminadas ${deletedCount}/${allKeys.length} entradas`);
    } else {
      console.log(`   ❌ Error eliminando lote ${i / batchSize + 1}`);
    }
  }
  
  console.log("\n🔍 Verificando limpieza...");
  
  // Verificar que la base de datos esté vacía
  const remainingIterator = kv.list({ prefix: [] });
  const remaining = [];
  
  for await (const entry of remainingIterator) {
    remaining.push(entry.key);
  }
  
  if (remaining.length === 0) {
    console.log("✅ Base de datos completamente limpia");
    console.log(`🗑️  Total eliminado: ${deletedCount} entradas`);
  } else {
    console.log(`⚠️  Quedan ${remaining.length} entradas sin eliminar`);
    console.log("   Entradas restantes:");
    for (const key of remaining.slice(0, 10)) {
      console.log(`     • ${key.join(" > ")}`);
    }
    if (remaining.length > 10) {
      console.log(`     ... y ${remaining.length - 10} más`);
    }
  }
}

async function clearDatabaseSilent() {
  const kv = getKv();
  
  console.log("🔍 Escaneando base de datos...");
  
  // Obtener todas las claves de la base de datos
  const allKeys: Deno.KvKey[] = [];
  
  // Escanear todas las entradas
  const iterator = kv.list({ prefix: [] });
  
  for await (const entry of iterator) {
    allKeys.push(entry.key);
  }
  
  console.log(`📊 Encontradas ${allKeys.length} entradas en la base de datos`);
  
  if (allKeys.length === 0) {
    console.log("✅ La base de datos ya está vacía");
    return;
  }
  
  console.log("🗑️  Eliminando datos...");
  
  // Eliminar en lotes para mejor rendimiento
  const batchSize = 100;
  let deletedCount = 0;
  
  for (let i = 0; i < allKeys.length; i += batchSize) {
    const batch = allKeys.slice(i, i + batchSize);
    
    // Crear operación atómica para el lote
    let atomic = kv.atomic();
    
    for (const key of batch) {
      atomic = atomic.delete(key);
    }
    
    // Ejecutar el lote
    const result = await atomic.commit();
    
    if (result.ok) {
      deletedCount += batch.length;
      console.log(`   ✅ Eliminadas ${deletedCount}/${allKeys.length} entradas`);
    } else {
      console.log(`   ❌ Error eliminando lote ${i / batchSize + 1}`);
    }
  }
  
  console.log("✅ Base de datos limpia");
  console.log(`🗑️  Total eliminado: ${deletedCount} entradas`);
}

// Función principal
async function main() {
  try {
    // Verificar si se pasa el argumento --force para omitir confirmación
    const args = Deno.args;
    const forceMode = args.includes("--force") || args.includes("-f");
    
    if (forceMode) {
      console.log("🚀 Modo forzado activado - eliminando sin confirmación");
      await clearDatabaseSilent();
    } else {
      await clearDatabase();
    }
    
    console.log("\n🎯 PRÓXIMOS PASOS:");
    console.log("• Para poblar con datos de ejemplo:");
    console.log("  deno run --unstable-kv -A scripts/setup-demo-data.ts");
    console.log("• Para crear solo usuarios básicos:");
    console.log("  deno run --unstable-kv -A scripts/populate-sample-data-simple.ts");
    console.log("• Para crear solo rúbricas:");
    console.log("  deno run --unstable-kv -A scripts/populate-rubrics.ts");
    
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
  }
}

if (import.meta.main) {
  await main();
}
