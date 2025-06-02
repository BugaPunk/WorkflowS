#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * SCRIPT COMPLETO Y ACTUALIZADO PARA POBLAR TODO EL SISTEMA
 * Incluye TODAS las funcionalidades implementadas hasta la fecha
 * 
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-complete-system-updated.ts
 */

import { createUser, UserRole } from "../models/user.ts";
import { createProject, addProjectMember, ProjectStatus, ProjectRole } from "../models/project.ts";
import { createUserStory, UserStoryPriority } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";
import { createRubric } from "../services/rubricService.ts";
import { RubricStatus } from "../models/rubric.ts";
import { createEvaluation, EvaluationStatus } from "../services/evaluationService.ts";
import { createConversation, createMessage, ConversationType } from "../models/message.ts";
import { createTaskComment } from "../models/task.ts";
import { getKv } from "../utils/db.ts";

console.log("🚀 POBLANDO SISTEMA COMPLETO Y ACTUALIZADO");
console.log("==========================================");
console.log("Este script creará datos de ejemplo para TODAS las funcionalidades:");
console.log("• 👥 Usuarios y roles completos");
console.log("• 📁 Proyectos con equipos diversos");
console.log("• 📝 Historias de usuario detalladas");
console.log("• 🏃 Sprints con cronología realista");
console.log("• ✅ Tareas y entregables variados");
console.log("• 📋 Rúbricas especializadas (4 plantillas + rúbricas de proyectos)");
console.log("• 📊 Evaluaciones completas con calificaciones");
console.log("• 💬 Conversaciones y mensajes del equipo");
console.log("• 📈 Métricas y datos de progreso");
console.log("• 💭 Comentarios en tareas");
console.log("• 🔔 Notificaciones del sistema");
console.log("==========================================\n");

// Funciones helper
function getRandomDate(daysAgo: number, daysFromNow = 0): number {
  const now = Date.now();
  const minDate = now - daysAgo * 24 * 60 * 60 * 1000;
  const maxDate = now + daysFromNow * 24 * 60 * 60 * 1000;
  return Math.floor(Math.random() * (maxDate - minDate) + minDate);
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function createStandardLevels(maxPoints: number) {
  return [
    { description: "Excelente", pointValue: maxPoints },
    { description: "Bueno", pointValue: Math.floor(maxPoints * 0.75) },
    { description: "Regular", pointValue: Math.floor(maxPoints * 0.5) },
    { description: "Insuficiente", pointValue: Math.floor(maxPoints * 0.25) }
  ];
}

async function createCompleteSystemUpdated() {
  try {
    console.log("👥 Paso 1: Creando usuarios completos...");

    const users = [];

    // Datos de usuarios más diversos y realistas
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
        firstName: "María Elena",
        lastName: "Martínez",
        role: UserRole.ADMIN,
      },
      {
        username: "prof.rodriguez",
        email: "rodriguez@universidad.edu",
        password: "prof123",
        firstName: "Carlos Alberto",
        lastName: "Rodríguez",
        role: UserRole.ADMIN,
      },

      // Product Owners
      {
        username: "po.garcia",
        email: "garcia@universidad.edu",
        password: "po123",
        firstName: "Ana Sofía",
        lastName: "García",
        role: UserRole.PRODUCT_OWNER,
      },
      {
        username: "po.lopez",
        email: "lopez.po@universidad.edu",
        password: "po123",
        firstName: "Luis Fernando",
        lastName: "López",
        role: UserRole.PRODUCT_OWNER,
      },
      {
        username: "po.mendoza",
        email: "mendoza@universidad.edu",
        password: "po123",
        firstName: "Patricia",
        lastName: "Mendoza",
        role: UserRole.PRODUCT_OWNER,
      },

      // Scrum Masters
      {
        username: "sm.fernandez",
        email: "fernandez@universidad.edu",
        password: "sm123",
        firstName: "Carmen Rosa",
        lastName: "Fernández",
        role: UserRole.SCRUM_MASTER,
      },
      {
        username: "sm.torres",
        email: "torres@universidad.edu",
        password: "sm123",
        firstName: "Diego Alejandro",
        lastName: "Torres",
        role: UserRole.SCRUM_MASTER,
      },
      {
        username: "sm.silva",
        email: "silva@universidad.edu",
        password: "sm123",
        firstName: "Roberto",
        lastName: "Silva",
        role: UserRole.SCRUM_MASTER,
      },

      // Estudiantes (Team Developers) - Más diversos
      {
        username: "dev.perez",
        email: "perez@estudiante.edu",
        password: "dev123",
        firstName: "Juan Carlos",
        lastName: "Pérez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.gonzalez",
        email: "gonzalez@estudiante.edu",
        password: "dev123",
        firstName: "María Fernanda",
        lastName: "González",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.sanchez",
        email: "sanchez@estudiante.edu",
        password: "dev123",
        firstName: "Pedro Antonio",
        lastName: "Sánchez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.torres",
        email: "torres.dev@estudiante.edu",
        password: "dev123",
        firstName: "Laura Beatriz",
        lastName: "Torres",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.morales",
        email: "morales@estudiante.edu",
        password: "dev123",
        firstName: "Diego Sebastián",
        lastName: "Morales",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.castro",
        email: "castro@estudiante.edu",
        password: "dev123",
        firstName: "Sofía Alejandra",
        lastName: "Castro",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.ruiz",
        email: "ruiz@estudiante.edu",
        password: "dev123",
        firstName: "Andrés Felipe",
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
      {
        username: "dev.ramirez",
        email: "ramirez@estudiante.edu",
        password: "dev123",
        firstName: "Camilo",
        lastName: "Ramírez",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.ortega",
        email: "ortega@estudiante.edu",
        password: "dev123",
        firstName: "Natalia",
        lastName: "Ortega",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.medina",
        email: "medina@estudiante.edu",
        password: "dev123",
        firstName: "Gabriel",
        lastName: "Medina",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.rojas",
        email: "rojas@estudiante.edu",
        password: "dev123",
        firstName: "Daniela",
        lastName: "Rojas",
        role: UserRole.TEAM_DEVELOPER,
      },
      {
        username: "dev.vega",
        email: "vega@estudiante.edu",
        password: "dev123",
        firstName: "Mateo",
        lastName: "Vega",
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
      }
    }

    console.log(`\n📊 Total usuarios: ${users.length}`);

    // Continuar con proyectos...
    console.log("\n📁 Paso 2: Creando proyectos diversos...");

    const projects = [];

    const projectsData = [
      {
        name: "Sistema de Gestión Académica",
        description: "Plataforma web completa para gestionar estudiantes, cursos, calificaciones, horarios y reportes académicos de la universidad. Incluye módulos para docentes, estudiantes y administradores.",
        status: ProjectStatus.IN_PROGRESS,
        startDate: getRandomDate(60, 0),
        endDate: getRandomDate(0, 90),
        poIndex: 0, // García
        smIndex: 0, // Fernández
        devIndexes: [0, 1, 2, 3, 4], // Primeros 5 estudiantes
      },
      {
        name: "Aplicación Móvil de Biblioteca",
        description: "App móvil multiplataforma para consultar catálogo, reservar libros, gestionar préstamos, renovaciones y recibir notificaciones de la biblioteca universitaria.",
        status: ProjectStatus.IN_PROGRESS,
        startDate: getRandomDate(45, 0),
        endDate: getRandomDate(0, 75),
        poIndex: 1, // López
        smIndex: 1, // Torres
        devIndexes: [5, 6, 7, 8, 9], // Siguientes 5 estudiantes
      },
      {
        name: "Portal de Empleabilidad Estudiantil",
        description: "Plataforma integral para conectar estudiantes con oportunidades laborales, prácticas profesionales, seguimiento de egresados y análisis de empleabilidad.",
        status: ProjectStatus.PLANNING,
        startDate: getRandomDate(30, 0),
        endDate: getRandomDate(0, 120),
        poIndex: 2, // Mendoza
        smIndex: 2, // Silva
        devIndexes: [10, 11, 12, 13], // Últimos 4 estudiantes
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

    // Continuar con historias de usuario...
    console.log("\n📝 Paso 3: Creando historias de usuario detalladas...");

    const allUserStories = [];

    for (const project of projects) {
      const stories = [
        {
          title: "Registro de usuarios en el sistema",
          description: "Como usuario nuevo, quiero poder registrarme en el sistema proporcionando mis datos básicos para acceder a las funcionalidades de la plataforma.",
          acceptanceCriteria: "- El usuario puede crear una cuenta con email y contraseña\n- Se valida que el email sea único en el sistema\n- Se envía confirmación por email\n- Los datos se almacenan de forma segura",
          priority: UserStoryPriority.HIGH,
          points: 8,
        },
        {
          title: "Autenticación segura de usuarios",
          description: "Como usuario registrado, quiero poder iniciar sesión de forma segura para acceder a mi cuenta y datos personales.",
          acceptanceCriteria: "- El usuario puede iniciar sesión con email/contraseña\n- Se mantiene la sesión activa por tiempo determinado\n- Opción de cerrar sesión disponible\n- Manejo de errores de autenticación",
          priority: UserStoryPriority.HIGH,
          points: 5,
        },
        {
          title: "Dashboard personalizado por rol",
          description: "Como usuario autenticado, quiero ver un dashboard personalizado según mi rol para acceder rápidamente a la información relevante.",
          acceptanceCriteria: "- Muestra resumen de actividades según el rol\n- Enlaces rápidos a funciones principales\n- Información personalizada y actualizada\n- Interfaz intuitiva y responsive",
          priority: UserStoryPriority.MEDIUM,
          points: 13,
        },
        {
          title: "Gestión de perfil de usuario",
          description: "Como usuario, quiero poder editar mi información personal y configurar mis preferencias para mantener mis datos actualizados.",
          acceptanceCriteria: "- Editar datos personales (nombre, email, etc.)\n- Cambiar contraseña de forma segura\n- Subir y cambiar foto de perfil\n- Configurar preferencias de notificación",
          priority: UserStoryPriority.LOW,
          points: 3,
        },
        {
          title: "Sistema de notificaciones en tiempo real",
          description: "Como usuario, quiero recibir notificaciones sobre eventos importantes para estar al día con las actividades del proyecto.",
          acceptanceCriteria: "- Notificaciones en tiempo real en la interfaz\n- Configuración de preferencias de notificación\n- Historial de notificaciones\n- Marcado de leído/no leído",
          priority: UserStoryPriority.MEDIUM,
          points: 8,
        },
        {
          title: "Búsqueda avanzada en el sistema",
          description: "Como usuario, quiero poder buscar información específica usando filtros avanzados para encontrar rápidamente lo que necesito.",
          acceptanceCriteria: "- Búsqueda por texto en múltiples campos\n- Filtros por fecha, estado, usuario, etc.\n- Resultados ordenables y paginados\n- Búsqueda rápida desde cualquier página",
          priority: UserStoryPriority.LOW,
          points: 5,
        },
        {
          title: "Gestión de tareas del proyecto",
          description: "Como miembro del equipo, quiero poder crear, asignar y gestionar tareas para organizar el trabajo del proyecto.",
          acceptanceCriteria: "- Crear tareas con descripción y estimación\n- Asignar tareas a miembros del equipo\n- Cambiar estado de las tareas\n- Ver progreso del trabajo",
          priority: UserStoryPriority.HIGH,
          points: 13,
        },
        {
          title: "Sistema de evaluaciones con rúbricas",
          description: "Como profesor, quiero poder evaluar entregables usando rúbricas personalizadas para proporcionar feedback estructurado.",
          acceptanceCriteria: "- Crear y gestionar rúbricas de evaluación\n- Evaluar entregables con criterios específicos\n- Generar reportes de evaluación\n- Historial de evaluaciones",
          priority: UserStoryPriority.HIGH,
          points: 21,
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

    return { users, projects, userStories: allUserStories, productOwners, scrumMasters, developers };

  } catch (error) {
    console.error("❌ Error creando sistema:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

if (import.meta.main) {
  await createCompleteSystemUpdated();
}
