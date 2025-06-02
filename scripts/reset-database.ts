#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para resetear la base de datos y poblarla con datos frescos
 * Ejecutar con: deno run --unstable-kv -A scripts/reset-database.ts
 */

console.log("🔄 RESET COMPLETO DE BASE DE DATOS");
console.log("==================================");
console.log("Este script:");
console.log("1. 🗑️  Limpia toda la base de datos");
console.log("2. 👥 Crea el usuario admin por defecto");
console.log("3. 📊 Opcionalmente puebla con datos de ejemplo");
console.log("==================================\n");

async function runScript(scriptPath: string, args: string[] = []): Promise<boolean> {
  try {
    const command = new Deno.Command("deno", {
      args: ["run", "--unstable-kv", "-A", scriptPath, ...args],
      stdout: "piped",
      stderr: "piped"
    });
    
    const { code, stdout, stderr } = await command.output();
    
    if (code === 0) {
      console.log(new TextDecoder().decode(stdout));
      return true;
    } else {
      console.error("❌ Error:");
      console.error(new TextDecoder().decode(stderr));
      return false;
    }
  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptPath}:`, error);
    return false;
  }
}

async function resetDatabase() {
  console.log("🗑️  Paso 1: Limpiando base de datos...");
  
  // Limpiar base de datos sin confirmación
  const clearSuccess = await runScript("scripts/clear-database.ts", ["--force"]);
  
  if (!clearSuccess) {
    console.log("❌ Error limpiando la base de datos");
    return;
  }
  
  console.log("\n✅ Base de datos limpia");
  
  // Preguntar si quiere poblar con datos de ejemplo
  console.log("\n❓ ¿Quieres poblar la base de datos con datos de ejemplo?");
  console.log("   Esto incluirá usuarios, proyectos, tareas y rúbricas");
  console.log("   (s/n):");
  
  const populateChoice = prompt("Poblar con datos de ejemplo:");
  
  if (populateChoice?.toLowerCase() === 's' || populateChoice?.toLowerCase() === 'si') {
    console.log("\n📊 Paso 2: Poblando con datos de ejemplo...");
    
    const populateSuccess = await runScript("scripts/setup-demo-data.ts");
    
    if (populateSuccess) {
      console.log("\n🎉 ¡RESET COMPLETADO EXITOSAMENTE!");
      console.log("✅ Base de datos limpia y poblada con datos de ejemplo");
    } else {
      console.log("\n⚠️  Base de datos limpia pero error poblando datos");
    }
  } else {
    console.log("\n✅ Base de datos limpia");
    console.log("💡 Nota: Solo existe el usuario admin por defecto");
    console.log("   Email: admin@admin.com");
    console.log("   Contraseña: admin123");
    
    console.log("\n📋 Para poblar con datos más tarde:");
    console.log("   deno run --unstable-kv -A scripts/setup-demo-data.ts");
  }
  
  console.log("\n🚀 Próximos pasos:");
  console.log("1. Inicia tu servidor: deno task start");
  console.log("2. Ve a http://localhost:8000");
  console.log("3. Inicia sesión con admin@admin.com / admin123");
}

if (import.meta.main) {
  await resetDatabase();
}
