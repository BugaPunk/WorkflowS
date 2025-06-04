#!/usr/bin/env -S deno run --unstable-kv -A

// Script para importar datos desde un archivo JSON a Deno KV
import { getKv } from "../utils/db.ts";

async function main() {
  try {
    // Verificar si se proporcionó un archivo
    const args = Deno.args;
    const filePath = args[0] || "./kv-data-export.json";
    
    console.log(`Importando datos desde ${filePath}...`);
    
    // Leer el archivo JSON
    const jsonData = await Deno.readTextFile(filePath);
    const importData = JSON.parse(jsonData);
    
    // Abrir la base de datos KV
    const kv = getKv();
    
    // Importar usuarios
    console.log("Importando usuarios...");
    for (const item of importData.users) {
      await kv.set(item.key, item.value);
      // También importar índices por email y username
      if (item.value.email) {
        await kv.set(["users", "by_email", item.value.email], item.key[1]);
      }
      if (item.value.username) {
        await kv.set(["users", "by_username", item.value.username], item.key[1]);
      }
    }
    
    // Importar sesiones
    console.log("Importando sesiones...");
    for (const item of importData.sessions) {
      await kv.set(item.key, item.value);
    }
    
    // Importar proyectos
    console.log("Importando proyectos...");
    for (const item of importData.projects) {
      await kv.set(item.key, item.value);
    }
    
    // Importar miembros de proyectos
    console.log("Importando miembros de proyectos...");
    for (const item of importData.projectMembers) {
      await kv.set(item.key, item.value);
      
      // Crear índices para miembros de proyectos
      if (item.value.userId && item.value.projectId) {
        await kv.set(
          ["project_members", "by_user_project", item.value.userId, item.value.projectId],
          item.key[1]
        );
        await kv.set(
          ["project_members", "by_project", item.value.projectId, item.value.userId],
          item.key[1]
        );
        await kv.set(
          ["project_members", "by_user", item.value.userId, item.value.projectId],
          item.key[1]
        );
      }
    }
    
    // Importar historias de usuario
    console.log("Importando historias de usuario...");
    for (const item of importData.userStories) {
      await kv.set(item.key, item.value);
      
      // Crear índices para historias de usuario
      if (item.value.projectId) {
        await kv.set(
          ["userStories", "by_project", item.value.projectId, item.key[1]],
          true
        );
      }
    }
    
    // Importar tareas
    console.log("Importando tareas...");
    for (const item of importData.tasks) {
      await kv.set(item.key, item.value);
      
      // Crear índices para tareas
      if (item.value.userStoryId) {
        await kv.set(
          ["tasks", "by_userStory", item.value.userStoryId, item.key[1]],
          true
        );
      }
      if (item.value.assignedTo) {
        await kv.set(
          ["tasks", "by_assignee", item.value.assignedTo, item.key[1]],
          true
        );
      }
    }
    
    // Importar sprints
    console.log("Importando sprints...");
    for (const item of importData.sprints) {
      await kv.set(item.key, item.value);
      
      // Crear índices para sprints
      if (item.value.projectId) {
        await kv.set(
          ["sprints", "by_project", item.value.projectId, item.key[1]],
          true
        );
      }
    }
    
    // Importar entregables
    console.log("Importando entregables...");
    for (const item of importData.deliverables) {
      await kv.set(item.key, item.value);
    }
    
    // Importar rúbricas
    console.log("Importando rúbricas...");
    for (const item of importData.rubrics) {
      await kv.set(item.key, item.value);
    }
    
    // Importar evaluaciones
    console.log("Importando evaluaciones...");
    for (const item of importData.evaluations) {
      await kv.set(item.key, item.value);
    }
    
    // Importar reportes
    console.log("Importando reportes...");
    for (const item of importData.reports) {
      await kv.set(item.key, item.value);
    }
    
    // Importar historias de usuario en sprints
    console.log("Importando historias de usuario en sprints...");
    for (const item of importData.sprintUserStories) {
      await kv.set(item.key, item.value);
    }
    
    // Importar historial de tareas
    console.log("Importando historial de tareas...");
    for (const item of importData.taskHistory) {
      await kv.set(item.key, item.value);
    }
    
    // Importar comentarios
    console.log("Importando comentarios...");
    for (const item of importData.comments) {
      await kv.set(item.key, item.value);
    }
    
    // Importar métricas
    console.log("Importando métricas...");
    for (const item of importData.metrics) {
      await kv.set(item.key, item.value);
    }
    
    console.log("Importación completada con éxito.");
    
    // Cerrar la base de datos
    kv.close();
  } catch (error) {
    console.error("Error al importar datos a Deno KV:", error);
  }
}

main();