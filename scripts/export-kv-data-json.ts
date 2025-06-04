#!/usr/bin/env -S deno run --unstable-kv -A

// Script para exportar los datos almacenados en Deno KV en formato JSON
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

    // Objeto para almacenar todos los datos
    const exportData: Record<string, any[]> = {
      users: [],
      sessions: [],
      projects: [],
      projectMembers: [],
      userStories: [],
      tasks: [],
      sprints: [],
      deliverables: [],
      rubrics: [],
      evaluations: [],
      reports: [],
      sprintUserStories: [],
      taskHistory: [],
      comments: [],
      metrics: [],
    };

    // Exportar usuarios
    console.log("Exportando usuarios...");
    const usersIterator = kv.list({ prefix: COLLECTIONS.USERS });
    for await (const entry of usersIterator) {
      // Filtrar solo los usuarios principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === "users" && typeof entry.key[1] === "string" && 
          !entry.key[1].startsWith("by_")) {
        exportData.users.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar sesiones
    console.log("Exportando sesiones...");
    const sessionsIterator = kv.list({ prefix: [...COLLECTIONS.USERS, "sessions"] });
    for await (const entry of sessionsIterator) {
      exportData.sessions.push({
        key: entry.key,
        value: entry.value
      });
    }

    // Exportar proyectos
    console.log("Exportando proyectos...");
    const projectsIterator = kv.list({ prefix: PROJECT_COLLECTIONS.PROJECTS });
    for await (const entry of projectsIterator) {
      // Filtrar solo los proyectos principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECTS[0]) {
        exportData.projects.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar miembros de proyectos
    console.log("Exportando miembros de proyectos...");
    const membersIterator = kv.list({ prefix: PROJECT_COLLECTIONS.PROJECT_MEMBERS });
    for await (const entry of membersIterator) {
      // Filtrar solo los miembros principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECT_MEMBERS[0]) {
        exportData.projectMembers.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar historias de usuario
    console.log("Exportando historias de usuario...");
    const userStoriesIterator = kv.list({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });
    for await (const entry of userStoriesIterator) {
      if (entry.key.length === 2 && entry.key[0] === USER_STORY_COLLECTIONS.USER_STORIES[0]) {
        exportData.userStories.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar tareas
    console.log("Exportando tareas...");
    const tasksIterator = kv.list({ prefix: TASK_COLLECTIONS.TASKS });
    for await (const entry of tasksIterator) {
      // Filtrar solo las tareas principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === TASK_COLLECTIONS.TASKS[0]) {
        exportData.tasks.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar sprints
    console.log("Exportando sprints...");
    const sprintsIterator = kv.list({ prefix: SPRINT_COLLECTIONS.SPRINTS });
    for await (const entry of sprintsIterator) {
      if (entry.key.length === 2 && entry.key[0] === SPRINT_COLLECTIONS.SPRINTS[0]) {
        exportData.sprints.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar entregables
    console.log("Exportando entregables...");
    const deliverablesIterator = kv.list({ prefix: DELIVERABLE_COLLECTIONS.DELIVERABLES });
    for await (const entry of deliverablesIterator) {
      if (entry.key.length === 2 && entry.key[0] === DELIVERABLE_COLLECTIONS.DELIVERABLES[0]) {
        exportData.deliverables.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar rúbricas
    console.log("Exportando rúbricas...");
    const rubricsIterator = kv.list({ prefix: RUBRIC_COLLECTIONS.RUBRICS });
    for await (const entry of rubricsIterator) {
      if (entry.key.length === 2 && entry.key[0] === RUBRIC_COLLECTIONS.RUBRICS[0]) {
        exportData.rubrics.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar evaluaciones
    console.log("Exportando evaluaciones...");
    const evaluationsIterator = kv.list({ prefix: EVALUATION_COLLECTIONS.EVALUATIONS });
    for await (const entry of evaluationsIterator) {
      if (entry.key.length === 2 && entry.key[0] === EVALUATION_COLLECTIONS.EVALUATIONS[0]) {
        exportData.evaluations.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Exportar reportes
    console.log("Exportando reportes...");
    const reportsIterator = kv.list({ prefix: REPORT_COLLECTIONS.REPORTS });
    for await (const entry of reportsIterator) {
      // Filtrar solo los reportes principales (no índices)
      if (entry.key.length === 2 && entry.key[0] === REPORT_COLLECTIONS.REPORTS[0]) {
        exportData.reports.push({
          key: entry.key,
          value: entry.value
        });
      }
    }

    // Las historias de usuario en sprints están incluidas en los objetos de sprint
    console.log("Las historias de usuario en sprints están incluidas en los objetos de sprint");

    // Exportar historial de tareas
    try {
      console.log("Exportando historial de tareas...");
      const taskHistoryIterator = kv.list({ prefix: ["task_history"] });
      for await (const entry of taskHistoryIterator) {
        if (entry.key.length === 2 && entry.key[0] === "task_history") {
          exportData.taskHistory.push({
            key: entry.key,
            value: entry.value
          });
        }
      }
    } catch (error) {
      console.log("No se encontraron datos de historial de tareas");
    }

    // Exportar comentarios
    try {
      console.log("Exportando comentarios...");
      const commentsIterator = kv.list({ prefix: ["comments"] });
      for await (const entry of commentsIterator) {
        if (entry.key.length === 2 && entry.key[0] === "comments") {
          exportData.comments.push({
            key: entry.key,
            value: entry.value
          });
        }
      }
    } catch (error) {
      console.log("No se encontraron comentarios");
    }

    // Exportar métricas
    try {
      console.log("Exportando métricas de proyecto...");
      const projectMetricsIterator = kv.list({ prefix: ["project_metrics"] });
      for await (const entry of projectMetricsIterator) {
        if (entry.key.length === 2 && entry.key[0] === "project_metrics") {
          exportData.metrics.push({
            key: entry.key,
            value: entry.value
          });
        }
      }
    } catch (error) {
      console.log("No se encontraron métricas de proyecto");
    }

    try {
      console.log("Exportando métricas de sprint...");
      const sprintMetricsIterator = kv.list({ prefix: ["sprint_metrics"] });
      for await (const entry of sprintMetricsIterator) {
        if (entry.key.length === 2 && entry.key[0] === "sprint_metrics") {
          exportData.metrics.push({
            key: entry.key,
            value: entry.value
          });
        }
      }
    } catch (error) {
      console.log("No se encontraron métricas de sprint");
    }

    // Guardar los datos en un archivo JSON
    await Deno.writeTextFile(
      "./kv-data-export.json", 
      JSON.stringify(exportData, null, 2)
    );

    console.log("Exportación completada. Los datos se han guardado en kv-data-export.json");

    // Cerrar la base de datos
    kv.close();
  } catch (error) {
    console.error("Error al exportar datos de Deno KV:", error);
  }
}

main();