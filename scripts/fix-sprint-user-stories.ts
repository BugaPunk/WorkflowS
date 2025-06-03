#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllProjects } from "../models/project.ts";
import { getProjectSprints, getSprintById } from "../models/sprint.ts";
import { getUserStoriesWithFilters, updateUserStory } from "../models/userStory.ts";

async function fixSprintUserStories() {
  console.log("🔧 Corrigiendo relación entre sprint y historias de usuario...\n");

  try {
    // 1. Buscar el proyecto "Sistema de Gestión Académica"
    console.log("📋 Buscando proyecto 'Sistema de Gestión Académica'...");
    const allProjects = await getAllProjects();
    const project = allProjects.find(p => p.name === "Sistema de Gestión Académica");
    
    if (!project) {
      console.log("❌ No se encontró el proyecto 'Sistema de Gestión Académica'");
      return;
    }
    
    console.log(`✅ Proyecto encontrado: ${project.name} (ID: ${project.id})`);

    // 2. Buscar el sprint "Sprint 1 - Fundamentos"
    console.log("\n🏃 Buscando 'Sprint 1 - Fundamentos'...");
    const sprints = await getProjectSprints(project.id);
    const sprint1 = sprints.find(s => s.name === "Sprint 1 - Fundamentos");
    
    if (!sprint1) {
      console.log("❌ No se encontró el sprint 'Sprint 1 - Fundamentos'");
      return;
    }
    
    console.log(`✅ Sprint encontrado: ${sprint1.name} (ID: ${sprint1.id})`);
    console.log(`   Historias de usuario en el sprint: ${sprint1.userStoryIds.length}`);

    // 3. Obtener todas las historias de usuario del proyecto
    console.log("\n📝 Obteniendo historias de usuario del proyecto...");
    const allUserStories = await getUserStoriesWithFilters({ projectId: project.id });
    console.log(`   Encontradas ${allUserStories.length} historias de usuario en el proyecto`);

    // 4. Actualizar las historias de usuario que están en el sprint
    console.log("\n🔄 Actualizando relación sprintId en historias de usuario...");
    
    let updatedCount = 0;
    
    for (const userStoryId of sprint1.userStoryIds) {
      const userStory = allUserStories.find(us => us.id === userStoryId);
      
      if (userStory) {
        console.log(`   Actualizando: ${userStory.title}...`);
        
        // Actualizar la historia de usuario para incluir el sprintId
        const updated = await updateUserStory(userStory.id, {
          sprintId: sprint1.id
        });
        
        if (updated) {
          console.log(`   ✅ Historia actualizada con sprintId`);
          updatedCount++;
        } else {
          console.log(`   ❌ Error al actualizar la historia`);
        }
      } else {
        console.log(`   ⚠️  Historia de usuario ${userStoryId} no encontrada en el proyecto`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ ${updatedCount} historias de usuario actualizadas`);
    console.log(`   📋 Sprint tiene ${sprint1.userStoryIds.length} historias asignadas`);

    // 5. Verificar que la relación funciona ahora
    console.log("\n🔍 Verificando relación corregida...");
    const sprintUserStories = await getUserStoriesWithFilters({ sprintId: sprint1.id });
    console.log(`   ✅ Ahora se encuentran ${sprintUserStories.length} historias de usuario para el sprint`);

    if (sprintUserStories.length > 0) {
      console.log("\n📝 Historias de usuario encontradas:");
      for (const story of sprintUserStories) {
        console.log(`   - ${story.title} (${story.status}, ${story.points} puntos)`);
      }
    }

    console.log(`\n🌐 Ahora puedes ver el gráfico de Burndown actualizado en:`);
    console.log(`   http://localhost:8000/sprints/${sprint1.id}`);

  } catch (error) {
    console.error("❌ Error al corregir la relación:", error);
  }
}

if (import.meta.main) {
  await fixSprintUserStories();
  Deno.exit(0);
}
