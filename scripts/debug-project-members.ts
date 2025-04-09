/// <reference lib="deno.unstable" />
import { getKv } from "../utils/db.ts";
import { PROJECT_COLLECTIONS } from "../models/project.ts";
import { getAllProjects, getUserProjects } from "../models/project.ts";
import { getAllUsers } from "../models/user.ts";

// Función principal
async function main() {
  console.log("=== DIAGNÓSTICO DE PROYECTOS Y MIEMBROS ===");
  
  const kv = getKv();
  
  // 1. Listar todos los proyectos
  console.log("\n=== PROYECTOS ===");
  const projects = await getAllProjects();
  console.log(`Total de proyectos: ${projects.length}`);
  
  for (const project of projects) {
    console.log(`\nProyecto: ${project.name} (ID: ${project.id})`);
    console.log(`Descripción: ${project.description || "Sin descripción"}`);
    console.log(`Estado: ${project.status}`);
    console.log(`Creado por: ${project.createdBy}`);
    console.log(`Miembros: ${project.members.length}`);
    
    // Mostrar detalles de los miembros
    if (project.members.length > 0) {
      console.log("\nDetalles de miembros:");
      for (const member of project.members) {
        console.log(`- Usuario ID: ${member.userId}, Rol: ${member.role}`);
      }
    }
  }
  
  // 2. Listar todos los usuarios
  console.log("\n\n=== USUARIOS ===");
  const users = await getAllUsers();
  console.log(`Total de usuarios: ${users.length}`);
  
  for (const user of users) {
    console.log(`\nUsuario: ${user.username} (ID: ${user.id})`);
    console.log(`Email: ${user.email}`);
    console.log(`Rol: ${user.role}`);
    
    // Obtener proyectos del usuario
    const userProjects = await getUserProjects(user.id);
    console.log(`Proyectos asignados: ${userProjects.length}`);
    
    if (userProjects.length > 0) {
      console.log("Proyectos:");
      for (const project of userProjects) {
        console.log(`- ${project.name} (ID: ${project.id})`);
      }
    }
  }
  
  // 3. Verificar índices de miembros de proyectos
  console.log("\n\n=== ÍNDICES DE MIEMBROS DE PROYECTOS ===");
  
  // Verificar índices by_user
  console.log("\nÍndices by_user:");
  const byUserIterator = kv.list({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user"]
  });
  
  let byUserCount = 0;
  for await (const entry of byUserIterator) {
    byUserCount++;
    console.log(`- Key: ${JSON.stringify(entry.key)}, Value: ${entry.value}`);
  }
  console.log(`Total de índices by_user: ${byUserCount}`);
  
  // Verificar índices by_project
  console.log("\nÍndices by_project:");
  const byProjectIterator = kv.list({
    prefix: [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project"]
  });
  
  let byProjectCount = 0;
  for await (const entry of byProjectIterator) {
    byProjectCount++;
    console.log(`- Key: ${JSON.stringify(entry.key)}, Value: ${entry.value}`);
  }
  console.log(`Total de índices by_project: ${byProjectCount}`);
  
  // Verificar entradas de miembros
  console.log("\nEntradas de miembros:");
  const membersIterator = kv.list({
    prefix: PROJECT_COLLECTIONS.PROJECT_MEMBERS
  });
  
  let membersCount = 0;
  for await (const entry of membersIterator) {
    // Solo contar entradas principales de miembros (no índices)
    if (entry.key.length === 2 && entry.key[0] === PROJECT_COLLECTIONS.PROJECT_MEMBERS[0]) {
      membersCount++;
      console.log(`- Key: ${JSON.stringify(entry.key)}, Value:`, entry.value);
    }
  }
  console.log(`Total de entradas de miembros: ${membersCount}`);
}

// Ejecutar la función principal
await main();
