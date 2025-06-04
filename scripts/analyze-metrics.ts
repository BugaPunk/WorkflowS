#!/usr/bin/env -S deno run --unstable-kv -A

// Script para analizar las métricas reales del proyecto
async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("=== ANÁLISIS DE MÉTRICAS REALES ===\n");
    
    // Analizar tareas
    const tasks = [];
    for await (const entry of kv.list({ prefix: ["tasks"] })) {
      if (entry.key.length === 2) {
        tasks.push(entry.value);
      }
    }
    
    console.log("📋 TAREAS:");
    console.log(`Total tareas: ${tasks.length}`);
    
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log("Por estado:", tasksByStatus);
    
    const completedTasks = tasksByStatus.done || 0;
    const inProgressTasks = (tasksByStatus.in_progress || 0) + (tasksByStatus.review || 0);
    const todoTasks = tasksByStatus.todo || 0;
    const blockedTasks = tasksByStatus.blocked || 0;
    
    console.log(`- Completadas: ${completedTasks} (${Math.round((completedTasks / tasks.length) * 100)}%)`);
    console.log(`- En progreso: ${inProgressTasks} (${Math.round((inProgressTasks / tasks.length) * 100)}%)`);
    console.log(`- Por hacer: ${todoTasks} (${Math.round((todoTasks / tasks.length) * 100)}%)`);
    console.log(`- Bloqueadas: ${blockedTasks} (${Math.round((blockedTasks / tasks.length) * 100)}%)`);
    
    // Analizar historias de usuario
    const userStories = [];
    for await (const entry of kv.list({ prefix: ["userStories"] })) {
      userStories.push(entry.value);
    }
    
    console.log("\n📖 HISTORIAS DE USUARIO:");
    console.log(`Total historias: ${userStories.length}`);
    
    const storiesByStatus = userStories.reduce((acc, story) => {
      acc[story.status] = (acc[story.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log("Por estado:", storiesByStatus);
    
    const totalPoints = userStories.reduce((sum, story) => sum + (story.points || 0), 0);
    const completedStories = userStories.filter(s => s.status === "done");
    const completedPoints = completedStories.reduce((sum, story) => sum + (story.points || 0), 0);
    
    console.log(`Total puntos: ${totalPoints}`);
    console.log(`Puntos completados: ${completedPoints}`);
    console.log(`Progreso por puntos: ${Math.round((completedPoints / totalPoints) * 100)}%`);
    console.log(`Progreso por historias: ${Math.round((completedStories.length / userStories.length) * 100)}%`);
    
    // Analizar asignaciones
    console.log("\n👥 ASIGNACIONES:");
    const assignedTasks = tasks.filter(t => t.assignedTo);
    const unassignedTasks = tasks.filter(t => !t.assignedTo);
    
    console.log(`Tareas asignadas: ${assignedTasks.length}`);
    console.log(`Tareas sin asignar: ${unassignedTasks.length}`);
    
    // Analizar horas
    console.log("\n⏰ HORAS:");
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalSpentHours = tasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);
    
    console.log(`Horas estimadas: ${totalEstimatedHours}`);
    console.log(`Horas gastadas: ${totalSpentHours}`);
    console.log(`Eficiencia: ${totalEstimatedHours > 0 ? Math.round((totalSpentHours / totalEstimatedHours) * 100) : 0}%`);
    
    // Analizar sprints
    const sprints = [];
    for await (const entry of kv.list({ prefix: ["sprints"] })) {
      sprints.push(entry.value);
    }
    
    console.log("\n🏃 SPRINTS:");
    console.log(`Total sprints: ${sprints.length}`);
    
    const activeSprints = sprints.filter(s => s.status === "active");
    console.log(`Sprints activos: ${activeSprints.length}`);
    
    // Calcular velocidad real
    if (activeSprints.length > 0) {
      const velocity = completedPoints / Math.max(sprints.length, 1);
      console.log(`Velocidad del equipo: ${Math.round(velocity * 10) / 10} puntos por sprint`);
    }
    
    // Problemas identificados
    console.log("\n⚠️  PROBLEMAS IDENTIFICADOS:");
    
    if (completedStories.length === 0) {
      console.log("- ❌ NO HAY HISTORIAS COMPLETADAS - El progreso real es 0%");
    }
    
    if (unassignedTasks.length > 0) {
      console.log(`- ⚠️  ${unassignedTasks.length} tareas sin asignar`);
    }
    
    if (totalSpentHours > totalEstimatedHours * 1.2) {
      console.log("- ⚠️  Se están gastando más horas de las estimadas");
    }
    
    if (inProgressTasks === 0 && todoTasks > 0) {
      console.log("- ⚠️  No hay tareas en progreso pero sí pendientes");
    }
    
    // Recomendaciones
    console.log("\n💡 RECOMENDACIONES:");
    console.log("1. Completar al menos una historia de usuario para mostrar progreso real");
    console.log("2. Asignar las tareas pendientes a miembros del equipo");
    console.log("3. Mover historias de 'backlog' a 'in_progress' o 'done' según corresponda");
    console.log("4. Actualizar el estado de las tareas que están realmente completadas");
    
    kv.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
