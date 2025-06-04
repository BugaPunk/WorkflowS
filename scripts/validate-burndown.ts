#!/usr/bin/env -S deno run --unstable-kv -A

// Script para validar y corregir el burndown chart del proyecto vacío
import { updateUserStory } from "../models/userStory.ts";

async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("🧪 VALIDANDO BURNDOWN CHART");
    console.log("=".repeat(50));
    
    // Buscar proyecto "Proyecto vacio"
    const projects = [];
    for await (const entry of kv.list({ prefix: ["projects"] })) {
      projects.push(entry.value);
    }
    
    const emptyProject = projects.find(p => 
      p.name.toLowerCase().includes("vacio") || 
      p.name.toLowerCase().includes("vacío") ||
      p.name.toLowerCase().includes("empty")
    );
    
    if (!emptyProject) {
      console.log("❌ No se encontró el proyecto vacío");
      console.log("📋 Proyectos disponibles:");
      projects.forEach(p => console.log(`   - ${p.name} (${p.id})`));
      kv.close();
      return;
    }
    
    console.log(`✅ Proyecto encontrado: ${emptyProject.name} (${emptyProject.id})`);
    
    // Buscar historias de usuario del proyecto
    const userStories = [];
    for await (const entry of kv.list({ prefix: ["userStories"] })) {
      const story = entry.value;
      if (story.projectId === emptyProject.id) {
        userStories.push(story);
      }
    }
    
    console.log(`📖 Historias encontradas: ${userStories.length}`);
    
    if (userStories.length === 0) {
      console.log("❌ No hay historias de usuario en el proyecto");
      kv.close();
      return;
    }
    
    // Analizar la historia
    const story = userStories[0];
    console.log(`\n📝 Historia de Usuario:`);
    console.log(`   Título: ${story.title}`);
    console.log(`   Estado: ${story.status}`);
    console.log(`   Puntos: ${story.points || 0}`);
    console.log(`   Sprint: ${story.sprintId || 'Sin asignar'}`);
    
    // Si no tiene puntos, asignar algunos para la prueba
    if (!story.points || story.points === 0) {
      console.log(`\n🔧 Asignando puntos para validar burndown...`);
      
      const updatedStory = await updateUserStory(story.id, { 
        points: 5  // Asignar 5 puntos para la prueba
      });
      
      if (updatedStory) {
        console.log(`✅ Historia actualizada con 5 puntos`);
      } else {
        console.log(`❌ Error actualizando historia`);
        kv.close();
        return;
      }
    }
    
    // Buscar sprint activo del proyecto
    const sprints = [];
    for await (const entry of kv.list({ prefix: ["sprints"] })) {
      const sprint = entry.value;
      if (sprint.projectId === emptyProject.id) {
        sprints.push(sprint);
      }
    }
    
    const activeSprint = sprints.find(s => s.status === "active");
    
    if (!activeSprint) {
      console.log("❌ No hay sprint activo en el proyecto");
      kv.close();
      return;
    }
    
    console.log(`\n🏃 Sprint activo: ${activeSprint.name || activeSprint.id}`);
    console.log(`📅 Fechas: ${new Date(activeSprint.startDate).toLocaleDateString()} - ${new Date(activeSprint.endDate).toLocaleDateString()}`);
    
    // Buscar tareas de la historia
    const tasks = [];
    for await (const entry of kv.list({ prefix: ["tasks"] })) {
      const task = entry.value;
      if (task.userStoryId === story.id) {
        tasks.push(task);
      }
    }
    
    console.log(`\n📋 Tareas de la historia: ${tasks.length}`);
    tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title} - ${task.status}`);
    });
    
    // Verificar estado esperado para burndown
    console.log(`\n🎯 ESTADO ESPERADO PARA BURNDOWN:`);
    console.log(`   - Historia con puntos: ✅ ${story.points || 5} puntos`);
    console.log(`   - Tarea completada: ✅ ${tasks.filter(t => t.status === 'done').length}/${tasks.length}`);
    console.log(`   - Historia completada: ${story.status === 'done' ? '✅' : '❌'} ${story.status}`);
    
    if (story.status === 'done') {
      console.log(`\n📈 BURNDOWN ESPERADO:`);
      console.log(`   - Puntos iniciales: 5`);
      console.log(`   - Puntos completados: 5`);
      console.log(`   - Puntos restantes: 0`);
      console.log(`   - Progreso: 100%`);
    } else {
      console.log(`\n⚠️  La historia debería estar en estado 'done' para mostrar progreso completo`);
    }
    
    console.log(`\n💡 RECOMENDACIONES:`);
    console.log(`1. Recalcular burndown para el sprint: ${activeSprint.id}`);
    console.log(`2. Verificar que el gráfico muestre:`);
    console.log(`   - Línea ideal descendente de 5 a 0`);
    console.log(`   - Línea real que baja cuando se completó la historia`);
    console.log(`3. Si la historia no está 'done', cambiar su estado`);
    
    kv.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
