#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para generar datos de burndown para un sprint específico
 * Ejecutar con: deno run --unstable-kv -A scripts/generate-burndown.ts <sprintId>
 */

import { calculateBurndown } from "../services/metricService.ts";
import { getSprintById } from "../models/sprint.ts";

async function generateBurndownData() {
  // Obtener el ID del sprint de los argumentos
  const sprintId = Deno.args[0];
  
  if (!sprintId) {
    console.error("❌ Error: Debe proporcionar un ID de sprint");
    console.log("Uso: deno run --unstable-kv -A scripts/generate-burndown.ts <sprintId>");
    Deno.exit(1);
  }
  
  console.log(`🔄 Generando datos de burndown para el sprint ${sprintId}...`);
  
  try {
    // Verificar que el sprint existe
    const sprint = await getSprintById(sprintId);
    if (!sprint) {
      console.error(`❌ Error: Sprint con ID ${sprintId} no encontrado`);
      Deno.exit(1);
    }
    
    console.log(`✅ Sprint encontrado: ${sprint.name}`);
    
    // Calcular datos de burndown
    const burndownData = await calculateBurndown(sprintId);
    
    console.log(`✅ Datos de burndown generados: ${burndownData.length} puntos de datos`);
    
    // Mostrar algunos datos de ejemplo
    if (burndownData.length > 0) {
      console.log("\n📊 Primeros 3 puntos de datos:");
      burndownData.slice(0, 3).forEach((data, index) => {
        console.log(`  ${index + 1}. Fecha: ${new Date(data.date).toISOString().split("T")[0]}`);
        console.log(`     Puntos restantes: ${data.remainingPoints}`);
        console.log(`     Puntos completados: ${data.completedPoints}`);
        console.log(`     Burndown ideal: ${data.idealBurndown}`);
      });
    } else {
      console.log("⚠️ No se generaron datos de burndown. Posibles razones:");
      console.log("  - El sprint no tiene historias de usuario asignadas");
      console.log("  - Las historias de usuario no tienen puntos asignados");
      console.log("  - No hay tareas asociadas a las historias de usuario");
    }
    
  } catch (error) {
    console.error("❌ Error al generar datos de burndown:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await generateBurndownData();
}