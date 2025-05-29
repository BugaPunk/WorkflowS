#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script para poblar rúbricas y evaluaciones
 * Este script debe ejecutarse después del script principal de datos de prueba
 */

// Nota: Este script está simplificado para funcionar con las funciones disponibles
// Las rúbricas y evaluaciones se pueden crear desde la interfaz web

// Función auxiliar para obtener fechas relativas
function getRelativeDate(daysFromNow: number): number {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.getTime();
}

console.log("🎯 Información sobre rúbricas y evaluaciones...");

try {

  console.log("\n📏 Información sobre rúbricas y evaluaciones:");
  console.log("Las rúbricas y evaluaciones se pueden crear desde la interfaz web:");
  console.log("1. Inicia sesión como Product Owner o Scrum Master");
  console.log("2. Ve a la sección de Evaluaciones");
  console.log("3. Crea rúbricas con criterios personalizados");
  console.log("4. Evalúa entregables usando las rúbricas creadas");

  console.log("\n📊 Tipos de rúbricas sugeridas:");
  console.log("- Evaluación de Documentación (Claridad, Completitud, Precisión, Formato)");
  console.log("- Evaluación de Código (Funcionalidad, Calidad, Documentación, Pruebas)");
  console.log("- Evaluación de Prototipos (Usabilidad, Diseño, Funcionalidad, Requisitos)");

  console.log("\n📈 Reportes disponibles:");
  console.log("- Progreso de sprints");
  console.log("- Métricas de evaluaciones");
  console.log("- Carga de trabajo del equipo");
  console.log("- Burndown charts");

  console.log("\n✨ ¡Información proporcionada!");
  console.log("Usa la interfaz web para crear rúbricas y evaluaciones personalizadas.");


} catch (error) {
  console.error("❌ Error:", error);
  Deno.exit(1);
}
