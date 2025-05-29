#!/usr/bin/env -S deno run --unstable-kv -A

// Script para ver los datos almacenados en Deno KV
import { COLLECTIONS } from "../utils/db.ts";
import { PROJECT_COLLECTIONS } from "../models/project.ts";
import { USER_STORY_COLLECTIONS } from "../models/userStory.ts";
import { TASK_COLLECTIONS } from "../models/task.ts";
import { SPRINT_COLLECTIONS } from "../models/sprint.ts";
import { DELIVERABLE_COLLECTIONS } from "../models/deliverable.ts";
import { RUBRIC_COLLECTIONS } from "../services/rubricService.ts";
import { EVALUATION_COLLECTIONS } from "../services/evaluationService.ts";
import { REPORT_COLLECTIONS } from "../models/report.ts";

async function main() {
  try {
    // Abrir la base de datos KV
    const kv = await Deno.openKv();

    console.log("=== Datos almacenados en Deno KV ===\n");

    // Listar usuarios
    console.log("=== USUARIOS ===");
    const usersIterator = kv.list({ prefix: COLLECTIONS.USERS });
    let userCount = 0;

    for await (const entry of usersIterator) {
      // Filtrar solo los usuarios principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === "users") {
        userCount++;
        console.log(`Usuario ${userCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Nombre de usuario: ${entry.value.username}`);
        console.log(`  Correo: ${entry.value.email}`);
        console.log(`  Rol: ${entry.value.role}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }

    if (userCount === 0) {
      console.log("No hay usuarios registrados.\n");
    }

    // Listar sesiones
    console.log("=== SESIONES ===");
    const sessionsIterator = kv.list({ prefix: [...COLLECTIONS.USERS, "sessions"] });
    let sessionCount = 0;

    for await (const entry of sessionsIterator) {
      sessionCount++;
      console.log(`Sesión ${sessionCount}:`);
      console.log(`  ID: ${entry.key[entry.key.length - 1]}`);
      console.log(`  Usuario ID: ${entry.value.userId}`);
      console.log(`  Nombre de usuario: ${entry.value.username}`);
      console.log(`  Correo: ${entry.value.email}`);
      console.log(`  Rol: ${entry.value.role}`);
      console.log(`  Creada: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log(`  Expira: ${new Date(entry.value.expiresAt).toLocaleString()}`);
      console.log("");
    }

    if (sessionCount === 0) {
      console.log("No hay sesiones activas.\n");
    }

    // Listar proyectos
    console.log("=== PROYECTOS ===");
    const projectsIterator = kv.list({ prefix: PROJECT_COLLECTIONS.PROJECTS });
    let projectCount = 0;

    for await (const entry of projectsIterator) {
      // Filtrar solo los proyectos principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECTS[0]) {
        projectCount++;
        console.log(`Proyecto ${projectCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Nombre: ${entry.value.name}`);
        console.log(`  Descripción: ${entry.value.description}`);
        console.log(`  Estado: ${entry.value.status}`);
        console.log(`  Creado por: ${entry.value.createdBy}`);
        console.log(`  Fecha inicio: ${entry.value.startDate ? new Date(entry.value.startDate).toLocaleString() : 'No definida'}`);
        console.log(`  Fecha fin: ${entry.value.endDate ? new Date(entry.value.endDate).toLocaleString() : 'No definida'}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }

    if (projectCount === 0) {
      console.log("No hay proyectos registrados.\n");
    }

    // Listar miembros de proyectos
    console.log("=== MIEMBROS DE PROYECTOS ===");
    const membersIterator = kv.list({ prefix: PROJECT_COLLECTIONS.PROJECT_MEMBERS });
    let memberCount = 0;

    for await (const entry of membersIterator) {
      // Filtrar solo los miembros principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECT_MEMBERS[0]) {
        memberCount++;
        console.log(`Miembro ${memberCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Usuario ID: ${entry.value.userId}`);
        console.log(`  Proyecto ID: ${entry.value.projectId}`);
        console.log(`  Rol: ${entry.value.role}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }

    if (memberCount === 0) {
      console.log("No hay miembros de proyectos registrados.\n");
    }

    // Listar historias de usuario
    console.log("=== HISTORIAS DE USUARIO ===");
    const userStoriesIterator = kv.list({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });
    let userStoryCount = 0;

    for await (const entry of userStoriesIterator) {
      userStoryCount++;
      console.log(`Historia de Usuario ${userStoryCount}:`);
      console.log(`  ID: ${entry.key[1]}`);
      console.log(`  Título: ${entry.value.title}`);
      console.log(`  Descripción: ${entry.value.description?.substring(0, 50)}${entry.value.description?.length > 50 ? '...' : ''}`);
      console.log(`  Prioridad: ${entry.value.priority}`);
      console.log(`  Estado: ${entry.value.status}`);
      console.log(`  Puntos: ${entry.value.points}`);
      console.log(`  Proyecto ID: ${entry.value.projectId}`);
      console.log(`  Creado por: ${entry.value.createdBy}`);
      console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log("");
    }

    if (userStoryCount === 0) {
      console.log("No hay historias de usuario registradas.\n");
    }

    // Listar tareas
    console.log("=== TAREAS ===");
    const tasksIterator = kv.list({ prefix: TASK_COLLECTIONS.TASKS });
    let taskCount = 0;

    for await (const entry of tasksIterator) {
      // Filtrar solo las tareas principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === TASK_COLLECTIONS.TASKS[0]) {
        taskCount++;
        console.log(`Tarea ${taskCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Título: ${entry.value.title}`);
        console.log(`  Descripción: ${entry.value.description?.substring(0, 50)}${entry.value.description?.length > 50 ? '...' : ''}`);
        console.log(`  Estado: ${entry.value.status}`);
        console.log(`  Historia de Usuario ID: ${entry.value.userStoryId}`);
        console.log(`  Asignado a: ${entry.value.assignedTo || 'No asignado'}`);
        console.log(`  Horas estimadas: ${entry.value.estimatedHours || 'No estimado'}`);
        console.log(`  Horas gastadas: ${entry.value.spentHours || 0}`);
        console.log(`  Es entregable: ${entry.value.isDeliverable ? 'Sí' : 'No'}`);
        console.log(`  Creado por: ${entry.value.createdBy}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }

    if (taskCount === 0) {
      console.log("No hay tareas registradas.\n");
    }

    // Listar sprints
    console.log("=== SPRINTS ===");
    const sprintsIterator = kv.list({ prefix: SPRINT_COLLECTIONS.SPRINTS });
    let sprintCount = 0;

    for await (const entry of sprintsIterator) {
      sprintCount++;
      console.log(`Sprint ${sprintCount}:`);
      console.log(`  ID: ${entry.key[1]}`);
      console.log(`  Nombre: ${entry.value.name}`);
      console.log(`  Objetivo: ${entry.value.goal?.substring(0, 50)}${entry.value.goal?.length > 50 ? '...' : ''}`);
      console.log(`  Estado: ${entry.value.status}`);
      console.log(`  Proyecto ID: ${entry.value.projectId}`);
      console.log(`  Fecha inicio: ${entry.value.startDate ? new Date(entry.value.startDate).toLocaleString() : 'No definida'}`);
      console.log(`  Fecha fin: ${entry.value.endDate ? new Date(entry.value.endDate).toLocaleString() : 'No definida'}`);
      console.log(`  Creado por: ${entry.value.createdBy}`);
      console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log("");
    }

    if (sprintCount === 0) {
      console.log("No hay sprints registrados.\n");
    }

    // Listar entregables
    console.log("=== ENTREGABLES ===");
    const deliverablesIterator = kv.list({ prefix: DELIVERABLE_COLLECTIONS.DELIVERABLES });
    let deliverableCount = 0;

    for await (const entry of deliverablesIterator) {
      deliverableCount++;
      console.log(`Entregable ${deliverableCount}:`);
      console.log(`  ID: ${entry.key[1]}`);
      console.log(`  Título: ${entry.value.title}`);
      console.log(`  Descripción: ${entry.value.description?.substring(0, 50)}${entry.value.description?.length > 50 ? '...' : ''}`);
      console.log(`  Estado: ${entry.value.status}`);
      console.log(`  Fecha límite: ${entry.value.dueDate ? new Date(entry.value.dueDate).toLocaleString() : 'No definida'}`);
      console.log(`  Creado por: ${entry.value.createdBy}`);
      console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log("");
    }

    if (deliverableCount === 0) {
      console.log("No hay entregables registrados.\n");
    }

    // Listar rúbricas
    console.log("=== RÚBRICAS ===");
    const rubricsIterator = kv.list({ prefix: RUBRIC_COLLECTIONS.RUBRICS });
    let rubricCount = 0;

    for await (const entry of rubricsIterator) {
      rubricCount++;
      console.log(`Rúbrica ${rubricCount}:`);
      console.log(`  ID: ${entry.key[1]}`);
      console.log(`  Título: ${entry.value.title}`);
      console.log(`  Descripción: ${entry.value.description?.substring(0, 50)}${entry.value.description?.length > 50 ? '...' : ''}`);
      console.log(`  Estado: ${entry.value.status}`);
      console.log(`  Es plantilla: ${entry.value.isTemplate ? 'Sí' : 'No'}`);
      console.log(`  Proyecto ID: ${entry.value.projectId || 'N/A'}`);
      console.log(`  Creado por: ${entry.value.createdBy}`);
      console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log("");
    }

    if (rubricCount === 0) {
      console.log("No hay rúbricas registradas.\n");
    }

    // Listar evaluaciones
    console.log("=== EVALUACIONES ===");
    const evaluationsIterator = kv.list({ prefix: EVALUATION_COLLECTIONS.EVALUATIONS });
    let evaluationCount = 0;

    for await (const entry of evaluationsIterator) {
      evaluationCount++;
      console.log(`Evaluación ${evaluationCount}:`);
      console.log(`  ID: ${entry.key[1]}`);
      console.log(`  Rúbrica ID: ${entry.value.rubricId}`);
      console.log(`  Entregable ID: ${entry.value.deliverableId}`);
      console.log(`  Estudiante ID: ${entry.value.studentId}`);
      console.log(`  Evaluador ID: ${entry.value.evaluatorId}`);
      console.log(`  Puntuación: ${entry.value.score}`);
      console.log(`  Estado: ${entry.value.status}`);
      console.log(`  Comentarios: ${entry.value.comments?.substring(0, 50)}${entry.value.comments?.length > 50 ? '...' : ''}`);
      console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
      console.log("");
    }

    if (evaluationCount === 0) {
      console.log("No hay evaluaciones registradas.\n");
    }

    // Listar reportes
    console.log("=== REPORTES ===");
    const reportsIterator = kv.list({ prefix: REPORT_COLLECTIONS.REPORTS });
    let reportCount = 0;

    for await (const entry of reportsIterator) {
      // Filtrar solo los reportes principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === REPORT_COLLECTIONS.REPORTS[0]) {
        reportCount++;
        console.log(`Reporte ${reportCount}:`);
        console.log(`  ID: ${entry.key[1]}`);
        console.log(`  Tipo: ${entry.value.config?.type}`);
        console.log(`  Proyecto ID: ${entry.value.config?.projectId || 'N/A'}`);
        console.log(`  Sprint ID: ${entry.value.config?.sprintId || 'N/A'}`);
        console.log(`  Generado: ${new Date(entry.value.generatedAt).toLocaleString()}`);
        console.log(`  Creado por: ${entry.value.createdBy}`);
        console.log(`  Creado: ${new Date(entry.value.createdAt).toLocaleString()}`);
        console.log("");
      }
    }

    if (reportCount === 0) {
      console.log("No hay reportes registrados.\n");
    }

    // Listar todas las claves
    console.log("=== TODAS LAS CLAVES ===");
    console.log("Listando todas las claves en la base de datos...");
    const allKeysIterator = kv.list({ prefix: [] });
    let keyCount = 0;

    for await (const entry of allKeysIterator) {
      keyCount++;
      console.log(`Clave ${keyCount}: ${JSON.stringify(entry.key)}`);
    }

    console.log(`\nTotal de claves en la base de datos: ${keyCount}\n`);

    // Cerrar la base de datos
    kv.close();
  } catch (error) {
    console.error("Error al acceder a Deno KV:", error);
  }
}

main();
