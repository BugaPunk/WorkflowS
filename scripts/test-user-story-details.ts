#!/usr/bin/env -S deno run -A --unstable-kv

import { getAllProjects } from "../models/project.ts";
import { getUserStoriesWithFilters } from "../models/userStory.ts";
import { getUserById } from "../models/user.ts";

async function testUserStoryDetails() {
  console.log("🔍 Probando detalles de historia de usuario...\n");

  try {
    // 1. Buscar el proyecto "Sistema de Gestión Académica"
    console.log("📋 Buscando proyecto 'Sistema de Gestión Académica'...");
    const allProjects = await getAllProjects();
    const project = allProjects.find(p => p.name === "Sistema de Gestión Académica");
    
    if (!project) {
      console.log("❌ No se encontró el proyecto 'Sistema de Gestión Académica'");
      return;
    }
    
    console.log(`✅ Proyecto encontrado: ${project.name} (ID: ${project.id})`);

    // 2. Obtener historias de usuario del proyecto
    console.log("\n📝 Obteniendo historias de usuario del proyecto...");
    const userStories = await getUserStoriesWithFilters({ projectId: project.id });
    
    if (userStories.length === 0) {
      console.log("❌ No hay historias de usuario en el proyecto");
      return;
    }
    
    console.log(`✅ Encontradas ${userStories.length} historias de usuario`);

    // 3. Probar la primera historia de usuario
    const firstStory = userStories[0];
    console.log(`\n🔍 Probando historia de usuario: ${firstStory.title}`);
    console.log(`   ID: ${firstStory.id}`);
    console.log(`   Creado por: ${firstStory.createdBy} (tipo: ${typeof firstStory.createdBy})`);
    console.log(`   Asignado a: ${firstStory.assignedTo} (tipo: ${typeof firstStory.assignedTo})`);

    // 4. Probar obtener el creador
    if (firstStory.createdBy && typeof firstStory.createdBy === 'string') {
      console.log(`\n👤 Obteniendo información del creador...`);
      try {
        const creator = await getUserById(firstStory.createdBy);
        if (creator) {
          console.log(`   ✅ Creador encontrado: ${creator.username} (${creator.email})`);
        } else {
          console.log(`   ⚠️  Creador no encontrado para ID: ${firstStory.createdBy}`);
        }
      } catch (error) {
        console.log(`   ❌ Error al obtener creador: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️  createdBy no es un string válido: ${firstStory.createdBy}`);
    }

    // 5. Probar obtener el usuario asignado
    if (firstStory.assignedTo && typeof firstStory.assignedTo === 'string') {
      console.log(`\n👤 Obteniendo información del usuario asignado...`);
      try {
        const assignedUser = await getUserById(firstStory.assignedTo);
        if (assignedUser) {
          console.log(`   ✅ Usuario asignado encontrado: ${assignedUser.username} (${assignedUser.email})`);
        } else {
          console.log(`   ⚠️  Usuario asignado no encontrado para ID: ${firstStory.assignedTo}`);
        }
      } catch (error) {
        console.log(`   ❌ Error al obtener usuario asignado: ${error.message}`);
      }
    } else {
      console.log(`   ℹ️  No hay usuario asignado o no es un string válido`);
    }

    console.log(`\n🌐 URL para probar: http://localhost:8000/user-stories/${firstStory.id}`);

  } catch (error) {
    console.error("❌ Error al probar detalles de historia de usuario:", error);
  }
}

if (import.meta.main) {
  await testUserStoryDetails();
  Deno.exit(0);
}
