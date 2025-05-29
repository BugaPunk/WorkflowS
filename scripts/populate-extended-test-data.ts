#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script extendido para poblar la base de datos con datos de prueba completos
 * Este script extiende el script básico con tareas, entregables, rúbricas, evaluaciones y reportes
 */

import { createUser, UserRole } from "../models/user.ts";
import { createProject, addProjectMember, ProjectRole, ProjectStatus } from "../models/project.ts";
import { createUserStory, UserStoryPriority, UserStoryStatus } from "../models/userStory.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";
import { createTask, TaskStatus, updateTask } from "../models/task.ts";

// Función auxiliar para obtener fechas relativas
function getRelativeDate(daysFromNow: number): number {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.getTime();
}

console.log("🚀 Iniciando población extendida de datos de prueba...");

try {
  // 1. CREAR USUARIOS (usando datos del script original)
  console.log("👥 Creando usuarios...");
  
  const adminUser = await createUser({
    username: "admin",
    email: "admin@workflows.com",
    password: "admin123",
    firstName: "Administrador",
    lastName: "Sistema",
    role: UserRole.ADMIN,
  });
  console.log(`✅ Admin creado: ${adminUser.username}`);

  const productOwner = await createUser({
    username: "maria.garcia",
    email: "maria.garcia@workflows.com",
    password: "maria123",
    firstName: "María",
    lastName: "García",
    role: UserRole.PRODUCT_OWNER,
  });
  console.log(`✅ Product Owner creado: ${productOwner.username}`);

  const scrumMaster = await createUser({
    username: "carlos.lopez",
    email: "carlos.lopez@workflows.com",
    password: "carlos123",
    firstName: "Carlos",
    lastName: "López",
    role: UserRole.SCRUM_MASTER,
  });
  console.log(`✅ Scrum Master creado: ${scrumMaster.username}`);

  const developers = [];
  const developerData = [
    { username: "ana.martinez", email: "ana.martinez@workflows.com", firstName: "Ana", lastName: "Martínez" },
    { username: "luis.rodriguez", email: "luis.rodriguez@workflows.com", firstName: "Luis", lastName: "Rodríguez" },
    { username: "sofia.hernandez", email: "sofia.hernandez@workflows.com", firstName: "Sofía", lastName: "Hernández" },
    { username: "diego.morales", email: "diego.morales@workflows.com", firstName: "Diego", lastName: "Morales" },
    { username: "laura.jimenez", email: "laura.jimenez@workflows.com", firstName: "Laura", lastName: "Jiménez" },
  ];

  for (const dev of developerData) {
    const developer = await createUser({
      ...dev,
      password: "dev123",
      role: UserRole.TEAM_DEVELOPER,
    });
    developers.push(developer);
    console.log(`✅ Developer creado: ${developer.username}`);
  }

  // 2. CREAR PROYECTOS
  console.log("\n📁 Creando proyectos...");
  
  const project1 = await createProject({
    name: "Sistema de Gestión Académica",
    description: "Plataforma web para gestionar estudiantes, cursos y calificaciones en una institución educativa.",
    status: ProjectStatus.IN_PROGRESS,
    startDate: getRelativeDate(-30),
    endDate: getRelativeDate(60),
    createdBy: productOwner.id,
  });
  console.log(`✅ Proyecto creado: ${project1.name}`);

  const project2 = await createProject({
    name: "E-commerce Mobile App",
    description: "Aplicación móvil para comercio electrónico con funcionalidades de catálogo, carrito y pagos.",
    status: ProjectStatus.PLANNING,
    startDate: getRelativeDate(7),
    endDate: getRelativeDate(90),
    createdBy: productOwner.id,
  });
  console.log(`✅ Proyecto creado: ${project2.name}`);

  // 3. ASIGNAR MIEMBROS A PROYECTOS
  console.log("\n👥 Asignando miembros a proyectos...");
  
  // Proyecto 1
  await addProjectMember({ userId: scrumMaster.id, projectId: project1.id, role: ProjectRole.SCRUM_MASTER });
  await addProjectMember({ userId: developers[0].id, projectId: project1.id, role: ProjectRole.TEAM_MEMBER });
  await addProjectMember({ userId: developers[1].id, projectId: project1.id, role: ProjectRole.TEAM_MEMBER });
  await addProjectMember({ userId: developers[2].id, projectId: project1.id, role: ProjectRole.TEAM_MEMBER });
  console.log(`✅ Miembros asignados al proyecto: ${project1.name}`);

  // Proyecto 2
  await addProjectMember({ userId: scrumMaster.id, projectId: project2.id, role: ProjectRole.SCRUM_MASTER });
  await addProjectMember({ userId: developers[3].id, projectId: project2.id, role: ProjectRole.TEAM_MEMBER });
  await addProjectMember({ userId: developers[4].id, projectId: project2.id, role: ProjectRole.TEAM_MEMBER });
  console.log(`✅ Miembros asignados al proyecto: ${project2.name}`);

  // 4. CREAR SPRINTS
  console.log("\n🏃 Creando sprints...");
  
  const sprint1 = await createSprint({
    name: "Sprint 1 - Autenticación y Usuarios",
    goal: "Implementar sistema de autenticación y gestión básica de usuarios",
    projectId: project1.id,
    status: SprintStatus.COMPLETED,
    startDate: getRelativeDate(-30),
    endDate: getRelativeDate(-16),
    createdBy: scrumMaster.id,
  });
  console.log(`✅ Sprint creado: ${sprint1.name}`);

  const sprint2 = await createSprint({
    name: "Sprint 2 - Gestión de Cursos",
    goal: "Desarrollar funcionalidades para crear y gestionar cursos",
    projectId: project1.id,
    status: SprintStatus.ACTIVE,
    startDate: getRelativeDate(-15),
    endDate: getRelativeDate(-1),
    createdBy: scrumMaster.id,
  });
  console.log(`✅ Sprint creado: ${sprint2.name}`);

  const sprint3 = await createSprint({
    name: "Sprint 3 - Sistema de Calificaciones",
    goal: "Implementar sistema de calificaciones y reportes",
    projectId: project1.id,
    status: SprintStatus.PLANNED,
    startDate: getRelativeDate(0),
    endDate: getRelativeDate(14),
    createdBy: scrumMaster.id,
  });
  console.log(`✅ Sprint creado: ${sprint3.name}`);

  // 5. CREAR HISTORIAS DE USUARIO
  console.log("\n📖 Creando historias de usuario...");
  
  const userStories = [];
  
  // Historias para Sprint 1 (Completado)
  const story1 = await createUserStory({
    title: "Registro de usuarios",
    description: "Como administrador, quiero poder registrar nuevos usuarios en el sistema para que puedan acceder a la plataforma.",
    acceptanceCriteria: "- El formulario debe validar email único\n- La contraseña debe tener al menos 6 caracteres\n- Se debe asignar un rol por defecto",
    priority: UserStoryPriority.HIGH,
    points: 8,
    projectId: project1.id,
  }, productOwner.id);
  userStories.push(story1);

  const story2 = await createUserStory({
    title: "Login de usuarios",
    description: "Como usuario, quiero poder iniciar sesión en el sistema para acceder a mis funcionalidades.",
    acceptanceCriteria: "- Validar credenciales\n- Crear sesión segura\n- Redireccionar según rol",
    priority: UserStoryPriority.HIGH,
    points: 5,
    projectId: project1.id,
  }, productOwner.id);
  userStories.push(story2);

  // Historias para Sprint 2 (Activo)
  const story3 = await createUserStory({
    title: "Crear cursos",
    description: "Como profesor, quiero poder crear nuevos cursos para organizar mi contenido educativo.",
    acceptanceCriteria: "- Formulario con nombre, descripción y código\n- Validación de código único\n- Asignación automática del profesor creador",
    priority: UserStoryPriority.HIGH,
    points: 13,
    projectId: project1.id,
  }, productOwner.id);
  userStories.push(story3);

  const story4 = await createUserStory({
    title: "Inscripción de estudiantes",
    description: "Como estudiante, quiero poder inscribirme en cursos disponibles para acceder al contenido.",
    acceptanceCriteria: "- Lista de cursos disponibles\n- Botón de inscripción\n- Confirmación de inscripción",
    priority: UserStoryPriority.MEDIUM,
    points: 8,
    projectId: project1.id,
  }, productOwner.id);
  userStories.push(story4);

  // Historia para Sprint 3 (Planificado)
  const story5 = await createUserStory({
    title: "Sistema de calificaciones",
    description: "Como profesor, quiero poder asignar calificaciones a los estudiantes para evaluar su desempeño.",
    acceptanceCriteria: "- Formulario de calificaciones\n- Validación de rangos\n- Historial de calificaciones",
    priority: UserStoryPriority.HIGH,
    points: 21,
    projectId: project1.id,
  }, productOwner.id);
  userStories.push(story5);

  console.log(`✅ ${userStories.length} historias de usuario creadas`);

  // 6. CREAR TAREAS
  console.log("\n📋 Creando tareas...");

  const tasks = [];

  // Tareas para Story 1 (Completadas)
  const task1 = await createTask({
    title: "Diseñar formulario de registro",
    description: "Crear el diseño y estructura del formulario de registro de usuarios",
    userStoryId: story1.id,
    status: TaskStatus.DONE,
    estimatedHours: 4,
    spentHours: 3.5,
    assignedTo: developers[0].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task1);

  const task2 = await createTask({
    title: "Implementar validaciones del formulario",
    description: "Agregar validaciones de email único y contraseña segura",
    userStoryId: story1.id,
    status: TaskStatus.DONE,
    estimatedHours: 6,
    spentHours: 5.5,
    assignedTo: developers[1].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task2);

  // Tareas para Story 2 (Completadas)
  const task3 = await createTask({
    title: "Crear página de login",
    description: "Desarrollar la interfaz de usuario para el login",
    userStoryId: story2.id,
    status: TaskStatus.DONE,
    estimatedHours: 3,
    spentHours: 2.5,
    assignedTo: developers[0].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task3);

  // Tareas para Story 3 (En progreso)
  const task4 = await createTask({
    title: "Diseñar modelo de datos para cursos",
    description: "Definir la estructura de datos para almacenar información de cursos",
    userStoryId: story3.id,
    status: TaskStatus.DONE,
    estimatedHours: 4,
    spentHours: 4,
    assignedTo: developers[1].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task4);

  const task5 = await createTask({
    title: "Implementar API de cursos",
    description: "Crear endpoints para CRUD de cursos",
    userStoryId: story3.id,
    status: TaskStatus.IN_PROGRESS,
    estimatedHours: 8,
    spentHours: 4,
    assignedTo: developers[2].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task5);

  const task6 = await createTask({
    title: "Crear interfaz de gestión de cursos",
    description: "Desarrollar la UI para crear y editar cursos",
    userStoryId: story3.id,
    status: TaskStatus.TODO,
    estimatedHours: 6,
    assignedTo: developers[0].id,
    createdBy: scrumMaster.id,
  });
  tasks.push(task6);

  // Tareas para Story 4 (Pendientes)
  const task7 = await createTask({
    title: "Listar cursos disponibles",
    description: "Mostrar lista de cursos en los que el estudiante puede inscribirse",
    userStoryId: story4.id,
    status: TaskStatus.TODO,
    estimatedHours: 4,
    createdBy: scrumMaster.id,
  });
  tasks.push(task7);

  const task8 = await createTask({
    title: "Implementar funcionalidad de inscripción",
    description: "Permitir a los estudiantes inscribirse en cursos",
    userStoryId: story4.id,
    status: TaskStatus.TODO,
    estimatedHours: 5,
    createdBy: scrumMaster.id,
  });
  tasks.push(task8);

  console.log(`✅ ${tasks.length} tareas creadas`);

  console.log("\n📦 Nota: Los entregables se pueden crear desde la interfaz web una vez que el sistema esté funcionando.");

  console.log("\n✨ ¡Datos de prueba extendidos creados exitosamente!");
  console.log("\n📊 Resumen completo:");
  console.log(`- Usuarios: ${1 + 1 + 1 + developers.length} (1 admin, 1 PO, 1 SM, ${developers.length} devs)`);
  console.log(`- Proyectos: 2`);
  console.log(`- Sprints: 3`);
  console.log(`- Historias de usuario: ${userStories.length}`);
  console.log(`- Tareas: ${tasks.length}`);

} catch (error) {
  console.error("❌ Error al crear datos de prueba:", error);
  Deno.exit(1);
}
