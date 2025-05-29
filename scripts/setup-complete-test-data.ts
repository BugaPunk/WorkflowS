#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script maestro para configurar datos de prueba completos
 * Ejecuta todos los scripts de población de datos en el orden correcto
 */

import { getKv } from "../utils/db.ts";

console.log("🚀 Configurando datos de prueba completos para WorkflowS...");
console.log("=" .repeat(60));

async function clearDatabase() {
  console.log("🗑️  Limpiando base de datos...");
  const kv = getKv();
  
  // Obtener todas las claves y eliminarlas
  const entries = kv.list({ prefix: [] });
  const keysToDelete = [];
  
  for await (const entry of entries) {
    keysToDelete.push(entry.key);
  }
  
  for (const key of keysToDelete) {
    await kv.delete(key);
  }
  
  console.log(`✅ ${keysToDelete.length} registros eliminados de la base de datos`);
}

async function runScript(scriptPath: string, description: string) {
  console.log(`\n📋 ${description}...`);
  console.log("-".repeat(40));
  
  try {
    const process = new Deno.Command("deno", {
      args: ["run", "--unstable-kv", "-A", scriptPath],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { code, stdout, stderr } = await process.output();
    
    if (code === 0) {
      console.log(new TextDecoder().decode(stdout));
      console.log(`✅ ${description} completado exitosamente`);
    } else {
      console.error(`❌ Error en ${description}:`);
      console.error(new TextDecoder().decode(stderr));
      throw new Error(`Script failed: ${scriptPath}`);
    }
  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptPath}:`, error);
    throw error;
  }
}

try {
  // 1. Limpiar base de datos
  await clearDatabase();
  
  // 2. Ejecutar script de datos básicos
  await runScript(
    "./scripts/populate-extended-test-data.ts",
    "Creando datos básicos (usuarios, proyectos, sprints, historias, tareas, entregables)"
  );
  
  // 3. Mostrar información sobre rúbricas y evaluaciones
  await runScript(
    "./scripts/populate-rubrics-evaluations.ts",
    "Mostrando información sobre rúbricas y evaluaciones"
  );
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 ¡CONFIGURACIÓN COMPLETA!");
  console.log("=".repeat(60));
  
  console.log("\n📊 DATOS DE PRUEBA CREADOS:");
  console.log("👥 Usuarios:");
  console.log("   - admin / admin123 (Administrador)");
  console.log("   - maria.garcia / maria123 (Product Owner)");
  console.log("   - carlos.lopez / carlos123 (Scrum Master)");
  console.log("   - ana.martinez / dev123 (Developer)");
  console.log("   - luis.rodriguez / dev123 (Developer)");
  console.log("   - sofia.hernandez / dev123 (Developer)");
  console.log("   - diego.morales / dev123 (Developer)");
  console.log("   - laura.jimenez / dev123 (Developer)");
  
  console.log("\n📁 Proyectos:");
  console.log("   - Sistema de Gestión Académica (En progreso)");
  console.log("   - E-commerce Mobile App (Planificación)");
  
  console.log("\n🏃 Sprints:");
  console.log("   - Sprint 1: Autenticación y Usuarios (Completado)");
  console.log("   - Sprint 2: Gestión de Cursos (Activo)");
  console.log("   - Sprint 3: Sistema de Calificaciones (Planificado)");
  
  console.log("\n📖 Historias de Usuario:");
  console.log("   - 5 historias distribuidas en los sprints");
  console.log("   - Estados: DONE, IN_PROGRESS, TODO");
  
  console.log("\n📋 Tareas:");
  console.log("   - 8 tareas con diferentes estados");
  console.log("   - Asignadas a diferentes desarrolladores");
  console.log("   - Incluye registro de tiempo");
  
  console.log("\n📦 Entregables:");
  console.log("   - Se pueden crear desde la interfaz web");
  console.log("   - Tipos: Documentación, Código, Prototipos, Presentaciones");

  console.log("\n📏 Rúbricas y Evaluaciones:");
  console.log("   - Se pueden crear desde la interfaz web");
  console.log("   - Criterios personalizables con pesos y puntuaciones");
  console.log("   - Retroalimentación detallada por criterio");

  console.log("\n📈 Reportes:");
  console.log("   - Métricas de progreso de sprint disponibles");
  console.log("   - Reportes de carga de trabajo del equipo");
  console.log("   - Burndown charts automáticos");
  
  console.log("\n🌐 ACCESO AL SISTEMA:");
  console.log("1. Inicia el servidor: deno task start");
  console.log("2. Abre tu navegador en: http://localhost:8000");
  console.log("3. Inicia sesión con cualquiera de los usuarios listados arriba");
  
  console.log("\n🔍 FUNCIONALIDADES PARA PROBAR:");
  console.log("✅ Autenticación y roles de usuario");
  console.log("✅ Gestión de proyectos y miembros");
  console.log("✅ Creación y gestión de sprints");
  console.log("✅ Historias de usuario y backlog");
  console.log("✅ Tablero Kanban con tareas");
  console.log("✅ Registro de tiempo en tareas");
  console.log("✅ Entregables y evaluaciones");
  console.log("✅ Rúbricas de evaluación");
  console.log("✅ Reportes y métricas");
  console.log("✅ Dashboard personalizado por rol");
  
  console.log("\n💡 SUGERENCIAS DE PRUEBA:");
  console.log("1. Inicia como admin para ver la gestión completa");
  console.log("2. Cambia a Product Owner para gestionar backlog");
  console.log("3. Usa Scrum Master para gestionar sprints");
  console.log("4. Prueba como Developer para ver tareas asignadas");
  console.log("5. Explora las evaluaciones y rúbricas");
  console.log("6. Revisa los reportes y métricas");
  
} catch (error) {
  console.error("\n❌ Error durante la configuración:", error);
  console.log("\n🔧 SOLUCIÓN DE PROBLEMAS:");
  console.log("1. Asegúrate de que el servidor no esté ejecutándose");
  console.log("2. Verifica que tengas permisos de escritura");
  console.log("3. Ejecuta: deno cache --reload deps.ts");
  console.log("4. Intenta ejecutar los scripts individualmente");
  Deno.exit(1);
}
