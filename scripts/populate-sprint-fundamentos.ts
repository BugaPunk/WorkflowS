#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllProjects } from "../models/project.ts";
import { getProjectSprints, addUserStoryToSprint } from "../models/sprint.ts";
import { createUserStory } from "../models/userStory.ts";
import { createTask } from "../models/task.ts";

async function populateSprintFundamentos() {
  console.log("🚀 Poblando Sprint 1 - Fundamentos con datos de ejemplo...\n");

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

    // 3. Crear historias de usuario para el sprint
    console.log("\n📝 Creando historias de usuario...");
    
    const userStories = [
      {
        title: "Implementar sistema de autenticación",
        description: "Como usuario, quiero poder iniciar sesión en el sistema para acceder a mis datos académicos",
        acceptanceCriteria: "- Formulario de login con email y contraseña\n- Validación de credenciales\n- Manejo de errores\n- Redirección después del login",
        priority: "high",
        points: 8,
        status: "in_progress"
      },
      {
        title: "Crear registro de nuevos usuarios",
        description: "Como administrador, quiero poder registrar nuevos usuarios en el sistema",
        acceptanceCriteria: "- Formulario de registro\n- Validación de datos\n- Asignación de roles\n- Confirmación por email",
        priority: "high",
        points: 5,
        status: "done"
      },
      {
        title: "Diseñar dashboard principal",
        description: "Como usuario, quiero ver un dashboard con información relevante al iniciar sesión",
        acceptanceCriteria: "- Layout responsivo\n- Widgets informativos\n- Navegación principal\n- Personalización básica",
        priority: "medium",
        points: 13,
        status: "todo"
      },
      {
        title: "Implementar gestión de perfiles",
        description: "Como usuario, quiero poder ver y editar mi perfil personal",
        acceptanceCriteria: "- Vista de perfil\n- Edición de datos personales\n- Cambio de contraseña\n- Subida de foto de perfil",
        priority: "medium",
        points: 8,
        status: "in_progress"
      }
    ];

    const createdUserStories = [];
    
    for (const storyData of userStories) {
      console.log(`   Creando: ${storyData.title}...`);
      
      const userStory = await createUserStory({
        title: storyData.title,
        description: storyData.description,
        acceptanceCriteria: storyData.acceptanceCriteria,
        priority: storyData.priority,
        points: storyData.points,
        projectId: project.id,
        status: storyData.status,
        assignedTo: null,
      });
      
      createdUserStories.push(userStory);
      
      // Asignar la historia de usuario al sprint
      await addUserStoryToSprint(sprint1.id, userStory.id);
      
      console.log(`   ✅ Historia creada y asignada al sprint`);
    }

    // 4. Crear tareas para cada historia de usuario
    console.log("\n✅ Creando tareas para las historias de usuario...");
    
    // Tareas para "Implementar sistema de autenticación"
    const authStory = createdUserStories[0];
    const authTasks = [
      {
        title: "Diseñar formulario de login",
        description: "Crear el diseño del formulario de inicio de sesión",
        status: "done",
        estimatedHours: 4,
        spentHours: 3
      },
      {
        title: "Implementar validación de credenciales",
        description: "Agregar lógica de validación en el backend",
        status: "done",
        estimatedHours: 6,
        spentHours: 5
      },
      {
        title: "Agregar manejo de errores",
        description: "Implementar mensajes de error y casos edge",
        status: "in_progress",
        estimatedHours: 3,
        spentHours: 1
      },
      {
        title: "Implementar redirección post-login",
        description: "Configurar redirección según el rol del usuario",
        status: "todo",
        estimatedHours: 2,
        spentHours: 0
      }
    ];

    for (const taskData of authTasks) {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        userStoryId: authStory.id,
        status: taskData.status,
        estimatedHours: taskData.estimatedHours,
        spentHours: taskData.spentHours,
        assignedTo: null,
        priority: "medium",
      });
    }
    console.log(`   ✅ ${authTasks.length} tareas creadas para "${authStory.title}"`);

    // Tareas para "Crear registro de nuevos usuarios"
    const registerStory = createdUserStories[1];
    const registerTasks = [
      {
        title: "Diseñar formulario de registro",
        description: "Crear interfaz para registro de usuarios",
        status: "done",
        estimatedHours: 3,
        spentHours: 2
      },
      {
        title: "Implementar validación de datos",
        description: "Validar email, contraseña y datos requeridos",
        status: "done",
        estimatedHours: 4,
        spentHours: 4
      },
      {
        title: "Configurar confirmación por email",
        description: "Enviar email de confirmación al registrarse",
        status: "done",
        estimatedHours: 5,
        spentHours: 6
      }
    ];

    for (const taskData of registerTasks) {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        userStoryId: registerStory.id,
        status: taskData.status,
        estimatedHours: taskData.estimatedHours,
        spentHours: taskData.spentHours,
        assignedTo: null,
        priority: "medium",
      });
    }
    console.log(`   ✅ ${registerTasks.length} tareas creadas para "${registerStory.title}"`);

    // Tareas para "Diseñar dashboard principal"
    const dashboardStory = createdUserStories[2];
    const dashboardTasks = [
      {
        title: "Crear wireframes del dashboard",
        description: "Diseñar la estructura y layout del dashboard",
        status: "todo",
        estimatedHours: 6,
        spentHours: 0
      },
      {
        title: "Implementar layout responsivo",
        description: "Crear estructura HTML/CSS responsiva",
        status: "todo",
        estimatedHours: 8,
        spentHours: 0
      },
      {
        title: "Desarrollar widgets informativos",
        description: "Crear componentes para mostrar información",
        status: "todo",
        estimatedHours: 10,
        spentHours: 0
      },
      {
        title: "Implementar navegación principal",
        description: "Crear menú de navegación y rutas",
        status: "todo",
        estimatedHours: 4,
        spentHours: 0
      }
    ];

    for (const taskData of dashboardTasks) {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        userStoryId: dashboardStory.id,
        status: taskData.status,
        estimatedHours: taskData.estimatedHours,
        spentHours: taskData.spentHours,
        assignedTo: null,
        priority: "medium",
      });
    }
    console.log(`   ✅ ${dashboardTasks.length} tareas creadas para "${dashboardStory.title}"`);

    // Tareas para "Implementar gestión de perfiles"
    const profileStory = createdUserStories[3];
    const profileTasks = [
      {
        title: "Crear vista de perfil",
        description: "Mostrar información del usuario",
        status: "done",
        estimatedHours: 4,
        spentHours: 3
      },
      {
        title: "Implementar edición de datos",
        description: "Permitir editar información personal",
        status: "in_progress",
        estimatedHours: 6,
        spentHours: 2
      },
      {
        title: "Agregar cambio de contraseña",
        description: "Funcionalidad para cambiar contraseña",
        status: "todo",
        estimatedHours: 4,
        spentHours: 0
      },
      {
        title: "Implementar subida de foto",
        description: "Permitir subir y cambiar foto de perfil",
        status: "todo",
        estimatedHours: 5,
        spentHours: 0
      }
    ];

    for (const taskData of profileTasks) {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        userStoryId: profileStory.id,
        status: taskData.status,
        estimatedHours: taskData.estimatedHours,
        spentHours: taskData.spentHours,
        assignedTo: null,
        priority: "medium",
      });
    }
    console.log(`   ✅ ${profileTasks.length} tareas creadas para "${profileStory.title}"`);

    // 5. Resumen final
    console.log("\n📊 Resumen de datos creados:");
    console.log(`   ✅ ${createdUserStories.length} historias de usuario`);
    console.log(`   ✅ ${authTasks.length + registerTasks.length + dashboardTasks.length + profileTasks.length} tareas`);
    
    const totalPoints = createdUserStories.reduce((sum, story) => sum + (story.points || 0), 0);
    const completedPoints = createdUserStories
      .filter(story => story.status === "done")
      .reduce((sum, story) => sum + (story.points || 0), 0);
    
    console.log(`   📈 Total de puntos: ${totalPoints}`);
    console.log(`   ✅ Puntos completados: ${completedPoints}`);
    console.log(`   📊 Progreso: ${((completedPoints / totalPoints) * 100).toFixed(1)}%`);

    console.log(`\n🌐 Ahora puedes ver el gráfico de Burndown en:`);
    console.log(`   http://localhost:8000/sprints/${sprint1.id}`);

  } catch (error) {
    console.error("❌ Error al poblar el sprint:", error);
  }
}

if (import.meta.main) {
  await populateSprintFundamentos();
  Deno.exit(0);
}
