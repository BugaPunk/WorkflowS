#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para agregar datos de ejemplo a un sprint
 * Ejecutar con: deno run --unstable-kv -A scripts/add-sprint-data.ts <sprintId>
 */

import { getSprintById, updateSprint } from "../models/sprint.ts";
import { createUserStory, getUserStoryById, updateUserStory } from "../models/userStory.ts";
import { createTask } from "../models/task.ts";
import { calculateBurndown } from "../services/metricService.ts";

async function addSprintData() {
  // Obtener el ID del sprint de los argumentos
  const sprintId = Deno.args[0];
  
  if (!sprintId) {
    console.error("❌ Error: Debe proporcionar un ID de sprint");
    console.log("Uso: deno run --unstable-kv -A scripts/add-sprint-data.ts <sprintId>");
    Deno.exit(1);
  }
  
  console.log(`🔄 Agregando datos de ejemplo al sprint ${sprintId}...`);
  
  try {
    // Verificar que el sprint existe
    const sprint = await getSprintById(sprintId);
    if (!sprint) {
      console.error(`❌ Error: Sprint con ID ${sprintId} no encontrado`);
      Deno.exit(1);
    }
    
    console.log(`✅ Sprint encontrado: ${sprint.name}`);
    
    // Crear historias de usuario de ejemplo si no existen
    if (!sprint.userStoryIds || sprint.userStoryIds.length === 0) {
      console.log("📝 Creando historias de usuario de ejemplo...");
      
      const userStories = [];
      
      // Historia 1
      const userStory1 = await createUserStory({
        title: "Implementar autenticación de usuarios",
        description: "Como usuario, quiero poder iniciar sesión en la aplicación para acceder a mis datos personales",
        acceptanceCriteria: "- Formulario de inicio de sesión\n- Validación de credenciales\n- Manejo de errores",
        priority: "high",
        points: 8,
        projectId: sprint.projectId,
        status: "in_progress",
        assignedTo: null,
      });
      userStories.push(userStory1);
      
      // Historia 2
      const userStory2 = await createUserStory({
        title: "Diseñar interfaz de dashboard",
        description: "Como usuario, quiero ver un dashboard con información relevante al iniciar sesión",
        acceptanceCriteria: "- Mostrar estadísticas principales\n- Diseño responsive\n- Gráficos interactivos",
        priority: "medium",
        points: 5,
        projectId: sprint.projectId,
        status: "in_progress",
        assignedTo: null,
      });
      userStories.push(userStory2);
      
      // Historia 3
      const userStory3 = await createUserStory({
        title: "Implementar gestión de tareas",
        description: "Como usuario, quiero poder crear, editar y eliminar tareas",
        acceptanceCriteria: "- CRUD de tareas\n- Asignación de tareas\n- Filtros y búsqueda",
        priority: "high",
        points: 13,
        projectId: sprint.projectId,
        status: "todo",
        assignedTo: null,
      });
      userStories.push(userStory3);
      
      // Actualizar el sprint con las nuevas historias de usuario
      const userStoryIds = userStories.map(us => us.id);
      await updateSprint(sprintId, {
        userStoryIds,
      });
      
      console.log(`✅ Creadas ${userStories.length} historias de usuario`);
      
      // Crear tareas para cada historia de usuario
      console.log("📝 Creando tareas para las historias de usuario...");
      
      // Tareas para Historia 1
      const tasks1 = [
        {
          title: "Diseñar formulario de login",
          description: "Crear el diseño del formulario de inicio de sesión con campos de usuario y contraseña",
          status: "done",
          priority: "medium",
          userStoryId: userStory1.id,
          assignedTo: null,
          estimatedHours: 3,
          spentHours: 2,
        },
        {
          title: "Implementar validación de formulario",
          description: "Agregar validación de campos y mostrar mensajes de error",
          status: "done",
          priority: "medium",
          userStoryId: userStory1.id,
          assignedTo: null,
          estimatedHours: 4,
          spentHours: 3,
        },
        {
          title: "Integrar con API de autenticación",
          description: "Conectar el formulario con el endpoint de autenticación",
          status: "in_progress",
          priority: "high",
          userStoryId: userStory1.id,
          assignedTo: null,
          estimatedHours: 5,
          spentHours: 2,
        },
      ];
      
      // Tareas para Historia 2
      const tasks2 = [
        {
          title: "Diseñar layout del dashboard",
          description: "Crear el diseño general del dashboard con secciones principales",
          status: "done",
          priority: "medium",
          userStoryId: userStory2.id,
          assignedTo: null,
          estimatedHours: 4,
          spentHours: 4,
        },
        {
          title: "Implementar widgets de estadísticas",
          description: "Crear componentes para mostrar estadísticas clave",
          status: "in_progress",
          priority: "medium",
          userStoryId: userStory2.id,
          assignedTo: null,
          estimatedHours: 6,
          spentHours: 3,
        },
      ];
      
      // Tareas para Historia 3
      const tasks3 = [
        {
          title: "Diseñar interfaz de gestión de tareas",
          description: "Crear el diseño de la interfaz para gestionar tareas",
          status: "todo",
          priority: "medium",
          userStoryId: userStory3.id,
          assignedTo: null,
          estimatedHours: 4,
          spentHours: 0,
        },
        {
          title: "Implementar CRUD de tareas",
          description: "Desarrollar la lógica para crear, leer, actualizar y eliminar tareas",
          status: "todo",
          priority: "high",
          userStoryId: userStory3.id,
          assignedTo: null,
          estimatedHours: 8,
          spentHours: 0,
        },
        {
          title: "Implementar filtros y búsqueda",
          description: "Agregar funcionalidad de filtrado y búsqueda de tareas",
          status: "todo",
          priority: "low",
          userStoryId: userStory3.id,
          assignedTo: null,
          estimatedHours: 5,
          spentHours: 0,
        },
      ];
      
      // Crear todas las tareas
      const allTasks = [...tasks1, ...tasks2, ...tasks3];
      for (const taskData of allTasks) {
        await createTask(taskData);
      }
      
      console.log(`✅ Creadas ${allTasks.length} tareas`);
      
      // Actualizar fechas de las historias de usuario para simular progreso
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // Historia 1: Actualizada hace 5 días
      await updateUserStory(userStory1.id, {
        updatedAt: now - (5 * oneDay),
      });
      
      // Historia 2: Actualizada hace 3 días
      await updateUserStory(userStory2.id, {
        updatedAt: now - (3 * oneDay),
      });
      
      // Historia 3: Actualizada hoy
      await updateUserStory(userStory3.id, {
        updatedAt: now,
      });
      
      console.log("✅ Actualizadas fechas de las historias de usuario");
    } else {
      console.log(`ℹ️ El sprint ya tiene ${sprint.userStoryIds.length} historias de usuario asignadas`);
      
      // Verificar si las historias tienen puntos asignados
      let needsPoints = false;
      for (const userStoryId of sprint.userStoryIds) {
        const userStory = await getUserStoryById(userStoryId);
        if (userStory && (!userStory.points || userStory.points === 0)) {
          needsPoints = true;
          await updateUserStory(userStoryId, {
            points: Math.floor(Math.random() * 13) + 3, // Asignar entre 3 y 15 puntos
          });
        }
      }
      
      if (needsPoints) {
        console.log("✅ Asignados puntos a las historias de usuario que no los tenían");
      } else {
        console.log("ℹ️ Todas las historias de usuario ya tienen puntos asignados");
      }
    }
    
    // Generar datos de burndown
    console.log("📊 Generando datos de burndown...");
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
    }
    
    console.log("\n🎉 ¡Datos agregados exitosamente al sprint!");
    
  } catch (error) {
    console.error("❌ Error al agregar datos al sprint:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await addSprintData();
}