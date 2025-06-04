#!/usr/bin/env -S deno run --unstable-kv -A

// Script para verificar rúbricas específicas en Deno KV
import { getKv } from "../utils/db.ts";

async function main() {
  try {
    // Abrir la base de datos KV
    const kv = getKv();
    
    console.log("=== Verificando rúbricas específicas ===\n");
    
    // IDs de las rúbricas a verificar
    const rubricIds = [
      "61c4e5c6-474f-4136-8302-587e7da9206b", // Rúbrica de Presentación de Proyecto
      "b5054f13-05be-4521-842d-3ffb49111506"  // Rúbrica General de Desarrollo de Software
    ];
    
    // Verificar cada rúbrica
    for (const id of rubricIds) {
      const result = await kv.get(["rubrics", id]);
      
      if (result.value) {
        console.log(`✅ Rúbrica encontrada: ${result.value.name}`);
        console.log(`   ID: ${id}`);
        console.log(`   Descripción: ${result.value.description}`);
        console.log(`   Es plantilla: ${result.value.isTemplate ? 'Sí' : 'No'}`);
        console.log(`   Estado: ${result.value.status}`);
        console.log(`   Criterios: ${result.value.criteria?.length || 0}`);
        console.log("");
      } else {
        console.log(`❌ Rúbrica NO encontrada: ${id}`);
        console.log("");
      }
    }
    
    // Buscar todas las rúbricas que son plantillas
    console.log("=== Todas las rúbricas plantilla ===\n");
    
    const rubricsIterator = kv.list({ prefix: ["rubrics"] });
    let templateCount = 0;
    
    for await (const entry of rubricsIterator) {
      if (entry.key.length === 2 && entry.key[0] === "rubrics") {
        const rubric = entry.value;
        if (rubric.isTemplate) {
          templateCount++;
          console.log(`${templateCount}. ${rubric.name}`);
          console.log(`   ID: ${entry.key[1]}`);
          console.log(`   Descripción: ${rubric.description}`);
          console.log(`   Estado: ${rubric.status}`);
          console.log("");
        }
      }
    }
    
    if (templateCount === 0) {
      console.log("No se encontraron rúbricas plantilla.");
    }
    
    // Cerrar la base de datos
    kv.close();
  } catch (error) {
    console.error("Error al verificar rúbricas:", error);
  }
}

main();