#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllUsers } from "../models/user.ts";
import { getRubricsByUser, RUBRIC_COLLECTIONS } from "../services/rubricService.ts";
import { getKv } from "../utils/db.ts";

async function countRubrics() {
  console.log("📊 Contando rúbricas en el sistema...\n");

  try {
    // 1. Obtener todas las rúbricas directamente de la base de datos
    console.log("🔍 Obteniendo todas las rúbricas de la base de datos...");
    const kv = getKv();
    const rubrics = [];
    
    // Iterar sobre todas las rúbricas en la colección
    for await (const entry of kv.list({ prefix: RUBRIC_COLLECTIONS.RUBRICS })) {
      if (entry.value) {
        rubrics.push(entry.value);
      }
    }

    console.log(`✅ Total de rúbricas en el sistema: ${rubrics.length}`);

    if (rubrics.length === 0) {
      console.log("\n📝 No hay rúbricas en el sistema.");
      return;
    }

    // 2. Agrupar por usuario creador
    console.log("\n👥 Rúbricas por usuario:");
    const rubricsByUser = new Map();
    
    for (const rubric of rubrics) {
      const createdBy = rubric.createdBy;
      if (!rubricsByUser.has(createdBy)) {
        rubricsByUser.set(createdBy, []);
      }
      rubricsByUser.get(createdBy).push(rubric);
    }

    // 3. Obtener información de usuarios
    const users = await getAllUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    // 4. Mostrar estadísticas por usuario
    for (const [userId, userRubrics] of rubricsByUser.entries()) {
      const user = userMap.get(userId);
      const userName = user ? `${user.username} (${user.email})` : `Usuario desconocido (${userId})`;
      
      console.log(`   📋 ${userName}: ${userRubrics.length} rúbricas`);
      
      // Mostrar detalles de cada rúbrica
      for (const rubric of userRubrics) {
        console.log(`      - ${rubric.name} (${rubric.status})`);
        if (rubric.isTemplate) {
          console.log(`        🔖 Plantilla`);
        }
        console.log(`        📅 Creada: ${new Date(rubric.createdAt).toLocaleDateString()}`);
        console.log(`        🎯 Criterios: ${rubric.criteria?.length || 0}`);
      }
      console.log("");
    }

    // 5. Estadísticas generales
    console.log("📈 Estadísticas generales:");
    
    const statusCounts = {
      draft: 0,
      active: 0,
      archived: 0
    };
    
    let templateCount = 0;
    let totalCriteria = 0;
    
    for (const rubric of rubrics) {
      statusCounts[rubric.status] = (statusCounts[rubric.status] || 0) + 1;
      if (rubric.isTemplate) templateCount++;
      totalCriteria += rubric.criteria?.length || 0;
    }

    console.log(`   📊 Por estado:`);
    console.log(`      - Borradores: ${statusCounts.draft || 0}`);
    console.log(`      - Activas: ${statusCounts.active || 0}`);
    console.log(`      - Archivadas: ${statusCounts.archived || 0}`);
    console.log(`   🔖 Plantillas: ${templateCount}`);
    console.log(`   🎯 Total de criterios: ${totalCriteria}`);
    console.log(`   📊 Promedio de criterios por rúbrica: ${(totalCriteria / rubrics.length).toFixed(1)}`);

    // 6. Rúbricas más recientes
    console.log("\n🕒 Rúbricas más recientes:");
    const recentRubrics = rubrics
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    
    for (const rubric of recentRubrics) {
      const user = userMap.get(rubric.createdBy);
      const userName = user ? user.username : "Usuario desconocido";
      console.log(`   📋 ${rubric.name}`);
      console.log(`      👤 Creada por: ${userName}`);
      console.log(`      📅 Fecha: ${new Date(rubric.createdAt).toLocaleDateString()}`);
      console.log(`      📊 Estado: ${rubric.status}`);
    }

  } catch (error) {
    console.error("❌ Error al contar rúbricas:", error);
  }
}

if (import.meta.main) {
  await countRubrics();
  Deno.exit(0);
}
