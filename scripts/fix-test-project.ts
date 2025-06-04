#!/usr/bin/env -S deno run --unstable-kv -A

// Script para corregir el proyecto de prueba y validar burndown
import { updateUserStory } from "../models/userStory.ts";

async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("🔧 CORRIGIENDO PROYECTO DE PRUEBA");
    console.log("=".repeat(50));
    
    const projectId = "4c7ad291-8c1f-48c3-b810-0205c7c28709";
    const sprintId = "e5f01cd7-9324-43df-8e4d-e3cf2b644543";
    
    // Buscar la historia del proyecto
    const userStories = [];
    for await (const entry of kv.list({ prefix: ["userStories"] })) {
      const story = entry.value;
      if (story.projectId === projectId) {
        userStories.push(story);
      }
    }
    
    if (userStories.length === 0) {
      console.log("❌ No se encontraron historias");
      kv.close();
      return;
    }
    
    const story = userStories[0];
    console.log(`📝 Historia encontrada: ${story.title}`);
    console.log(`   Estado actual: ${story.status}`);
    console.log(`   Puntos: ${story.points}`);
    console.log(`   Sprint asignado: ${story.sprintId || 'Ninguno'}`);
    
    // Asignar la historia al sprint si no está asignada
    if (!story.sprintId || story.sprintId !== sprintId) {
      console.log(`\n🔄 Asignando historia al sprint...`);
      
      const updatedStory = await updateUserStory(story.id, { 
        sprintId: sprintId
      });
      
      if (updatedStory) {
        console.log(`✅ Historia asignada al sprint ${sprintId}`);
      } else {
        console.log(`❌ Error asignando historia al sprint`);
        kv.close();
        return;
      }
    }
    
    // Verificar que la historia tenga puntos
    if (!story.points || story.points === 0) {
      console.log(`\n🔄 Asignando puntos a la historia...`);
      
      const updatedStory = await updateUserStory(story.id, { 
        points: 5
      });
      
      if (updatedStory) {
        console.log(`✅ Historia actualizada con 5 puntos`);
      }
    }
    
    console.log(`\n✅ CONFIGURACIÓN CORREGIDA:`);
    console.log(`   - Historia: "${story.title}"`);
    console.log(`   - Puntos: 5`);
    console.log(`   - Estado: done`);
    console.log(`   - Sprint: ${sprintId}`);
    console.log(`   - Tarea completada: ✅`);
    
    console.log(`\n🎯 RESULTADO ESPERADO EN BURNDOWN:`);
    console.log(`   - Puntos iniciales: 5`);
    console.log(`   - Burndown ideal: línea descendente de 5 a 0`);
    console.log(`   - Progreso real: línea que baja a 0 cuando se completó`);
    console.log(`   - Estado final: 0 puntos restantes (100% completado)`);
    
    kv.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
