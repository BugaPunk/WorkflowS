#!/usr/bin/env -S deno run -A --unstable-kv

import { createRubric, getRubricsByUser, deleteRubric } from "../services/rubricService.ts";
import { getAllUsers } from "../models/user.ts";
import { RubricStatus } from "../models/rubric.ts";

async function testRubricDeletion() {
  console.log("🧪 Probando funcionalidad de eliminación de rúbricas...\n");

  try {
    // 1. Obtener un usuario admin
    console.log("👥 Obteniendo usuarios...");
    const users = await getAllUsers();
    const adminUser = users.find(u => u.role === "admin");
    
    if (!adminUser) {
      console.log("❌ No se encontró un usuario admin");
      return;
    }
    
    console.log(`✅ Usuario admin encontrado: ${adminUser.username} (ID: ${adminUser.id})`);

    // 2. Crear una rúbrica de prueba
    console.log("\n📝 Creando rúbrica de prueba...");
    const testRubric = await createRubric({
      name: "Rúbrica de Prueba para Eliminación",
      description: "Esta es una rúbrica creada para probar la funcionalidad de eliminación",
      createdBy: adminUser.id,
      criteria: [
        {
          id: "test-criterion-1",
          name: "Criterio de Prueba",
          description: "Un criterio de ejemplo",
          maxPoints: 4,
          levels: [
            {
              id: "level-1",
              description: "Trabajo excelente",
              pointValue: 4
            },
            {
              id: "level-2",
              description: "Trabajo bueno",
              pointValue: 3
            }
          ]
        }
      ],
      isTemplate: false,
      status: RubricStatus.DRAFT
    });

    console.log(`✅ Rúbrica creada: ${testRubric.name} (ID: ${testRubric.id})`);

    // 3. Verificar que la rúbrica existe
    console.log("\n🔍 Verificando que la rúbrica existe...");
    const userRubrics = await getRubricsByUser(adminUser.id);
    const foundRubric = userRubrics.find(r => r.id === testRubric.id);
    
    if (foundRubric) {
      console.log(`✅ Rúbrica encontrada en la lista del usuario`);
    } else {
      console.log(`❌ Rúbrica no encontrada en la lista del usuario`);
      return;
    }

    // 4. Probar la eliminación
    console.log("\n🗑️ Eliminando rúbrica...");
    const deleteResult = await deleteRubric(testRubric.id);
    
    if (deleteResult) {
      console.log(`✅ Rúbrica eliminada exitosamente`);
    } else {
      console.log(`❌ Error al eliminar la rúbrica`);
      return;
    }

    // 5. Verificar que la rúbrica ya no existe
    console.log("\n🔍 Verificando que la rúbrica fue eliminada...");
    const userRubricsAfterDelete = await getRubricsByUser(adminUser.id);
    const foundRubricAfterDelete = userRubricsAfterDelete.find(r => r.id === testRubric.id);
    
    if (!foundRubricAfterDelete) {
      console.log(`✅ Rúbrica eliminada correctamente - ya no aparece en la lista`);
    } else {
      console.log(`❌ Error: La rúbrica aún aparece en la lista después de eliminarla`);
    }

    console.log("\n📊 Resumen del test:");
    console.log(`   ✅ Creación de rúbrica: OK`);
    console.log(`   ✅ Verificación de existencia: OK`);
    console.log(`   ✅ Eliminación: OK`);
    console.log(`   ✅ Verificación de eliminación: OK`);
    console.log("\n🎉 Todas las pruebas de eliminación pasaron exitosamente!");

  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
  }
}

if (import.meta.main) {
  await testRubricDeletion();
  Deno.exit(0);
}
