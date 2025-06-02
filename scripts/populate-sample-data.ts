#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para poblar la base de datos Deno KV con datos de ejemplo
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-sample-data.ts
 */

import { createUser, UserRole } from "../models/user.ts";
import { createProject, addUserToProject, ProjectStatus } from "../models/project.ts";
import { createUserStory, UserStoryPriority } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";
import { createRubric } from "../services/rubricService.ts";
import { RubricStatus } from "../models/rubric.ts";

console.log("🚀 Iniciando población de datos de ejemplo...");

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

async function populateUsers() {
  console.log("👥 Creando usuarios de ejemplo...");

  const users = [
    // Administradores
    {
      username: "admin",
      email: "admin@admin.com",
      password: "admin123",
      firstName: "Administrador",
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

    // Product Owners
    {
      username: "po.garcia",
      email: "garcia@universidad.edu",
      password: "po123",
      firstName: "Carlos",
      lastName: "García",
      role: UserRole.PRODUCT_OWNER,
    },
    {
      username: "po.rodriguez",
      email: "rodriguez@universidad.edu",
      password: "po123",
      firstName: "Ana",
      lastName: "Rodríguez",
      role: UserRole.PRODUCT_OWNER,
    },

    // Scrum Masters
    {
      username: "sm.lopez",
      email: "lopez@universidad.edu",
      password: "sm123",
      firstName: "Luis",
      lastName: "López",
      role: UserRole.SCRUM_MASTER,
    },
    {
      username: "sm.fernandez",
      email: "fernandez@universidad.edu",
      password: "sm123",
      firstName: "Carmen",
      lastName: "Fernández",
      role: UserRole.SCRUM_MASTER,
    },

    // Team Developers (Estudiantes)
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
      email: "torres@estudiante.edu",
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
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      const user = await createUser(userData);
      createdUsers.push(user);
      console.log(`✅ Usuario creado: ${user.username} (${user.role})`);
    } catch (error) {
      console.log(`⚠️ Usuario ya existe: ${userData.username}`);
    }
  }

  return createdUsers;
}

async function populateProjects(users: any[]) {
  console.log("📁 Creando proyectos de ejemplo...");

  const admin = users.find((u) => u.role === UserRole.ADMIN);
  const productOwners = users.filter((u) => u.role === UserRole.PRODUCT_OWNER);
  const scrumMasters = users.filter((u) => u.role === UserRole.SCRUM_MASTER);
  const developers = users.filter((u) => u.role === UserRole.TEAM_DEVELOPER);

  const projects = [
    {
      name: "Sistema de Gestión Académica",
      description:
        "Desarrollo de un sistema web para gestionar estudiantes, cursos y calificaciones de la universidad.",
      startDate: getRandomDate(60, 0),
      endDate: getRandomDate(0, 90),
      createdBy: admin.id,
      productOwner: productOwners[0],
      scrumMaster: scrumMasters[0],
      teamMembers: developers.slice(0, 3),
    },
    {
      name: "Aplicación Móvil de Biblioteca",
      description:
        "App móvil para consultar catálogo, reservar libros y gestionar préstamos de la biblioteca universitaria.",
      startDate: getRandomDate(45, 0),
      endDate: getRandomDate(0, 75),
      createdBy: admin.id,
      productOwner: productOwners[1],
      scrumMaster: scrumMasters[1],
      teamMembers: developers.slice(3, 6),
    },
    {
      name: "Portal de Empleabilidad",
      description:
        "Plataforma web para conectar estudiantes con oportunidades laborales y prácticas profesionales.",
      startDate: getRandomDate(30, 0),
      endDate: getRandomDate(0, 120),
      createdBy: admin.id,
      productOwner: productOwners[0],
      scrumMaster: scrumMasters[0],
      teamMembers: [developers[0], developers[2], developers[4]],
    },
  ];

  const createdProjects = [];
  for (const projectData of projects) {
    const project = await createProject({
      name: projectData.name,
      description: projectData.description,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      createdBy: projectData.createdBy,
    });

    // Asignar Product Owner
    await addUserToProject(project.id, projectData.productOwner.id, UserRole.PRODUCT_OWNER);

    // Asignar Scrum Master
    await addUserToProject(project.id, projectData.scrumMaster.id, UserRole.SCRUM_MASTER);

    // Asignar desarrolladores
    for (const dev of projectData.teamMembers) {
      await addUserToProject(project.id, dev.id, UserRole.TEAM_DEVELOPER);
    }

    createdProjects.push({
      ...project,
      productOwner: projectData.productOwner,
      scrumMaster: projectData.scrumMaster,
      teamMembers: projectData.teamMembers,
    });

    console.log(`✅ Proyecto creado: ${project.name}`);
  }

  return createdProjects;
}

async function populateUserStories(projects: any[]) {
  console.log("📝 Creando historias de usuario...");

  const userStories = [];

  for (const project of projects) {
    const stories = [
      {
        title: "Registro de usuarios",
        description:
          "Como usuario nuevo, quiero poder registrarme en el sistema para acceder a las funcionalidades.",
        acceptanceCriteria:
          "- El usuario puede crear una cuenta con email y contraseña\n- Se valida que el email sea único\n- Se envía confirmación por email",
        priority: UserStoryPriority.HIGH,
        points: 8,
        projectId: project.id,
        createdBy: project.productOwner.id,
      },
      {
        title: "Autenticación de usuarios",
        description:
          "Como usuario registrado, quiero poder iniciar sesión para acceder a mi cuenta.",
        acceptanceCriteria:
          "- El usuario puede iniciar sesión con email/contraseña\n- Se mantiene la sesión activa\n- Opción de cerrar sesión",
        priority: UserStoryPriority.HIGH,
        points: 5,
        projectId: project.id,
        createdBy: project.productOwner.id,
      },
      {
        title: "Dashboard principal",
        description: "Como usuario autenticado, quiero ver un dashboard con información relevante.",
        acceptanceCriteria:
          "- Muestra resumen de actividades\n- Enlaces rápidos a funciones principales\n- Información personalizada por rol",
        priority: UserStoryPriority.MEDIUM,
        points: 13,
        projectId: project.id,
        createdBy: project.productOwner.id,
      },
      {
        title: "Gestión de perfil",
        description: "Como usuario, quiero poder editar mi información personal.",
        acceptanceCriteria:
          "- Editar datos personales\n- Cambiar contraseña\n- Subir foto de perfil",
        priority: UserStoryPriority.LOW,
        points: 3,
        projectId: project.id,
        createdBy: project.productOwner.id,
      },
      {
        title: "Sistema de notificaciones",
        description: "Como usuario, quiero recibir notificaciones sobre eventos importantes.",
        acceptanceCriteria:
          "- Notificaciones en tiempo real\n- Configuración de preferencias\n- Historial de notificaciones",
        priority: UserStoryPriority.MEDIUM,
        points: 8,
        projectId: project.id,
        createdBy: project.productOwner.id,
      },
    ];

    for (const storyData of stories) {
      const story = await createUserStory(storyData, storyData.createdBy);
      userStories.push(story);
    }
  }

  console.log(`✅ ${userStories.length} historias de usuario creadas`);
  return userStories;
}

async function populateSprints(projects: any[]) {
  console.log("🏃 Creando sprints...");

  const sprints = [];

  for (const project of projects) {
    const projectSprints = [
      {
        name: "Sprint 1 - Fundamentos",
        goal: "Implementar funcionalidades básicas de autenticación y registro",
        projectId: project.id,
        status: SprintStatus.COMPLETED,
        startDate: getRandomDate(45, 0),
        endDate: getRandomDate(31, 0),
        createdBy: project.scrumMaster.id,
      },
      {
        name: "Sprint 2 - Dashboard",
        goal: "Desarrollar dashboard principal y gestión de perfil",
        projectId: project.id,
        status: SprintStatus.COMPLETED,
        startDate: getRandomDate(30, 0),
        endDate: getRandomDate(16, 0),
        createdBy: project.scrumMaster.id,
      },
      {
        name: "Sprint 3 - Funcionalidades Avanzadas",
        goal: "Implementar notificaciones y funcionalidades específicas del dominio",
        projectId: project.id,
        status: SprintStatus.ACTIVE,
        startDate: getRandomDate(15, 0),
        endDate: getRandomDate(0, 1),
        createdBy: project.scrumMaster.id,
      },
      {
        name: "Sprint 4 - Optimización",
        goal: "Optimizar rendimiento y agregar funcionalidades adicionales",
        projectId: project.id,
        status: SprintStatus.PLANNED,
        startDate: getRandomDate(0, 2),
        endDate: getRandomDate(0, 16),
        createdBy: project.scrumMaster.id,
      },
    ];

    for (const sprintData of projectSprints) {
      const sprint = await createSprint(sprintData);
      sprints.push({ ...sprint, project });
    }
  }

  console.log(`✅ ${sprints.length} sprints creados`);
  return sprints;
}

async function populateTasks(userStories: any[], projects: any[]) {
  console.log("✅ Creando tareas...");

  const tasks = [];

  for (const story of userStories) {
    const project = projects.find((p) => p.id === story.projectId);
    const teamMembers = project.teamMembers;

    const storyTasks = [
      {
        title: `Diseño de interfaz - ${story.title}`,
        description: `Crear mockups y diseño de la interfaz para ${story.title}`,
        userStoryId: story.id,
        status: randomChoice([TaskStatus.DONE, TaskStatus.DONE, TaskStatus.REVIEW]),
        assignedTo: randomChoice(teamMembers).id,
        estimatedHours: Math.floor(Math.random() * 8) + 4,
        spentHours: Math.floor(Math.random() * 6) + 2,
        createdBy: project.scrumMaster.id,
        isDeliverable: false,
      },
      {
        title: `Implementación backend - ${story.title}`,
        description: `Desarrollar la lógica del servidor para ${story.title}`,
        userStoryId: story.id,
        status: randomChoice([TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW]),
        assignedTo: randomChoice(teamMembers).id,
        estimatedHours: Math.floor(Math.random() * 12) + 8,
        spentHours: Math.floor(Math.random() * 10) + 4,
        createdBy: project.scrumMaster.id,
        isDeliverable: false,
      },
      {
        title: `Implementación frontend - ${story.title}`,
        description: `Desarrollar la interfaz de usuario para ${story.title}`,
        userStoryId: story.id,
        status: randomChoice([TaskStatus.IN_PROGRESS, TaskStatus.TODO, TaskStatus.REVIEW]),
        assignedTo: randomChoice(teamMembers).id,
        estimatedHours: Math.floor(Math.random() * 10) + 6,
        spentHours: Math.floor(Math.random() * 8) + 2,
        createdBy: project.scrumMaster.id,
        isDeliverable: false,
      },
      {
        title: `Entregable: ${story.title}`,
        description: `Entregable final de la funcionalidad ${story.title}`,
        userStoryId: story.id,
        status: randomChoice([TaskStatus.DONE, TaskStatus.REVIEW, TaskStatus.IN_PROGRESS]),
        assignedTo: randomChoice(teamMembers).id,
        estimatedHours: Math.floor(Math.random() * 4) + 2,
        spentHours: Math.floor(Math.random() * 3) + 1,
        createdBy: project.scrumMaster.id,
        isDeliverable: true,
      },
    ];

    for (const taskData of storyTasks) {
      const task = await createTask(taskData);
      tasks.push({
        ...task,
        project,
        assignedUser: teamMembers.find((u) => u.id === task.assignedTo),
      });
    }
  }

  console.log(`✅ ${tasks.length} tareas creadas`);
  return tasks;
}

async function populateRubrics(projects: any[]) {
  console.log("📋 Creando rúbricas...");

  const rubrics = [];

  // Rúbrica plantilla general
  const templateRubric = await createRubric({
    name: "Rúbrica General de Desarrollo de Software",
    description: "Plantilla estándar para evaluar entregables de desarrollo de software",
    createdBy: projects[0].productOwner.id,
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
          { id: crypto.randomUUID(), description: "Regular: Documentación básica", pointValue: 12 },
          {
            id: crypto.randomUUID(),
            description: "Insuficiente: Documentación incompleta o confusa",
            pointValue: 4,
          },
        ],
      },
    ],
  });

  rubrics.push(templateRubric);

  // Crear rúbricas específicas para cada proyecto
  for (const project of projects) {
    const projectRubric = await createRubric({
      name: `Rúbrica - ${project.name}`,
      description: `Rúbrica específica para evaluar entregables del proyecto ${project.name}`,
      projectId: project.id,
      createdBy: project.productOwner.id,
      isTemplate: false,
      status: RubricStatus.ACTIVE,
      criteria: templateRubric.criteria, // Usar los mismos criterios de la plantilla
    });

    rubrics.push(projectRubric);
  }

  console.log(`✅ ${rubrics.length} rúbricas creadas`);
  return rubrics;
}

// Función principal
async function main() {
  try {
    const users = await populateUsers();
    const projects = await populateProjects(users);
    const userStories = await populateUserStories(projects);
    const sprints = await populateSprints(projects);
    const tasks = await populateTasks(userStories, projects);
    const rubrics = await populateRubrics(projects);

    console.log("\n🎉 ¡Datos de ejemplo creados exitosamente!");
    console.log(`👥 Usuarios: ${users.length}`);
    console.log(`📁 Proyectos: ${projects.length}`);
    console.log(`📝 Historias de usuario: ${userStories.length}`);
    console.log(`🏃 Sprints: ${sprints.length}`);
    console.log(`✅ Tareas: ${tasks.length}`);
    console.log(`📋 Rúbricas: ${rubrics.length}`);
    console.log("\n📋 Credenciales de acceso:");
    console.log("Admin: admin@admin.com / admin123");
    console.log("Product Owner: garcia@universidad.edu / po123");
    console.log("Scrum Master: lopez@universidad.edu / sm123");
    console.log("Developer: perez@estudiante.edu / dev123");
  } catch (error) {
    console.error("❌ Error al crear datos de ejemplo:", error);
  }
}

if (import.meta.main) {
  await main();
}
