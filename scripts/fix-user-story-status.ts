#!/usr/bin/env -S deno run --unstable-kv -A

// Script para corregir el estado de las historias de usuario basándose en sus tareas
import { updateAllUserStoryStatusesInProject } from "../services/userStoryStatusService.ts";
import { getAllProjects } from "../models/project.ts";

async function main() {
  try {
    console.log("🔧 CORRIGIENDO ESTADOS DE HISTORIAS DE USUARIO");
    console.log("=".repeat(50));
    
    // Obtener todos los proyectos
    const projects = await getAllProjects();
    
    if (projects.length === 0) {
      console.log("❌ No se encontraron proyectos");
      return;
    }
    
    console.log(`📁 Encontrados ${projects.length} proyecto(s)`);
    
    for (const project of projects) {
      console.log(`\n🚀 Procesando proyecto: ${project.name} (${project.id})`);
      
      try {
        await updateAllUserStoryStatusesInProject(project.id);
        console.log(`✅ Proyecto ${project.name} procesado correctamente`);
      } catch (error) {
        console.error(`❌ Error procesando proyecto ${project.name}:`, error);
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 PROCESO COMPLETADO");
    console.log("\n💡 Ahora las métricas deberían reflejar el progreso real del proyecto");
    
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

main();
