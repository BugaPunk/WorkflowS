#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllUsers } from "../models/user.ts";
import { getRubricsByUser } from "../services/rubricService.ts";

async function listMyRubrics() {
  console.log("📋 Listando tus rúbricas...\n");

  try {
    // 1. Obtener todos los usuarios para encontrar admins
    console.log("👥 Obteniendo usuarios...");
    const users = await getAllUsers();
    
    console.log(`✅ Encontrados ${users.length} usuarios en el sistema:`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
    });

    // 2. Obtener rúbricas para cada usuario
    console.log("\n📋 Rúbricas por usuario:");
    
    let totalRubrics = 0;
    
    for (const user of users) {
      try {
        const userRubrics = await getRubricsByUser(user.id);
        
        if (userRubrics.length > 0) {
          console.log(`\n👤 ${user.username} (${user.email}):`);
          console.log(`   📊 Total: ${userRubrics.length} rúbricas`);
          
          userRubrics.forEach((rubric, index) => {
            console.log(`   ${index + 1}. ${rubric.name}`);
            console.log(`      📊 Estado: ${rubric.status}`);
            console.log(`      🎯 Criterios: ${rubric.criteria?.length || 0}`);
            console.log(`      📅 Creada: ${new Date(rubric.createdAt).toLocaleDateString()}`);
            if (rubric.isTemplate) {
              console.log(`      🔖 Es plantilla`);
            }
            if (rubric.description) {
              console.log(`      📝 Descripción: ${rubric.description}`);
            }
          });
          
          totalRubrics += userRubrics.length;
        } else {
          console.log(`\n👤 ${user.username}: Sin rúbricas`);
        }
      } catch (error) {
        console.log(`\n❌ Error al obtener rúbricas de ${user.username}: ${error.message}`);
      }
    }

    // 3. Resumen final
    console.log(`\n📊 RESUMEN TOTAL:`);
    console.log(`   👥 Usuarios: ${users.length}`);
    console.log(`   📋 Rúbricas totales: ${totalRubrics}`);
    
    if (totalRubrics === 0) {
      console.log(`\n💡 No hay rúbricas en el sistema. Puedes crear una nueva en:`);
      console.log(`   🌐 http://localhost:8000/rubrics/create`);
    } else {
      console.log(`\n🌐 Puedes ver todas las rúbricas en:`);
      console.log(`   📋 http://localhost:8000/rubrics`);
    }

  } catch (error) {
    console.error("❌ Error al listar rúbricas:", error);
  }
}

if (import.meta.main) {
  await listMyRubrics();
  Deno.exit(0);
}
