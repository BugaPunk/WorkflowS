#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script maestro para configurar datos de demostración completos
 * Ejecutar con: deno run --unstable-kv -A scripts/setup-demo-data.ts
 */

console.log("🎯 CONFIGURACIÓN DE DATOS DE DEMOSTRACIÓN");
console.log("==========================================");

async function runScript(scriptPath: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    const process = new Deno.Command("deno", {
      args: ["run", "--unstable-kv", "-A", scriptPath],
      stdout: "piped",
      stderr: "piped"
    });
    
    const { code, stdout, stderr } = await process.output();
    
    if (code === 0) {
      console.log(new TextDecoder().decode(stdout));
      console.log(`✅ ${description} completado`);
    } else {
      console.error(`❌ Error en ${description}:`);
      console.error(new TextDecoder().decode(stderr));
    }
    
    return code === 0;
  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptPath}:`, error);
    return false;
  }
}

async function setupDemoData() {
  console.log("🚀 Iniciando configuración de datos de demostración...\n");
  
  // 1. Crear datos básicos (usuarios, proyectos, historias, tareas)
  const step1 = await runScript(
    "scripts/populate-sample-data-simple.ts",
    "Creando usuarios, proyectos y tareas básicas"
  );
  
  if (!step1) {
    console.log("⚠️ Continuando con el siguiente paso...");
  }
  
  // 2. Crear rúbricas
  const step2 = await runScript(
    "scripts/populate-rubrics.ts", 
    "Creando rúbricas de evaluación"
  );
  
  if (!step2) {
    console.log("⚠️ Error creando rúbricas, pero continuando...");
  }
  
  console.log("\n🎉 ¡CONFIGURACIÓN COMPLETADA!");
  console.log("============================");
  console.log("\n📋 CREDENCIALES DE ACCESO:");
  console.log("┌─────────────────┬─────────────────────────────┬─────────────┐");
  console.log("│ ROL             │ EMAIL                       │ CONTRASEÑA  │");
  console.log("├─────────────────┼─────────────────────────────┼─────────────┤");
  console.log("│ Admin           │ admin@admin.com             │ admin123    │");
  console.log("│ Profesor        │ martinez@universidad.edu    │ prof123     │");
  console.log("│ Product Owner   │ garcia@universidad.edu      │ po123       │");
  console.log("│ Scrum Master    │ lopez@universidad.edu       │ sm123       │");
  console.log("│ Estudiante      │ perez@estudiante.edu        │ dev123      │");
  console.log("│ Estudiante      │ gonzalez@estudiante.edu     │ dev123      │");
  console.log("│ Estudiante      │ sanchez@estudiante.edu      │ dev123      │");
  console.log("└─────────────────┴─────────────────────────────┴─────────────┘");
  
  console.log("\n🎯 DATOS CREADOS:");
  console.log("• 👥 Usuarios con diferentes roles");
  console.log("• 📁 Proyecto de ejemplo: 'Sistema de Gestión Académica'");
  console.log("• 📝 Historias de usuario básicas");
  console.log("• 🏃 Sprint activo con tareas");
  console.log("• ✅ Tareas asignadas a estudiantes");
  console.log("• 📋 Rúbricas de evaluación (general y presentaciones)");
  
  console.log("\n🌐 PRÓXIMOS PASOS:");
  console.log("1. Inicia tu servidor: deno task start");
  console.log("2. Ve a http://localhost:8000");
  console.log("3. Inicia sesión con cualquiera de las credenciales");
  console.log("4. Explora las funcionalidades:");
  console.log("   • Dashboard personalizado por rol");
  console.log("   • Gestión de proyectos y equipos");
  console.log("   • Tablero Kanban con tareas");
  console.log("   • Sistema de evaluaciones");
  console.log("   • Métricas y reportes");
  
  console.log("\n💡 RECOMENDACIONES:");
  console.log("• Usa el admin para gestionar usuarios y proyectos");
  console.log("• Usa el Product Owner para crear historias de usuario");
  console.log("• Usa el Scrum Master para gestionar sprints");
  console.log("• Usa los estudiantes para trabajar en tareas");
  console.log("• Prueba las evaluaciones con las rúbricas creadas");
}

if (import.meta.main) {
  await setupDemoData();
}
