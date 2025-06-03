#!/usr/bin/env -S deno run -A --unstable-kv

import { getKv } from "../utils/db.ts";
import { getAllProjects } from "../models/project.ts";
import { getProjectSprints, getSprintById } from "../models/sprint.ts";
import { getUserStoriesBySprintId } from "../models/userStory.ts";
import { getUserStoryTasks } from "../models/task.ts";

async function verifySprintBurndown() {
  console.log("🔍 Verificando datos del Sprint 1 - Fundamentos...\n");

  try {
    // 1. Buscar el proyecto "Sistema de Gestión Académica"
    console.log("📋 Buscando proyecto 'Sistema de Gestión Académica'...");
    const allProjects = await getAllProjects();
    const project = allProjects.find(p => p.name === "Sistema de Gestión Académica");

    if (!project) {
      console.log("❌ No se encontró el proyecto 'Sistema de Gestión Académica'");
      console.log("Proyectos disponibles:");
      allProjects.forEach(p => console.log(`  - ${p.name}`));
      return;
    }
    
    console.log(`✅ Proyecto encontrado: ${project.name} (ID: ${project.id})`);

    // 2. Buscar el sprint "Sprint 1 - Fundamentos"
    console.log("\n🏃 Buscando 'Sprint 1 - Fundamentos'...");
    const sprints = await getProjectSprints(project.id);
    const sprint1 = sprints.find(s => s.name === "Sprint 1 - Fundamentos");
    
    if (!sprint1) {
      console.log("❌ No se encontró el sprint 'Sprint 1 - Fundamentos'");
      console.log("Sprints disponibles:");
      sprints.forEach(s => console.log(`  - ${s.name} (${s.status})`));
      return;
    }
    
    console.log(`✅ Sprint encontrado: ${sprint1.name} (ID: ${sprint1.id})`);
    console.log(`   Estado: ${sprint1.status}`);
    console.log(`   Objetivo: ${sprint1.goal || 'No definido'}`);
    
    if (sprint1.startDate && sprint1.endDate) {
      console.log(`   Fechas: ${new Date(sprint1.startDate).toLocaleDateString()} - ${new Date(sprint1.endDate).toLocaleDateString()}`);
      const duration = Math.ceil((sprint1.endDate - sprint1.startDate) / (1000 * 60 * 60 * 24));
      console.log(`   Duración: ${duration} días`);
    } else {
      console.log("   ⚠️  Fechas: No definidas");
    }

    // 3. Verificar historias de usuario
    console.log("\n📝 Verificando historias de usuario...");
    const userStories = await getUserStoriesBySprintId(sprint1.id);
    
    if (userStories.length === 0) {
      console.log("❌ No hay historias de usuario asignadas al sprint");
      return;
    }
    
    console.log(`✅ Encontradas ${userStories.length} historias de usuario:`);
    
    let totalPoints = 0;
    let completedPoints = 0;
    
    for (const story of userStories) {
      const points = story.points || 0;
      totalPoints += points;
      
      if (story.status === "done") {
        completedPoints += points;
      }
      
      console.log(`   - ${story.title}`);
      console.log(`     Estado: ${story.status} | Puntos: ${points}`);
      console.log(`     Prioridad: ${story.priority}`);
    }
    
    console.log(`\n📊 Resumen de puntos:`);
    console.log(`   Total: ${totalPoints} puntos`);
    console.log(`   Completados: ${completedPoints} puntos`);
    console.log(`   Restantes: ${totalPoints - completedPoints} puntos`);
    console.log(`   Progreso: ${totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(1) : 0}%`);

    // 4. Verificar tareas
    console.log("\n✅ Verificando tareas...");
    
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;
    
    for (const story of userStories) {
      const tasks = await getUserStoryTasks(story.id);
      totalTasks += tasks.length;
      
      console.log(`\n   Historia: ${story.title} (${tasks.length} tareas)`);
      
      for (const task of tasks) {
        console.log(`     - ${task.title} [${task.status}]`);
        
        switch (task.status) {
          case "done":
            completedTasks++;
            break;
          case "in_progress":
            inProgressTasks++;
            break;
          case "todo":
            todoTasks++;
            break;
        }
      }
    }
    
    console.log(`\n📊 Resumen de tareas:`);
    console.log(`   Total: ${totalTasks} tareas`);
    console.log(`   Completadas: ${completedTasks} tareas`);
    console.log(`   En progreso: ${inProgressTasks} tareas`);
    console.log(`   Por hacer: ${todoTasks} tareas`);
    console.log(`   Progreso: ${totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}%`);

    // 5. Calcular burndown ideal vs real
    console.log("\n📈 Cálculo de Burndown:");
    
    if (sprint1.startDate && sprint1.endDate) {
      const now = Date.now();
      const sprintDuration = Math.ceil((sprint1.endDate - sprint1.startDate) / (1000 * 60 * 60 * 24));
      const daysSinceStart = Math.ceil((now - sprint1.startDate) / (1000 * 60 * 60 * 24));
      
      const idealBurndownPerDay = totalPoints / sprintDuration;
      const idealRemainingToday = Math.max(0, totalPoints - (daysSinceStart * idealBurndownPerDay));
      const actualRemaining = totalPoints - completedPoints;
      
      console.log(`   Duración del sprint: ${sprintDuration} días`);
      console.log(`   Días transcurridos: ${daysSinceStart} días`);
      console.log(`   Burndown ideal por día: ${idealBurndownPerDay.toFixed(2)} puntos/día`);
      console.log(`   Puntos restantes (ideal): ${idealRemainingToday.toFixed(1)} puntos`);
      console.log(`   Puntos restantes (real): ${actualRemaining} puntos`);
      
      const difference = actualRemaining - idealRemainingToday;
      if (Math.abs(difference) < 1) {
        console.log(`   ✅ El sprint va según lo planificado`);
      } else if (difference < 0) {
        console.log(`   🚀 El sprint va ${Math.abs(difference).toFixed(1)} puntos por delante del cronograma`);
      } else {
        console.log(`   ⚠️  El sprint va ${difference.toFixed(1)} puntos por detrás del cronograma`);
      }
    } else {
      console.log("   ❌ No se puede calcular burndown sin fechas de inicio y fin");
    }

    // 6. Validaciones para el gráfico
    console.log("\n🔍 Validaciones para el gráfico de Burndown:");
    
    const validations = [];
    
    if (!sprint1.startDate || !sprint1.endDate) {
      validations.push("❌ ERROR: El sprint no tiene fechas de inicio y/o fin definidas");
    }
    
    if (userStories.length === 0) {
      validations.push("❌ ERROR: No hay historias de usuario asignadas al sprint");
    }
    
    if (totalPoints === 0) {
      validations.push("⚠️ WARNING: Las historias de usuario no tienen puntos asignados");
    }
    
    if (totalTasks === 0) {
      validations.push("⚠️ WARNING: No hay tareas creadas para las historias de usuario");
    }
    
    if (validations.length === 0) {
      console.log("   ✅ Todas las validaciones pasaron. El gráfico debería mostrar datos correctos.");
    } else {
      console.log("   Problemas encontrados:");
      validations.forEach(v => console.log(`   ${v}`));
    }

    // 7. URL para acceder al sprint
    console.log(`\n🌐 URL del sprint: http://localhost:8000/sprints/${sprint1.id}`);
    console.log(`🔧 URL de debug: http://localhost:8000/api/sprints/${sprint1.id}/burndown-debug`);

  } catch (error) {
    console.error("❌ Error al verificar el sprint:", error);
  }
}

if (import.meta.main) {
  await verifySprintBurndown();
  Deno.exit(0);
}
