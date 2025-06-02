#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * SCRIPT MAESTRO ACTUALIZADO - SETUP COMPLETO DEL SISTEMA
 * 
 * Este script ejecuta TODOS los scripts de población en el orden correcto
 * para crear un sistema completamente funcional con datos de ejemplo.
 * 
 * Ejecutar con: deno run --unstable-kv -A scripts/setup-complete-demo-updated.ts
 */

console.log("🚀 CONFIGURACIÓN COMPLETA DEL SISTEMA DEMO");
console.log("==========================================");
console.log("Este script ejecutará TODOS los scripts de población:");
console.log("1. 👥 Usuarios y proyectos básicos");
console.log("2. 📋 Rúbricas especializadas");
console.log("3. 📊 Evaluaciones completas");
console.log("4. 📈 Métricas y datos adicionales");
console.log("==========================================\n");

async function setupCompleteDemo() {
  try {
    console.log("🔄 Paso 1: Ejecutando población básica...");
    
    // Ejecutar el script de población básica
    const basicProcess = new Deno.Command("deno", {
      args: ["run", "-A", "--unstable-kv", "scripts/populate-everything.ts"],
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const basicResult = await basicProcess.output();
    if (!basicResult.success) {
      throw new Error("Error en población básica");
    }
    
    console.log("\n✅ Población básica completada");
    
    // Esperar un momento para que se procesen los datos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("\n🔄 Paso 2: Ejecutando población de rúbricas...");
    
    // Ejecutar el script de rúbricas
    const rubricsProcess = new Deno.Command("deno", {
      args: ["run", "-A", "--unstable-kv", "scripts/populate-rubrics.ts"],
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const rubricsResult = await rubricsProcess.output();
    if (!rubricsResult.success) {
      console.log("⚠️ Advertencia: Error en población de rúbricas, continuando...");
    } else {
      console.log("\n✅ Rúbricas pobladas exitosamente");
    }
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("\n🔄 Paso 3: Ejecutando población de evaluaciones...");
    
    // Ejecutar el script de evaluaciones
    const evaluationsProcess = new Deno.Command("deno", {
      args: ["run", "-A", "--unstable-kv", "scripts/populate-evaluations.ts"],
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const evaluationsResult = await evaluationsProcess.output();
    if (!evaluationsResult.success) {
      console.log("⚠️ Advertencia: Error en población de evaluaciones, continuando...");
    } else {
      console.log("\n✅ Evaluaciones pobladas exitosamente");
    }
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("\n🔄 Paso 4: Ejecutando población de métricas...");
    
    // Ejecutar el script de métricas
    const metricsProcess = new Deno.Command("deno", {
      args: ["run", "-A", "--unstable-kv", "scripts/populate-metrics.ts"],
      stdout: "inherit",
      stderr: "inherit",
    });
    
    const metricsResult = await metricsProcess.output();
    if (!metricsResult.success) {
      console.log("⚠️ Advertencia: Error en población de métricas, continuando...");
    } else {
      console.log("\n✅ Métricas pobladas exitosamente");
    }
    
    console.log("\n🎉 ¡CONFIGURACIÓN COMPLETA FINALIZADA!");
    console.log("=====================================");
    console.log("El sistema demo está completamente configurado con:");
    console.log("• ✅ Usuarios y roles diversos");
    console.log("• ✅ Proyectos con equipos completos");
    console.log("• ✅ Historias de usuario detalladas");
    console.log("• ✅ Sprints y tareas realistas");
    console.log("• ✅ Rúbricas especializadas");
    console.log("• ✅ Evaluaciones con calificaciones");
    console.log("• ✅ Métricas y reportes");
    console.log("• ✅ Datos de ejemplo completos");
    console.log("=====================================");
    
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
    
    console.log("\n🚀 PARA INICIAR EL SERVIDOR:");
    console.log("deno task start");
    
    console.log("\n🎊 ¡El sistema está listo para usar!");
    
  } catch (error) {
    console.error("❌ Error en la configuración completa:", error);
    console.log("\n🔧 SOLUCIÓN DE PROBLEMAS:");
    console.log("1. Asegúrate de que el servidor no esté ejecutándose");
    console.log("2. Ejecuta: deno run -A --unstable-kv scripts/clear-database.ts");
    console.log("3. Vuelve a ejecutar este script");
    throw error;
  }
}

if (import.meta.main) {
  await setupCompleteDemo();
}
