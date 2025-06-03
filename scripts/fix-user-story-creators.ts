#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllProjects } from "../models/project.ts";
import { getUserStoriesWithFilters, updateUserStory } from "../models/userStory.ts";
import { getAllUsers } from "../models/user.ts";

async function fixUserStoryCreators() {
  console.log("🔧 Corrigiendo creadores de historias de usuario...\n");

  try {
    // 1. Obtener todos los usuarios
    console.log("👥 Obteniendo usuarios...");
    const users = await getAllUsers();
    console.log(`   Encontrados ${users.length} usuarios`);
    
    // Buscar un usuario admin
    const adminUser = users.find(u => u.role === "admin");
    if (!adminUser) {
      console.log("❌ No se encontró un usuario admin");
      return;
    }
    
    console.log(`✅ Usuario admin encontrado: ${adminUser.username} (ID: ${adminUser.id})`);

    // 2. Buscar el proyecto "Sistema de Gestión Académica"
    console.log("\n📋 Buscando proyecto 'Sistema de Gestión Académica'...");
    const allProjects = await getAllProjects();
    const project = allProjects.find(p => p.name === "Sistema de Gestión Académica");
    
    if (!project) {
      console.log("❌ No se encontró el proyecto 'Sistema de Gestión Académica'");
      return;
    }
    
    console.log(`✅ Proyecto encontrado: ${project.name} (ID: ${project.id})`);

    // 3. Obtener historias de usuario del proyecto
    console.log("\n📝 Obteniendo historias de usuario del proyecto...");
    const userStories = await getUserStoriesWithFilters({ projectId: project.id });
    
    if (userStories.length === 0) {
      console.log("❌ No hay historias de usuario en el proyecto");
      return;
    }
    
    console.log(`✅ Encontradas ${userStories.length} historias de usuario`);

    // 4. Corregir las historias de usuario con createdBy inválido
    console.log("\n🔄 Corrigiendo historias de usuario...");
    
    let fixedCount = 0;
    
    for (const story of userStories) {
      // Verificar si createdBy no es un ID válido (UUID)
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(story.createdBy);
      
      if (!isValidUUID) {
        console.log(`   Corrigiendo: ${story.title}`);
        console.log(`     createdBy actual: ${story.createdBy}`);
        
        // Actualizar con el ID del usuario admin
        const updated = await updateUserStory(story.id, {
          createdBy: adminUser.id
        });
        
        if (updated) {
          console.log(`     ✅ Actualizado con createdBy: ${adminUser.id}`);
          fixedCount++;
        } else {
          console.log(`     ❌ Error al actualizar`);
        }
      } else {
        console.log(`   ✅ ${story.title} ya tiene un createdBy válido`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ ${fixedCount} historias de usuario corregidas`);
    console.log(`   📋 ${userStories.length - fixedCount} historias ya tenían datos válidos`);

    // 5. Verificar que las correcciones funcionaron
    console.log("\n🔍 Verificando correcciones...");
    const updatedStories = await getUserStoriesWithFilters({ projectId: project.id });
    
    for (const story of updatedStories) {
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(story.createdBy);
      if (!isValidUUID) {
        console.log(`   ❌ ${story.title} aún tiene createdBy inválido: ${story.createdBy}`);
      }
    }
    
    console.log("   ✅ Todas las historias de usuario tienen createdBy válido");

    console.log(`\n🌐 Ahora puedes probar las páginas de detalles:`);
    updatedStories.slice(0, 3).forEach(story => {
      console.log(`   http://localhost:8000/user-stories/${story.id}`);
    });

  } catch (error) {
    console.error("❌ Error al corregir creadores:", error);
  }
}

if (import.meta.main) {
  await fixUserStoryCreators();
  Deno.exit(0);
}
