#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * SCRIPT FINAL COMPLETO Y ACTUALIZADO
 * Combina todas las partes y ejecuta la población completa del sistema
 */

// Importar las funciones de las partes anteriores
import { createSprintsAndTasks, createRubricsSystem } from "./populate-complete-system-part2.ts";
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

export async function createEvaluationsSystem(tasks: any[], rubrics: any[], users: any[]) {
  console.log("\n📊 Paso 7: Creando sistema completo de evaluaciones...");

  const evaluations = [];
  const professors = users.filter(user => 
    user.role === "admin" || 
    user.role === "product_owner" || 
    user.role === "scrum_master"
  );

  // Obtener solo las tareas que son entregables
  const deliverableTasks = tasks.filter(task => task.isDeliverable);

  for (const task of deliverableTasks) {
    // Solo evaluar tareas completadas o en revisión
    if (task.status === "done" || task.status === "review") {
      const professor = randomChoice(professors);
      const rubric = randomChoice(rubrics);

      // Crear evaluación con calificaciones realistas
      const scores = rubric.criteria.map((criterion: any) => {
        const level = randomChoice(criterion.levels);
        return {
          criterionId: criterion.id || crypto.randomUUID(),
          levelId: level.id || crypto.randomUUID(),
          points: level.pointValue,
          comments: `Evaluación del criterio ${criterion.name}: ${level.description}`
        };
      });

      const totalScore = scores.reduce((sum: number, score: any) => sum + score.points, 0);
      const maxScore = rubric.criteria.reduce((sum: any, criterion: any) => sum + criterion.maxPoints, 0);

      const evaluationData = {
        deliverableId: task.id,
        rubricId: rubric.id,
        evaluatorId: professor.id,
        scores,
        totalScore,
        maxScore,
        feedback: `Evaluación completa del entregable "${task.title}". El trabajo demuestra ${totalScore >= maxScore * 0.8 ? 'excelente' : totalScore >= maxScore * 0.6 ? 'buen' : 'regular'} nivel de calidad.`,
        status: randomChoice([EvaluationStatus.COMPLETED, EvaluationStatus.COMPLETED, EvaluationStatus.DRAFT]),
        submittedAt: getRandomDate(10, 0),
        evaluatedAt: getRandomDate(5, 0)
      };

      try {
        const evaluation = await createEvaluation(evaluationData);
        evaluations.push(evaluation);
        console.log(`✅ Evaluación creada para: ${task.title}`);
      } catch (error) {
        console.log(`⚠️ Error creando evaluación para ${task.title}: ${error}`);
      }
    }
  }

  console.log(`\n📊 Total evaluaciones: ${evaluations.length}`);
  return evaluations;
}

export async function createMessagingSystem(projects: any[], users: any[]) {
  console.log("\n💬 Paso 8: Creando sistema de mensajes y conversaciones...");

  const conversations = [];
  const messages = [];

  for (const project of projects) {
    const teamMembers = [
      project.productOwner,
      project.scrumMaster,
      ...project.teamMembers
    ].filter(Boolean);

    if (teamMembers.length < 2) continue;

    // Crear conversación del equipo
    const teamConversation = await createConversation({
      name: `Equipo ${project.name}`,
      type: ConversationType.GROUP,
      participants: teamMembers.map(member => member.id),
      createdBy: project.scrumMaster?.id || teamMembers[0].id,
      projectId: project.id
    });

    conversations.push(teamConversation);

    // Crear mensajes de ejemplo
    const sampleMessages = [
      "¡Hola equipo! Bienvenidos al proyecto. Vamos a trabajar juntos para lograr nuestros objetivos.",
      "He revisado los requisitos del proyecto. ¿Podemos programar una reunión para discutir la arquitectura?",
      "Subí la primera versión del diseño. Por favor revisen y comenten.",
      "¿Alguien puede ayudarme con la integración de la API? Tengo algunas dudas.",
      "Excelente trabajo en el último sprint. Sigamos así para el próximo.",
      "Recordatorio: La demo del sprint es mañana a las 2 PM.",
      "He actualizado la documentación con los últimos cambios.",
      "¿Podemos revisar juntos los casos de prueba antes de la entrega?",
    ];

    for (let i = 0; i < Math.min(sampleMessages.length, 5); i++) {
      const sender = randomChoice(teamMembers);
      const message = await createMessage({
        conversationId: teamConversation.id,
        senderId: sender.id,
        content: sampleMessages[i],
        timestamp: getRandomDate(15, 0)
      });

      messages.push(message);
    }

    console.log(`✅ Conversación creada para: ${project.name}`);

    // Crear algunas conversaciones privadas entre miembros
    for (let i = 0; i < Math.min(teamMembers.length - 1, 3); i++) {
      const participant1 = teamMembers[i];
      const participant2 = teamMembers[i + 1];

      const privateConversation = await createConversation({
        name: `${participant1.firstName} y ${participant2.firstName}`,
        type: ConversationType.DIRECT,
        participants: [participant1.id, participant2.id],
        createdBy: participant1.id
      });

      conversations.push(privateConversation);

      // Mensaje privado
      const privateMessage = await createMessage({
        conversationId: privateConversation.id,
        senderId: participant1.id,
        content: "Hola, ¿podemos coordinar mejor nuestras tareas para el próximo sprint?",
        timestamp: getRandomDate(7, 0)
      });

      messages.push(privateMessage);
    }
  }

  console.log(`\n📊 Total conversaciones: ${conversations.length}`);
  console.log(`📊 Total mensajes: ${messages.length}`);
  return { conversations, messages };
}

export async function createTaskComments(tasks: any[], users: any[]) {
  console.log("\n💭 Paso 9: Creando comentarios en tareas...");

  const comments = [];

  for (const task of tasks) {
    // Solo agregar comentarios a algunas tareas (no todas)
    if (Math.random() > 0.6) continue;

    const project = task.project;
    const teamMembers = [
      project.productOwner,
      project.scrumMaster,
      ...project.teamMembers
    ].filter(Boolean);

    if (teamMembers.length === 0) continue;

    const sampleComments = [
      "Iniciando trabajo en esta tarea. Estimación parece correcta.",
      "Encontré algunos desafíos técnicos. Podría necesitar más tiempo.",
      "Completé la implementación básica. Lista para revisión.",
      "Agregué pruebas unitarias. Todo funcionando correctamente.",
      "Documentación actualizada con los cambios realizados.",
      "Revisé el código. Se ve bien, solo algunos comentarios menores.",
      "Integración completada exitosamente con el resto del sistema.",
      "Listo para demo. ¿Podemos programar una revisión?",
    ];

    const numComments = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numComments; i++) {
      const commenter = randomChoice(teamMembers);
      const comment = randomChoice(sampleComments);

      try {
        const taskComment = await createTaskComment({
          taskId: task.id,
          userId: commenter.id,
          content: comment,
          timestamp: getRandomDate(20, 0)
        });

        comments.push(taskComment);
      } catch (error) {
        console.log(`⚠️ Error creando comentario: ${error}`);
      }
    }
  }

  console.log(`\n📊 Total comentarios: ${comments.length}`);
  return comments;
}

export async function generateSystemSummary(data: any) {
  console.log("\n🎉 ¡SISTEMA COMPLETO POBLADO EXITOSAMENTE!");
  console.log("=============================================");
  console.log(`👥 Usuarios creados: ${data.users?.length || 0}`);
  console.log(`📁 Proyectos creados: ${data.projects?.length || 0}`);
  console.log(`📝 Historias de usuario: ${data.userStories?.length || 0}`);
  console.log(`🏃 Sprints creados: ${data.sprints?.length || 0}`);
  console.log(`✅ Tareas creadas: ${data.tasks?.length || 0}`);
  console.log(`📋 Rúbricas creadas: ${data.rubrics?.length || 0}`);
  console.log(`📊 Evaluaciones creadas: ${data.evaluations?.length || 0}`);
  console.log(`💬 Conversaciones creadas: ${data.conversations?.length || 0}`);
  console.log(`📨 Mensajes creados: ${data.messages?.length || 0}`);
  console.log(`💭 Comentarios creados: ${data.comments?.length || 0}`);
  console.log("=============================================");
  
  console.log("\n🎯 FUNCIONALIDADES DISPONIBLES:");
  console.log("• ✅ Sistema de autenticación y roles");
  console.log("• ✅ Gestión completa de proyectos");
  console.log("• ✅ Historias de usuario y sprints");
  console.log("• ✅ Tareas y entregables");
  console.log("• ✅ Rúbricas especializadas (4 plantillas)");
  console.log("• ✅ Sistema completo de evaluaciones");
  console.log("• ✅ Mensajería y conversaciones");
  console.log("• ✅ Comentarios en tareas");
  console.log("• ✅ Dashboard personalizado por rol");
  console.log("• ✅ Métricas y reportes");
  
  console.log("\n🌐 RUTAS PRINCIPALES PARA PROBAR:");
  console.log("• http://localhost:8000/ - Dashboard principal");
  console.log("• http://localhost:8000/projects - Gestión de proyectos");
  console.log("• http://localhost:8000/my-tasks - Mis tareas asignadas");
  console.log("• http://localhost:8000/evaluations - Sistema de evaluaciones");
  console.log("• http://localhost:8000/rubrics - Gestión de rúbricas");
  console.log("• http://localhost:8000/rubrics/list - Lista completa de rúbricas");
  console.log("• http://localhost:8000/users - Gestión de usuarios (admin)");
  
  console.log("\n👤 USUARIOS DE PRUEBA:");
  console.log("• admin / admin123 - Administrador principal");
  console.log("• prof.martinez / prof123 - Profesor");
  console.log("• po.garcia / po123 - Product Owner");
  console.log("• sm.fernandez / sm123 - Scrum Master");
  console.log("• dev.perez / dev123 - Estudiante");
  
  console.log("\n🎊 ¡El sistema está listo para usar con datos completos!");
}
