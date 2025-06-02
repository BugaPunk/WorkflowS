#!/usr/bin/env -S deno run -A

/**
 * Script para poblar evaluaciones basándose en los datos existentes
 */

import { getAllUsers } from "../models/user.ts";
import { getAllProjects, getProjectMembers } from "../models/project.ts";
import { getProjectUserStories } from "../models/userStory.ts";
import { getUserStoryTasks } from "../models/task.ts";
import { getDeliverableById } from "../models/deliverable.ts";
import { getRubricsByProject, getRubricTemplates } from "../services/rubricService.ts";
import { createEvaluation } from "../services/evaluationService.ts";
import { EvaluationStatus } from "../models/evaluation.ts";
import { getKv } from "../utils/db.ts";

console.log("🎯 POBLANDO EVALUACIONES BASADAS EN DATOS EXISTENTES");

async function populateEvaluations() {
  try {
    const kv = getKv();
    
    // Obtener datos existentes
    console.log("📊 Obteniendo datos existentes...");
    const [users, projects] = await Promise.all([
      getAllUsers(),
      getAllProjects()
    ]);

    console.log(`✅ Encontrados: ${users.length} usuarios, ${projects.length} proyectos`);

    // Obtener plantillas de rúbricas disponibles
    const rubricTemplates = await getRubricTemplates();
    console.log(`📋 Encontradas ${rubricTemplates.length} plantillas de rúbricas`);

    if (rubricTemplates.length === 0) {
      console.log("❌ No hay plantillas de rúbricas disponibles. Ejecuta primero el script de población completa.");
      return;
    }

    let totalEvaluations = 0;
    const evaluationPromises = [];

    // Para cada proyecto
    for (const project of projects) {
      console.log(`\n🏗️ Procesando proyecto: ${project.name}`);

      // Obtener miembros y historias
      const [members, userStories] = await Promise.all([
        getProjectMembers(project.id),
        getProjectUserStories(project.id)
      ]);

      console.log(`  📋 ${userStories.length} historias, ${members.length} miembros`);

      // Usar plantillas de rúbricas disponibles
      const rubrics = rubricTemplates;

      // Obtener evaluadores (profesores y scrum masters)
      const evaluators = members.filter(member => 
        member.role === "product_owner" || 
        member.role === "scrum_master" ||
        member.role === "admin"
      );

      // Obtener estudiantes (team members)
      const students = members.filter(member => member.role === "team_member");

      console.log(`  👨‍🏫 ${evaluators.length} evaluadores, 👨‍💻 ${students.length} estudiantes`);

      if (evaluators.length === 0 || students.length === 0) {
        console.log(`  ⚠️ No hay suficientes evaluadores o estudiantes, saltando...`);
        continue;
      }

      // Para cada historia de usuario, crear evaluaciones para tareas completadas
      for (const userStory of userStories) {
        const tasks = await getUserStoryTasks(userStory.id);
        const completedTasks = tasks.filter(task => task.status === "done");

        // Crear evaluaciones para algunas tareas completadas (simular entregables)
        const tasksToEvaluate = completedTasks.slice(0, Math.min(completedTasks.length, 2));

        for (const task of tasksToEvaluate) {
          console.log(`    📦 Creando evaluaciones para tarea: ${task.title}`);

          // Crear evaluaciones para algunos estudiantes (no todos para ser realista)
          const studentsToEvaluate = students.slice(0, Math.min(students.length, 3));
          
          for (const student of studentsToEvaluate) {
            // Seleccionar un evaluador aleatorio
            const evaluator = evaluators[Math.floor(Math.random() * evaluators.length)];
            
            // Seleccionar una rúbrica aleatoria
            const rubric = rubrics[Math.floor(Math.random() * rubrics.length)];

            // Crear evaluaciones de criterios realistas
            const criteriaEvaluations = rubric.criteria.map(criterion => {
              // Generar puntuación realista (70-95% del máximo)
              const minScore = Math.floor(criterion.maxPoints * 0.7);
              const maxScore = Math.floor(criterion.maxPoints * 0.95);
              const score = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;

              return {
                criterionId: criterion.id,
                score,
                feedback: generateRealisticFeedback(criterion.name, score, criterion.maxPoints)
              };
            });

            // Calcular puntuación total
            const totalScore = criteriaEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
            const maxPossibleScore = rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);

            // Crear la evaluación (usando la tarea como "entregable")
            const evaluationData = {
              deliverableId: task.id, // Usar la tarea como entregable
              evaluatorId: evaluator.userId,
              studentId: student.userId,
              rubricId: rubric.id,
              criteriaEvaluations,
              overallFeedback: generateOverallFeedback(totalScore, maxPossibleScore),
              totalScore,
              maxPossibleScore,
              status: EvaluationStatus.COMPLETED,
              evaluatedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
            };

            evaluationPromises.push(createEvaluation(evaluationData));
            totalEvaluations++;
          }
        }
      }
    }

    // Crear todas las evaluaciones
    console.log(`\n⏳ Creando ${totalEvaluations} evaluaciones...`);
    await Promise.all(evaluationPromises);

    console.log(`\n🎉 ¡${totalEvaluations} evaluaciones creadas exitosamente!`);
    
    // Mostrar resumen por usuario
    console.log("\n📊 Resumen de evaluaciones por usuario:");
    const studentUsers = users.filter(user => user.role === "team_developer");
    
    for (const student of studentUsers.slice(0, 5)) { // Mostrar solo los primeros 5
      const studentEvaluations = await getEvaluationsByStudent(student.id);
      console.log(`  👨‍💻 ${student.firstName} ${student.lastName}: ${studentEvaluations.length} evaluaciones`);
    }

  } catch (error) {
    console.error("❌ Error poblando evaluaciones:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

function generateRealisticFeedback(criterionName: string, score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  const feedbacks = {
    high: [ // 85-100%
      `Excelente trabajo en ${criterionName.toLowerCase()}. Cumple completamente con los requisitos.`,
      `Muy buen desempeño en ${criterionName.toLowerCase()}. Se nota el esfuerzo y dedicación.`,
      `Sobresaliente en ${criterionName.toLowerCase()}. Supera las expectativas.`,
      `Trabajo excepcional en ${criterionName.toLowerCase()}. Muy bien ejecutado.`
    ],
    medium: [ // 70-84%
      `Buen trabajo en ${criterionName.toLowerCase()}. Cumple con la mayoría de requisitos.`,
      `Desempeño adecuado en ${criterionName.toLowerCase()}. Hay algunos aspectos a mejorar.`,
      `Trabajo satisfactorio en ${criterionName.toLowerCase()}. En general bien desarrollado.`,
      `Cumple con los requisitos básicos de ${criterionName.toLowerCase()}.`
    ],
    low: [ // <70%
      `${criterionName} necesita mejoras. Revisar los requisitos específicos.`,
      `Trabajo incompleto en ${criterionName.toLowerCase()}. Requiere más desarrollo.`,
      `${criterionName} no cumple completamente con las expectativas.`,
      `Necesita reforzar ${criterionName.toLowerCase()} para futuras entregas.`
    ]
  };

  let categoryFeedbacks;
  if (percentage >= 85) {
    categoryFeedbacks = feedbacks.high;
  } else if (percentage >= 70) {
    categoryFeedbacks = feedbacks.medium;
  } else {
    categoryFeedbacks = feedbacks.low;
  }

  return categoryFeedbacks[Math.floor(Math.random() * categoryFeedbacks.length)];
}

function generateOverallFeedback(totalScore: number, maxScore: number): string {
  const percentage = (totalScore / maxScore) * 100;
  
  if (percentage >= 90) {
    return "Excelente trabajo en general. El entregable cumple con todos los requisitos y muestra un alto nivel de calidad. Continúa con este nivel de excelencia.";
  } else if (percentage >= 80) {
    return "Muy buen trabajo. El entregable cumple con la mayoría de requisitos y muestra buena calidad. Hay algunos aspectos menores que se pueden mejorar.";
  } else if (percentage >= 70) {
    return "Trabajo satisfactorio. El entregable cumple con los requisitos básicos pero hay varios aspectos que necesitan mejoras para alcanzar un nivel superior.";
  } else {
    return "El entregable necesita mejoras significativas. Revisar los comentarios específicos y trabajar en los aspectos señalados para futuras entregas.";
  }
}

// Importar función necesaria
async function getEvaluationsByStudent(studentId: string) {
  const kv = getKv();
  const evaluations = [];
  
  const evaluationIds = await kv.list<string>({
    prefix: ["evaluations_by_student", studentId],
  });
  
  for await (const entry of evaluationIds) {
    if (entry.value) {
      const evaluation = await kv.get([`evaluations`, entry.value]);
      if (evaluation.value) {
        evaluations.push(evaluation.value);
      }
    }
  }
  
  return evaluations;
}

if (import.meta.main) {
  await populateEvaluations();
}
