#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para poblar métricas y datos adicionales del sistema
 * Ejecutar después de populate-complete-system.ts
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-metrics.ts
 */

import { getKv } from "../utils/db.ts";
import { getAllUsers } from "../models/user.ts";
import { getAllProjects } from "../models/project.ts";

console.log("🚀 POBLANDO MÉTRICAS Y DATOS ADICIONALES");
console.log("========================================");
console.log("Este script agregará:");
console.log("• 📊 Métricas de ejemplo");
console.log("• 📋 Datos adicionales para dashboards");
console.log("• 🔍 Datos para búsquedas y filtros");
console.log("========================================\n");

async function populateMetrics() {
  try {
    console.log("📊 Obteniendo datos existentes...");
    
    const users = await getAllUsers();
    const projects = await getAllProjects();
    
    console.log(`✅ Datos cargados: ${users.length} usuarios, ${projects.length} proyectos`);

    console.log("\n📊 Paso 1: Creando métricas de ejemplo...");
    
    const kv = getKv();
    
    // Crear algunas métricas de ejemplo para el dashboard
    const metrics = [
      {
        type: "project_completion",
        value: Math.floor(Math.random() * 40) + 60, // 60-100%
        label: "Progreso General de Proyectos",
        timestamp: Date.now()
      },
      {
        type: "user_activity",
        value: Math.floor(Math.random() * 20) + 80, // 80-100%
        label: "Actividad de Usuarios",
        timestamp: Date.now()
      },
      {
        type: "task_completion_rate",
        value: Math.floor(Math.random() * 30) + 70, // 70-100%
        label: "Tasa de Completación de Tareas",
        timestamp: Date.now()
      },
      {
        type: "sprint_velocity",
        value: Math.floor(Math.random() * 20) + 25, // 25-45 puntos
        label: "Velocidad Promedio de Sprint",
        timestamp: Date.now()
      },
      {
        type: "team_performance",
        value: Math.floor(Math.random() * 25) + 75, // 75-100%
        label: "Rendimiento del Equipo",
        timestamp: Date.now()
      }
    ];

    for (const metric of metrics) {
      await kv.set(["metrics", metric.type, Date.now()], metric);
      console.log(`✅ Métrica creada: ${metric.label} - ${metric.value}${metric.type === 'sprint_velocity' ? ' pts' : '%'}`);
    }

    console.log("\n📋 Paso 2: Creando datos adicionales para dashboards...");
    
    // Crear datos de actividad reciente
    const recentActivities = [
      {
        type: "task_completed",
        description: "Tarea completada: Implementación de autenticación",
        userId: users[0]?.id || "admin",
        timestamp: Date.now() - (1000 * 60 * 30) // 30 minutos atrás
      },
      {
        type: "project_updated",
        description: "Proyecto actualizado: Sistema de Gestión Académica",
        userId: users[1]?.id || "admin",
        timestamp: Date.now() - (1000 * 60 * 60 * 2) // 2 horas atrás
      },
      {
        type: "user_joined",
        description: "Nuevo usuario se unió al proyecto",
        userId: users[2]?.id || "admin",
        timestamp: Date.now() - (1000 * 60 * 60 * 24) // 1 día atrás
      },
      {
        type: "sprint_started",
        description: "Nuevo sprint iniciado: Sprint 3 - Funcionalidades Core",
        userId: users[3]?.id || "admin",
        timestamp: Date.now() - (1000 * 60 * 60 * 48) // 2 días atrás
      },
      {
        type: "evaluation_completed",
        description: "Evaluación completada para entregable de autenticación",
        userId: users[4]?.id || "admin",
        timestamp: Date.now() - (1000 * 60 * 60 * 72) // 3 días atrás
      }
    ];

    for (const activity of recentActivities) {
      await kv.set(["activities", Date.now(), crypto.randomUUID()], activity);
      console.log(`✅ Actividad creada: ${activity.description}`);
    }

    console.log("\n🔍 Paso 3: Creando datos para búsquedas y filtros...");
    
    // Crear índices de búsqueda para mejorar la experiencia
    const searchIndexes = [
      {
        type: "popular_searches",
        terms: ["autenticación", "dashboard", "tareas", "proyectos", "usuarios", "sprint", "kanban"],
        timestamp: Date.now()
      },
      {
        type: "recent_searches",
        terms: ["evaluación", "entregables", "rúbricas", "métricas"],
        timestamp: Date.now()
      },
      {
        type: "suggested_searches",
        terms: ["mis tareas", "proyecto activo", "sprint actual", "evaluaciones pendientes"],
        timestamp: Date.now()
      }
    ];

    for (const index of searchIndexes) {
      await kv.set(["search_indexes", index.type], index);
      console.log(`✅ Índice de búsqueda creado: ${index.type} (${index.terms.length} términos)`);
    }

    console.log("\n📈 Paso 4: Creando datos de rendimiento...");
    
    // Crear datos de rendimiento histórico
    const performanceData = [];
    for (let i = 0; i < 30; i++) { // Últimos 30 días
      const date = Date.now() - (i * 24 * 60 * 60 * 1000);
      const data = {
        date,
        tasksCompleted: Math.floor(Math.random() * 10) + 5, // 5-15 tareas por día
        hoursWorked: Math.floor(Math.random() * 4) + 6, // 6-10 horas por día
        projectProgress: Math.floor(Math.random() * 5) + 2, // 2-7% progreso por día
        teamActivity: Math.floor(Math.random() * 30) + 70 // 70-100% actividad
      };
      
      await kv.set(["performance", "daily", date], data);
      performanceData.push(data);
    }
    
    console.log(`✅ Datos de rendimiento creados: ${performanceData.length} días`);

    console.log("\n🎉 ¡MÉTRICAS Y DATOS ADICIONALES COMPLETADOS!");
    console.log("=============================================");
    console.log(`📊 Métricas: ${metrics.length}`);
    console.log(`📋 Actividades: ${recentActivities.length}`);
    console.log(`🔍 Índices de búsqueda: ${searchIndexes.length}`);
    console.log(`📈 Datos de rendimiento: ${performanceData.length} días`);
    console.log("=============================================");
    console.log("\n💡 Estos datos mejorarán la experiencia del dashboard");
    console.log("y proporcionarán información valiosa para los usuarios.");

  } catch (error) {
    console.error("❌ Error poblando métricas:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

if (import.meta.main) {
  await populateMetrics();
}
