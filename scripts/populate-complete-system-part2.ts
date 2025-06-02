#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * PARTE 2: Sprints, Tareas, Rúbricas, Evaluaciones y Funcionalidades Avanzadas
 * Este archivo continúa la población del sistema con las funcionalidades más complejas
 */

import { createTask, TaskStatus } from "../models/task.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";
import { createRubric } from "../services/rubricService.ts";
import { RubricStatus } from "../models/rubric.ts";
import { createEvaluation, EvaluationStatus } from "../services/evaluationService.ts";
import { createConversation, createMessage, ConversationType } from "../models/message.ts";
import { createTaskComment } from "../models/task.ts";

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

export async function createSprintsAndTasks(projects: any[], userStories: any[]) {
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
        name: "Sprint 4 - Evaluaciones y Rúbricas",
        goal: "Desarrollar sistema completo de evaluaciones con rúbricas personalizadas",
        status: SprintStatus.PLANNED,
        startDate: getRandomDate(0, 2),
        endDate: getRandomDate(0, 16),
      },
      {
        name: "Sprint 5 - Notificaciones y Reportes",
        goal: "Agregar sistema de notificaciones y capacidades de reportes avanzados",
        status: SprintStatus.PLANNED,
        startDate: getRandomDate(0, 17),
        endDate: getRandomDate(0, 31),
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

  // Crear tareas detalladas
  console.log("\n✅ Paso 5: Creando tareas detalladas y entregables...");

  const allTasks = [];

  for (const userStory of userStories) {
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

  return { sprints: allSprints, tasks: allTasks };
}

export async function createRubricsSystem(users: any[], projects: any[]) {
  console.log("\n📋 Paso 6: Creando sistema completo de rúbricas...");

  const rubrics = [];
  const professors = users.filter(user => 
    user.role === "admin" || 
    user.role === "product_owner" || 
    user.role === "scrum_master"
  );

  // 1. Plantillas de rúbricas especializadas
  const templates = [
    {
      name: "Rúbrica General de Desarrollo de Software",
      description: "Plantilla estándar para evaluar entregables de desarrollo de software en proyectos académicos",
      criteria: [
        { 
          name: "Funcionalidad", 
          description: "El software cumple con los requisitos funcionales especificados", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Calidad del Código", 
          description: "El código es limpio, bien estructurado y documentado", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        },
        { 
          name: "Interfaz de Usuario", 
          description: "La interfaz es intuitiva, atractiva y fácil de usar", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        },
        { 
          name: "Pruebas y Validación", 
          description: "El software ha sido probado adecuadamente", 
          maxPoints: 15,
          levels: createStandardLevels(15)
        },
        { 
          name: "Documentación", 
          description: "La documentación del proyecto es completa y clara", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        }
      ]
    },
    {
      name: "Rúbrica de Presentación Oral",
      description: "Evaluación de presentaciones orales y defensa de proyectos",
      criteria: [
        { 
          name: "Claridad en la Exposición", 
          description: "Capacidad de explicar conceptos de forma clara", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Dominio del Tema", 
          description: "Conocimiento profundo del proyecto", 
          maxPoints: 30,
          levels: createStandardLevels(30)
        },
        { 
          name: "Uso de Recursos Visuales", 
          description: "Efectividad de slides y materiales", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        },
        { 
          name: "Manejo del Tiempo", 
          description: "Cumplimiento del tiempo asignado", 
          maxPoints: 15,
          levels: createStandardLevels(15)
        },
        { 
          name: "Profesionalismo", 
          description: "Actitud y presentación personal", 
          maxPoints: 10,
          levels: createStandardLevels(10)
        }
      ]
    },
    {
      name: "Rúbrica de Trabajo en Equipo",
      description: "Evaluación de habilidades colaborativas y trabajo grupal",
      criteria: [
        { 
          name: "Participación Activa", 
          description: "Contribución constante al equipo", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Comunicación Efectiva", 
          description: "Habilidades de comunicación interpersonal", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Resolución de Conflictos", 
          description: "Capacidad de manejar desacuerdos", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        },
        { 
          name: "Cumplimiento de Compromisos", 
          description: "Responsabilidad con tareas asignadas", 
          maxPoints: 30,
          levels: createStandardLevels(30)
        }
      ]
    },
    {
      name: "Rúbrica de Documentación",
      description: "Evaluación de documentos técnicos y manuales",
      criteria: [
        { 
          name: "Estructura y Organización", 
          description: "Orden lógico y coherencia", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Claridad del Contenido", 
          description: "Facilidad de comprensión", 
          maxPoints: 30,
          levels: createStandardLevels(30)
        },
        { 
          name: "Completitud", 
          description: "Cobertura de todos los aspectos necesarios", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        },
        { 
          name: "Formato y Presentación", 
          description: "Aspecto visual y profesional", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        }
      ]
    }
  ];

  for (const templateData of templates) {
    const professor = professors[Math.floor(Math.random() * professors.length)];
    
    const rubricData = {
      name: templateData.name,
      description: templateData.description,
      criteria: templateData.criteria,
      isTemplate: true,
      createdBy: professor.id,
      status: RubricStatus.ACTIVE
    };

    const rubric = await createRubric(rubricData);
    rubrics.push(rubric);
    console.log(`✅ Plantilla creada: "${templateData.name}"`);
  }

  // 2. Rúbricas específicas para proyectos
  for (const project of projects) {
    const professor = professors[Math.floor(Math.random() * professors.length)];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const rubricData = {
      name: `${template.name} - ${project.name}`,
      description: `${template.description} adaptada para ${project.name}`,
      criteria: template.criteria,
      isTemplate: false,
      createdBy: professor.id,
      projectId: project.id,
      status: RubricStatus.ACTIVE
    };

    const rubric = await createRubric(rubricData);
    rubrics.push(rubric);
    console.log(`✅ Rúbrica de proyecto creada: "${rubricData.name}"`);
  }

  // 3. Rúbricas personales
  const personalRubrics = [
    {
      name: "Mi Rúbrica de Evaluación Rápida",
      description: "Rúbrica personalizada para evaluaciones rápidas",
      criteria: [
        { 
          name: "Cumplimiento de Objetivos", 
          description: "Se alcanzaron los objetivos propuestos", 
          maxPoints: 50,
          levels: createStandardLevels(50)
        },
        { 
          name: "Calidad del Trabajo", 
          description: "Nivel de calidad en la ejecución", 
          maxPoints: 30,
          levels: createStandardLevels(30)
        },
        { 
          name: "Puntualidad", 
          description: "Entrega en tiempo y forma", 
          maxPoints: 20,
          levels: createStandardLevels(20)
        }
      ]
    },
    {
      name: "Evaluación de Entregables Parciales",
      description: "Para evaluar entregas intermedias del proyecto",
      criteria: [
        { 
          name: "Progreso Realizado", 
          description: "Avance respecto a la planificación", 
          maxPoints: 40,
          levels: createStandardLevels(40)
        },
        { 
          name: "Calidad del Código", 
          description: "Buenas prácticas de programación", 
          maxPoints: 35,
          levels: createStandardLevels(35)
        },
        { 
          name: "Documentación Parcial", 
          description: "Documentación del progreso", 
          maxPoints: 25,
          levels: createStandardLevels(25)
        }
      ]
    }
  ];

  for (const rubricData of personalRubrics) {
    const professor = professors[Math.floor(Math.random() * professors.length)];
    
    const data = {
      ...rubricData,
      isTemplate: false,
      createdBy: professor.id,
      status: RubricStatus.ACTIVE
    };

    const rubric = await createRubric(data);
    rubrics.push(rubric);
    console.log(`✅ Rúbrica personal creada: "${rubricData.name}"`);
  }

  console.log(`\n📊 Total rúbricas: ${rubrics.length}`);
  return rubrics;
}
