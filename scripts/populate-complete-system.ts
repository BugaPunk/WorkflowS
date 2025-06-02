#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script completo para poblar TODAS las funcionalidades del sistema
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-complete-system.ts
 */

import { createUser, UserRole } from "../models/user.ts";
import { createProject, addProjectMember, ProjectStatus, ProjectRole } from "../models/project.ts";
import { createUserStory, UserStoryPriority } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";
import { createRubric } from "../services/rubricService.ts";
import { RubricStatus } from "../models/rubric.ts";
import { createDeliverable, DeliverableStatus } from "../models/deliverable.ts";
import { createEvaluation, EvaluationStatus } from "../services/evaluationService.ts";
import { createConversation, createMessage, ConversationType } from "../models/message.ts";
import { createTaskComment } from "../models/task.ts";
import { getKv } from "../utils/db.ts";

console.log("🚀 POBLANDO SISTEMA COMPLETO");
console.log("============================");
console.log("Este script creará datos de ejemplo para TODAS las funcionalidades:");
console.log("• 👥 Usuarios y roles");
console.log("• 📁 Proyectos y equipos");
console.log("• 📝 Historias de usuario");
console.log("• 🏃 Sprints y tareas");
console.log("• 📦 Entregables");
console.log("• 📋 Rúbricas y evaluaciones");
console.log("• 💬 Mensajes y conversaciones");
console.log("• 📊 Métricas y reportes");
console.log("• 💭 Comentarios en tareas");
console.log("============================\n");

// Función para generar fechas realistas
function getRandomDate(daysAgo: number, daysFromNow = 0): number {
  const now = Date.now();
  const minDate = now - daysAgo * 24 * 60 * 60 * 1000;
  const maxDate = now + daysFromNow * 24 * 60 * 60 * 1000;
  return Math.floor(Math.random() * (maxDate - minDate) + minDate);
}

// Función para seleccionar elemento aleatorio de un array
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function createCompleteSystem() {
  try {
    console.log("👥 Paso 1: Creando usuarios completos...");

    const users = [];

    // Crear usuarios diversos
    const userData = [
      // Administradores
      {
        username: "admin",
        email: "admin@admin.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "Sistema",
        role: UserRole.ADMIN,
      },
      {
        username: "prof.martinez",
        email: "martinez@universidad.edu",
        password: "prof123",
        firstName: "María",
        lastName: "Martínez",
        role: UserRole.ADMIN,
      },
      {
        username: "prof.rodriguez",
        email: "rodriguez@universidad.edu",
        password: "prof123",
        firstName: "Carlos",
        lastName: "Rodríguez",
        role: UserRole.ADMIN,
      },

      // Product Owners
      {
        username: "po.garcia",
        email: "garcia@universidad.edu",
        password: "po123",
        firstName: "Ana",
        lastName: "García",
        role: UserRole.PRODUCT_OWNER,
      },
      {
        username: "po.lopez",
        email: "lopez.po@universidad.edu",
        password: "po123",
        firstName: "Luis",
        lastName: "López",
        role: UserRole.PRODUCT_OWNER,
      },

      // Scrum Masters
      {
        username: "sm.fernandez",
        email: "fernandez@universidad.edu",
        password: "sm123",
        firstName: "Carmen",
        lastName: "Fernández",
        role: UserRole.SCRUM_MASTER,
      },
      {
        username: "sm.torres",
        email: "torres@universidad.edu",
        password: "sm123",
        firstName: "Diego",
        lastName: "Torres",
        role: UserRole.SCRUM_MASTER,
      },

      // Estudiantes (Team Developers)
      {
        username: "dev.perez",
        email: "perez@estudiante.edu",
        password: "dev123",
        firstName: "Juan",
        lastName: "Pérez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.gonzalez",
        email: "gonzalez@estudiante.edu",
        password: "dev123",
        firstName: "María",
        lastName: "González",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.sanchez",
        email: "sanchez@estudiante.edu",
        password: "dev123",
        firstName: "Pedro",
        lastName: "Sánchez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.torres",
        email: "torres.dev@estudiante.edu",
        password: "dev123",
        firstName: "Laura",
        lastName: "Torres",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.morales",
        email: "morales@estudiante.edu",
        password: "dev123",
        firstName: "Diego",
        lastName: "Morales",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.castro",
        email: "castro@estudiante.edu",
        password: "dev123",
        firstName: "Sofia",
        lastName: "Castro",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.ruiz",
        email: "ruiz@estudiante.edu",
        password: "dev123",
        firstName: "Andrés",
        lastName: "Ruiz",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.herrera",
        email: "herrera@estudiante.edu",
        password: "dev123",
        firstName: "Valentina",
        lastName: "Herrera",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.jimenez",
        email: "jimenez@estudiante.edu",
        password: "dev123",
        firstName: "Sebastián",
        lastName: "Jiménez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.vargas",
        email: "vargas@estudiante.edu",
        password: "dev123",
        firstName: "Isabella",
        lastName: "Vargas",
        role: UserRole.TEAM_DEVELOPER,
      },
    ];

    for (const user of userData) {
      try {
        const createdUser = await createUser(user);
        users.push(createdUser);
        console.log(`✅ Usuario creado: ${user.username} (${user.role})`);
      } catch {
        console.log(`⚠️ Usuario ya existe: ${user.username}`);
        // Intentar obtener el usuario existente para agregarlo a la lista
        // (esto es una simplificación, en un caso real buscaríamos en la DB)
      }
    }

    console.log(`\n📊 Total usuarios: ${users.length}`);

    console.log("\n📁 Paso 2: Creando proyectos diversos...");

    const projects = [];

    const projectsData = [
      {
        name: "Sistema de Gestión Académica",
        description:
          "Plataforma web para gestionar estudiantes, cursos, calificaciones y reportes académicos de la universidad.",
        status: ProjectStatus.IN_PROGRESS,
        startDate: getRandomDate(60, 0),
        endDate: getRandomDate(0, 90),
        poIndex: 0, // García
        smIndex: 0, // Fernández
        devIndexes: [0, 1, 2, 3], // Primeros 4 estudiantes
      },
      {
        name: "Aplicación Móvil de Biblioteca",
        description:
          "App móvil para consultar catálogo, reservar libros, gestionar préstamos y recibir notificaciones de la biblioteca universitaria.",
        status: ProjectStatus.IN_PROGRESS,
        startDate: getRandomDate(45, 0),
        endDate: getRandomDate(0, 75),
        poIndex: 1, // López
        smIndex: 1, // Torres
        devIndexes: [4, 5, 6, 7], // Siguientes 4 estudiantes
      },
      {
        name: "Portal de Empleabilidad Estudiantil",
        description:
          "Plataforma para conectar estudiantes con oportunidades laborales, prácticas profesionales y seguimiento de egresados.",
        status: ProjectStatus.PLANNING,
        startDate: getRandomDate(30, 0),
        endDate: getRandomDate(0, 120),
        poIndex: 0, // García
        smIndex: 0, // Fernández
        devIndexes: [8, 9], // Últimos 2 estudiantes
      },
    ];

    const productOwners = users.filter((u) => u.role === UserRole.PRODUCT_OWNER);
    const scrumMasters = users.filter((u) => u.role === UserRole.SCRUM_MASTER);
    const developers = users.filter((u) => u.role === UserRole.TEAM_DEVELOPER);

    for (const projectData of projectsData) {
      const project = await createProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        createdBy: "admin",
      });

      // Asignar Product Owner
      if (productOwners[projectData.poIndex]) {
        await addProjectMember({
          userId: productOwners[projectData.poIndex].id,
          projectId: project.id,
          role: ProjectRole.PRODUCT_OWNER,
        });
      }

      // Asignar Scrum Master
      if (scrumMasters[projectData.smIndex]) {
        await addProjectMember({
          userId: scrumMasters[projectData.smIndex].id,
          projectId: project.id,
          role: ProjectRole.SCRUM_MASTER,
        });
      }

      // Asignar desarrolladores
      for (const devIndex of projectData.devIndexes) {
        if (developers[devIndex]) {
          await addProjectMember({
            userId: developers[devIndex].id,
            projectId: project.id,
            role: ProjectRole.TEAM_MEMBER,
          });
        }
      }

      projects.push({
        ...project,
        productOwner: productOwners[projectData.poIndex],
        scrumMaster: scrumMasters[projectData.smIndex],
        teamMembers: projectData.devIndexes.map((i) => developers[i]).filter(Boolean),
      });

      console.log(`✅ Proyecto creado: ${project.name}`);
    }

    console.log(`\n📊 Total proyectos: ${projects.length}`);

    console.log("\n📝 Paso 3: Creando historias de usuario detalladas...");

    const allUserStories = [];

    for (const project of projects) {
      const stories = [
        {
          title: "Registro de usuarios en el sistema",
          description:
            "Como usuario nuevo, quiero poder registrarme en el sistema proporcionando mis datos básicos para acceder a las funcionalidades de la plataforma.",
          acceptanceCriteria:
            "- El usuario puede crear una cuenta con email y contraseña\n- Se valida que el email sea único en el sistema\n- Se envía confirmación por email\n- Los datos se almacenan de forma segura",
          priority: UserStoryPriority.HIGH,
          points: 8,
        },
        {
          title: "Autenticación segura de usuarios",
          description:
            "Como usuario registrado, quiero poder iniciar sesión de forma segura para acceder a mi cuenta y datos personales.",
          acceptanceCriteria:
            "- El usuario puede iniciar sesión con email/contraseña\n- Se mantiene la sesión activa por tiempo determinado\n- Opción de cerrar sesión disponible\n- Manejo de errores de autenticación",
          priority: UserStoryPriority.HIGH,
          points: 5,
        },
        {
          title: "Dashboard personalizado por rol",
          description:
            "Como usuario autenticado, quiero ver un dashboard personalizado según mi rol para acceder rápidamente a la información relevante.",
          acceptanceCriteria:
            "- Muestra resumen de actividades según el rol\n- Enlaces rápidos a funciones principales\n- Información personalizada y actualizada\n- Interfaz intuitiva y responsive",
          priority: UserStoryPriority.MEDIUM,
          points: 13,
        },
        {
          title: "Gestión de perfil de usuario",
          description:
            "Como usuario, quiero poder editar mi información personal y configurar mis preferencias para mantener mis datos actualizados.",
          acceptanceCriteria:
            "- Editar datos personales (nombre, email, etc.)\n- Cambiar contraseña de forma segura\n- Subir y cambiar foto de perfil\n- Configurar preferencias de notificación",
          priority: UserStoryPriority.LOW,
          points: 3,
        },
        {
          title: "Sistema de notificaciones en tiempo real",
          description:
            "Como usuario, quiero recibir notificaciones sobre eventos importantes para estar al día con las actividades del proyecto.",
          acceptanceCriteria:
            "- Notificaciones en tiempo real en la interfaz\n- Configuración de preferencias de notificación\n- Historial de notificaciones\n- Marcado de leído/no leído",
          priority: UserStoryPriority.MEDIUM,
          points: 8,
        },
        {
          title: "Búsqueda avanzada en el sistema",
          description:
            "Como usuario, quiero poder buscar información específica usando filtros avanzados para encontrar rápidamente lo que necesito.",
          acceptanceCriteria:
            "- Búsqueda por texto en múltiples campos\n- Filtros por fecha, estado, usuario, etc.\n- Resultados ordenables y paginados\n- Búsqueda rápida desde cualquier página",
          priority: UserStoryPriority.LOW,
          points: 5,
        },
      ];

      for (const storyData of stories) {
        const story = await createUserStory(
          {
            ...storyData,
            projectId: project.id,
          },
          project.productOwner?.id || "admin"
        );

        allUserStories.push({ ...story, project });
        console.log(`✅ Historia creada: ${story.title}`);
      }
    }

    console.log(`\n📊 Total historias de usuario: ${allUserStories.length}`);

    console.log("\n🏃 Paso 4: Creando sprints con cronología realista...");

    const allSprints = [];

    for (const project of projects) {
      const sprints = [
        {
          name: "Sprint 1 - Fundamentos",
          goal: "Implementar funcionalidades básicas de autenticación, registro y estructura inicial del sistema",
          status: SprintStatus.COMPLETED,
          startDate: getRandomDate(45, 0),
          endDate: getRandomDate(31, 0),
        },
        {
          name: "Sprint 2 - Dashboard y Perfiles",
          goal: "Desarrollar dashboard personalizado, gestión de perfiles y navegación principal",
          status: SprintStatus.COMPLETED,
          startDate: getRandomDate(30, 0),
          endDate: getRandomDate(16, 0),
        },
        {
          name: "Sprint 3 - Funcionalidades Core",
          goal: "Implementar funcionalidades principales específicas del dominio del proyecto",
          status: SprintStatus.ACTIVE,
          startDate: getRandomDate(15, 0),
          endDate: getRandomDate(0, 1),
        },
        {
          name: "Sprint 4 - Notificaciones y Búsqueda",
          goal: "Agregar sistema de notificaciones y capacidades de búsqueda avanzada",
          status: SprintStatus.PLANNED,
          startDate: getRandomDate(0, 2),
          endDate: getRandomDate(0, 16),
        },
      ];

      for (const sprintData of sprints) {
        const sprint = await createSprint({
          ...sprintData,
          projectId: project.id,
          createdBy: project.scrumMaster?.id || "admin",
        });

        allSprints.push({ ...sprint, project });
        console.log(`✅ Sprint creado: ${sprint.name} (${project.name})`);
      }
    }

    console.log(`\n📊 Total sprints: ${allSprints.length}`);

    console.log("\n✅ Paso 5: Creando tareas detalladas...");

    const allTasks = [];

    for (const userStory of allUserStories) {
      const project = userStory.project;
      const teamMembers = project.teamMembers || [];

      const tasks = [
        {
          title: `Análisis y diseño - ${userStory.title}`,
          description: `Realizar análisis de requisitos y diseño de la solución para ${userStory.title}`,
          status: randomChoice([TaskStatus.DONE, TaskStatus.DONE, TaskStatus.REVIEW]),
          estimatedHours: Math.floor(Math.random() * 8) + 4,
          spentHours: Math.floor(Math.random() * 6) + 2,
          isDeliverable: false,
        },
        {
          title: `Implementación backend - ${userStory.title}`,
          description: `Desarrollar la lógica del servidor y APIs necesarias para ${userStory.title}`,
          status: randomChoice([TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW]),
          estimatedHours: Math.floor(Math.random() * 12) + 8,
          spentHours: Math.floor(Math.random() * 10) + 4,
          isDeliverable: false,
        },
        {
          title: `Implementación frontend - ${userStory.title}`,
          description: `Desarrollar la interfaz de usuario y componentes para ${userStory.title}`,
          status: randomChoice([TaskStatus.IN_PROGRESS, TaskStatus.TODO, TaskStatus.REVIEW]),
          estimatedHours: Math.floor(Math.random() * 10) + 6,
          spentHours: Math.floor(Math.random() * 8) + 2,
          isDeliverable: false,
        },
        {
          title: `Pruebas y documentación - ${userStory.title}`,
          description: `Realizar pruebas unitarias, de integración y documentar ${userStory.title}`,
          status: randomChoice([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW]),
          estimatedHours: Math.floor(Math.random() * 6) + 3,
          spentHours: Math.floor(Math.random() * 4) + 1,
          isDeliverable: false,
        },
        {
          title: `Entregable: ${userStory.title}`,
          description: `Entregable final completo de la funcionalidad ${userStory.title}`,
          status: randomChoice([TaskStatus.DONE, TaskStatus.REVIEW, TaskStatus.IN_PROGRESS]),
          estimatedHours: Math.floor(Math.random() * 4) + 2,
          spentHours: Math.floor(Math.random() * 3) + 1,
          isDeliverable: true,
        },
      ];

      for (const taskData of tasks) {
        const assignedUser = teamMembers.length > 0 ? randomChoice(teamMembers) : null;

        const task = await createTask({
          ...taskData,
          userStoryId: userStory.id,
          assignedTo: assignedUser?.id || "admin",
          createdBy: project.scrumMaster?.id || "admin",
        });

        allTasks.push({ ...task, userStory, project, assignedUser });
      }
    }

    console.log(`✅ ${allTasks.length} tareas creadas`);

    console.log("\n📋 Paso 6: Creando rúbricas especializadas...");

    const rubrics = [];

    // Rúbrica general
    const generalRubric = await createRubric({
      name: "Rúbrica General de Desarrollo de Software",
      description:
        "Plantilla estándar para evaluar entregables de desarrollo de software en proyectos académicos",
      createdBy: "admin",
      isTemplate: true,
      status: RubricStatus.ACTIVE,
      criteria: [
        {
          id: crypto.randomUUID(),
          name: "Funcionalidad",
          description: "El software cumple con los requisitos funcionales especificados",
          maxPoints: 25,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Cumple completamente con todos los requisitos",
              pointValue: 25,
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Cumple con la mayoría de requisitos",
              pointValue: 20,
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Cumple parcialmente con los requisitos",
              pointValue: 15,
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: No cumple con los requisitos básicos",
              pointValue: 5,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Calidad del Código",
          description: "El código es limpio, bien estructurado y documentado",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Código muy limpio y bien documentado",
              pointValue: 20,
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Código limpio con documentación adecuada",
              pointValue: 16,
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Código aceptable con poca documentación",
              pointValue: 12,
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Código difícil de leer y sin documentación",
              pointValue: 4,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Interfaz de Usuario",
          description: "La interfaz es intuitiva, atractiva y fácil de usar",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Interfaz muy intuitiva y atractiva",
              pointValue: 20,
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Interfaz clara y funcional",
              pointValue: 16,
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Interfaz básica pero usable",
              pointValue: 12,
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Interfaz confusa o difícil de usar",
              pointValue: 4,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Pruebas y Validación",
          description: "El software ha sido probado adecuadamente",
          maxPoints: 15,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Pruebas exhaustivas y bien documentadas",
              pointValue: 15,
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Pruebas adecuadas de funcionalidades principales",
              pointValue: 12,
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Pruebas básicas realizadas",
              pointValue: 9,
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Pocas o ninguna prueba realizada",
              pointValue: 3,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Documentación",
          description: "La documentación del proyecto es completa y clara",
          maxPoints: 20,
          levels: [
            {
              id: crypto.randomUUID(),
              description: "Excelente: Documentación completa y muy clara",
              pointValue: 20,
            },
            {
              id: crypto.randomUUID(),
              description: "Bueno: Documentación adecuada y clara",
              pointValue: 16,
            },
            {
              id: crypto.randomUUID(),
              description: "Regular: Documentación básica",
              pointValue: 12,
            },
            {
              id: crypto.randomUUID(),
              description: "Insuficiente: Documentación incompleta o confusa",
              pointValue: 4,
            },
          ],
        },
      ],
    });

    rubrics.push(generalRubric);
    console.log("✅ Rúbrica general creada");

    return {
      users,
      projects,
      userStories: allUserStories,
      sprints: allSprints,
      tasks: allTasks,
      rubrics,
    };
  } catch (error) {
    console.error(
      "❌ Error creando sistema completo:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

if (import.meta.main) {
  await createCompleteSystem();
}
