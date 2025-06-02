#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script maestro para configurar una demostración COMPLETA del sistema
 * Ejecuta todos los scripts en orden para poblar TODAS las funcionalidades
 * Ejecutar con: deno run --unstable-kv -A scripts/setup-complete-demo.ts
 */

console.log("🎯 CONFIGURACIÓN COMPLETA DEL SISTEMA");
console.log("=====================================");
console.log("Este script creará un ejemplo COMPLETO con:");
console.log("• 👥 16+ usuarios con roles diversos");
console.log("• 📁 3 proyectos diferentes con equipos");
console.log("• 📝 18+ historias de usuario detalladas");
console.log("• 🏃 12+ sprints con cronología realista");
console.log("• ✅ 90+ tareas asignadas y en progreso");
console.log("• 📦 Entregables específicos");
console.log("• 📋 Rúbricas especializadas");
console.log("• 📊 Evaluaciones completas");
console.log("• 💬 Conversaciones y mensajes");
console.log("• 💭 Comentarios en tareas");
console.log("• 📈 Métricas y reportes");
console.log("=====================================\n");

async function runScript(scriptPath: string, description: string): Promise<boolean> {
  console.log(`\n🔄 ${description}...`);
  console.log("─".repeat(50));
  
  try {
    const process = new Deno.Command("deno", {
      args: ["run", "--unstable-kv", "-A", scriptPath],
      stdout: "piped",
      stderr: "piped"
    });
    
    const { code, stdout, stderr } = await process.output();
    
    if (code === 0) {
      console.log(new TextDecoder().decode(stdout));
      console.log(`✅ ${description} completado exitosamente`);
      return true;
    }

    console.error(`❌ Error en ${description}:`);
    console.error(new TextDecoder().decode(stderr));
    return false;
    
  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptPath}:`, error);
    return false;
  }
}

async function setupCompleteDemo() {
  console.log("🚀 Iniciando configuración completa del sistema...\n");
  
  let totalSuccess = true;
  
  // Paso 1: Limpiar base de datos
  console.log("🗑️ PASO 1: Limpiando base de datos...");
  const clearSuccess = await runScript(
    "scripts/clear-database.ts",
    "Limpiando base de datos completamente"
  );
  
  if (!clearSuccess) {
    console.log("⚠️ Error limpiando base de datos, pero continuando...");
    totalSuccess = false;
  }
  
  // Paso 2: Crear sistema base completo
  console.log("\n👥 PASO 2: Creando sistema base completo...");
  const systemSuccess = await runScript(
    "scripts/populate-complete-system.ts",
    "Creando usuarios, proyectos, historias, sprints y tareas"
  );
  
  if (!systemSuccess) {
    console.log("❌ Error crítico creando sistema base. Abortando...");
    return;
  }
  
  // Paso 3: Agregar métricas y datos adicionales
  console.log("\n🚀 PASO 3: Agregando métricas y datos adicionales...");
  const advancedSuccess = await runScript(
    "scripts/populate-metrics.ts",
    "Creando métricas, actividades y datos de rendimiento"
  );
  
  if (!advancedSuccess) {
    console.log("⚠️ Error en funcionalidades avanzadas, pero el sistema base está completo");
    totalSuccess = false;
  }
  
  // Mostrar resumen final
  console.log(`\n${"=".repeat(60)}`);
  if (totalSuccess) {
    console.log("🎉 ¡CONFIGURACIÓN COMPLETA EXITOSA!");
  } else {
    console.log("⚠️ CONFIGURACIÓN COMPLETADA CON ADVERTENCIAS");
  }
  console.log("=".repeat(60));
  
  console.log("\n📊 SISTEMA COMPLETO CREADO:");
  console.log("┌─────────────────────────────────────────────────────┐");
  console.log("│                 DATOS CREADOS                       │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ 👥 Usuarios:           16+ (Admin, PO, SM, Devs)    │");
  console.log("│ 📁 Proyectos:          3 (Gestión, Biblioteca, etc) │");
  console.log("│ 📝 Historias:          18+ (6 por proyecto)         │");
  console.log("│ 🏃 Sprints:            12+ (4 por proyecto)         │");
  console.log("│ ✅ Tareas:             90+ (5 por historia)         │");
  console.log("│ 📦 Entregables:        18+ (tareas marcadas)        │");
  console.log("│ 📋 Rúbricas:           2+ (General y específicas)   │");
  console.log("│ 📊 Evaluaciones:       15+ (entregables evaluados) │");
  console.log("│ 💬 Conversaciones:     6+ (equipos y directas)     │");
  console.log("│ 📨 Mensajes:           50+ (comunicación realista) │");
  console.log("│ 💭 Comentarios:        30+ (progreso en tareas)    │");
  console.log("└─────────────────────────────────────────────────────┘");
  
  console.log("\n🔑 CREDENCIALES DE ACCESO:");
  console.log("┌─────────────────┬─────────────────────────────┬─────────────┐");
  console.log("│ ROL             │ EMAIL                       │ CONTRASEÑA  │");
  console.log("├─────────────────┼─────────────────────────────┼─────────────┤");
  console.log("│ Admin           │ admin@admin.com             │ admin123    │");
  console.log("│ Profesor        │ martinez@universidad.edu    │ prof123     │");
  console.log("│ Product Owner   │ garcia@universidad.edu      │ po123       │");
  console.log("│ Scrum Master    │ fernandez@universidad.edu   │ sm123       │");
  console.log("│ Estudiante 1    │ perez@estudiante.edu        │ dev123      │");
  console.log("│ Estudiante 2    │ gonzalez@estudiante.edu     │ dev123      │");
  console.log("│ Estudiante 3    │ sanchez@estudiante.edu      │ dev123      │");
  console.log("│ ... y más       │ (ver logs anteriores)       │ dev123      │");
  console.log("└─────────────────┴─────────────────────────────┴─────────────┘");
  
  console.log("\n🎯 FUNCIONALIDADES PARA PROBAR:");
  console.log("• 🏠 Dashboard personalizado por rol");
  console.log("• 📁 Gestión completa de proyectos");
  console.log("• 📝 Backlog de producto con historias");
  console.log("• 🏃 Sprints con tareas asignadas");
  console.log("• 📋 Tablero Kanban interactivo");
  console.log("• 📊 Sistema de evaluaciones con rúbricas");
  console.log("• 💬 Chat interno entre equipos");
  console.log("• 📈 Métricas y reportes detallados");
  console.log("• 🔍 Búsqueda y filtros avanzados");
  console.log("• 👥 Gestión de usuarios y permisos");
  
  console.log("\n🚀 PRÓXIMOS PASOS:");
  console.log("1. Inicia tu servidor:");
  console.log("   deno task start");
  console.log("");
  console.log("2. Ve a tu plataforma:");
  console.log("   http://localhost:8000");
  console.log("");
  console.log("3. Inicia sesión con cualquier credencial");
  console.log("");
  console.log("4. Explora TODAS las funcionalidades:");
  console.log("   • Prueba diferentes roles");
  console.log("   • Navega entre proyectos");
  console.log("   • Usa el tablero Kanban");
  console.log("   • Evalúa entregables");
  console.log("   • Chatea con el equipo");
  console.log("   • Revisa métricas y reportes");
  
  console.log("\n💡 CONSEJOS DE USO:");
  console.log("• Cada rol tiene diferentes permisos y vistas");
  console.log("• Los proyectos tienen equipos reales asignados");
  console.log("• Las tareas están en diferentes estados");
  console.log("• Hay entregables listos para evaluar");
  console.log("• Las conversaciones tienen mensajes reales");
  console.log("• Los comentarios muestran progreso realista");
  
  if (totalSuccess) {
    console.log("\n🎊 ¡DISFRUTA EXPLORANDO TU PLATAFORMA COMPLETA!");
  } else {
    console.log("\n⚠️ Revisa los logs anteriores para detalles de advertencias");
  }
}

if (import.meta.main) {
  await setupCompleteDemo();
}
