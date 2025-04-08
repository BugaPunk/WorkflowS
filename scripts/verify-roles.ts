/// <reference lib="deno.unstable" />
import { getKv, COLLECTIONS } from "../utils/db.ts";
import { UserRole } from "../models/user.ts";
import { ProjectRole } from "../models/project.ts";

// Función para verificar los roles de usuario en la base de datos
async function verifyUserRoles() {
  console.log("Verificando roles de usuario en la base de datos...");
  
  const kv = getKv();
  const users: any[] = [];
  
  // Listar todos los usuarios
  const usersIterator = kv.list({ prefix: [...COLLECTIONS.USERS] });
  
  for await (const entry of usersIterator) {
    // Solo incluir entradas principales de usuarios (no índices ni sesiones)
    if (entry.key.length === 2 && entry.key[0] === COLLECTIONS.USERS[0]) {
      users.push(entry.value);
    }
  }
  
  console.log(`Total de usuarios encontrados: ${users.length}`);
  
  // Verificar roles de usuario
  const validUserRoles = Object.values(UserRole);
  const userRoleCount: Record<string, number> = {};
  const invalidUserRoles: { userId: string; username: string; role: string }[] = [];
  
  for (const user of users) {
    // Contar roles
    userRoleCount[user.role] = (userRoleCount[user.role] || 0) + 1;
    
    // Verificar si el rol es válido
    if (!validUserRoles.includes(user.role)) {
      invalidUserRoles.push({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    }
  }
  
  console.log("Distribución de roles de usuario:");
  for (const [role, count] of Object.entries(userRoleCount)) {
    console.log(`- ${role}: ${count} usuarios`);
  }
  
  if (invalidUserRoles.length > 0) {
    console.log("¡ALERTA! Se encontraron usuarios con roles inválidos:");
    for (const user of invalidUserRoles) {
      console.log(`- Usuario ${user.username} (${user.userId}) tiene rol inválido: ${user.role}`);
    }
  } else {
    console.log("Todos los usuarios tienen roles válidos.");
  }
}

// Función para verificar los roles de miembros de proyectos en la base de datos
async function verifyProjectMemberRoles() {
  console.log("\nVerificando roles de miembros de proyectos en la base de datos...");
  
  const kv = getKv();
  const members: any[] = [];
  
  // Listar todos los miembros de proyectos
  const membersIterator = kv.list({ prefix: ["project_members"] });
  
  for await (const entry of membersIterator) {
    // Solo incluir entradas principales de miembros (no índices)
    if (entry.key.length === 2 && entry.key[0] === "project_members") {
      members.push(entry.value);
    }
  }
  
  console.log(`Total de miembros de proyectos encontrados: ${members.length}`);
  
  // Verificar roles de miembros de proyectos
  const validProjectRoles = Object.values(ProjectRole);
  const projectRoleCount: Record<string, number> = {};
  const invalidProjectRoles: { memberId: string; userId: string; projectId: string; role: string }[] = [];
  
  for (const member of members) {
    // Contar roles
    projectRoleCount[member.role] = (projectRoleCount[member.role] || 0) + 1;
    
    // Verificar si el rol es válido
    if (!validProjectRoles.includes(member.role)) {
      invalidProjectRoles.push({
        memberId: member.id,
        userId: member.userId,
        projectId: member.projectId,
        role: member.role,
      });
    }
  }
  
  console.log("Distribución de roles de miembros de proyectos:");
  for (const [role, count] of Object.entries(projectRoleCount)) {
    console.log(`- ${role}: ${count} miembros`);
  }
  
  if (invalidProjectRoles.length > 0) {
    console.log("¡ALERTA! Se encontraron miembros de proyectos con roles inválidos:");
    for (const member of invalidProjectRoles) {
      console.log(`- Miembro ${member.memberId} (Usuario: ${member.userId}, Proyecto: ${member.projectId}) tiene rol inválido: ${member.role}`);
    }
  } else {
    console.log("Todos los miembros de proyectos tienen roles válidos.");
  }
}

// Función para verificar la consistencia entre roles de usuario y roles de proyecto
async function verifyRoleConsistency() {
  console.log("\nVerificando consistencia entre roles de usuario y roles de proyecto...");
  
  const kv = getKv();
  const users: Record<string, any> = {};
  const projectMembers: Record<string, any[]> = {};
  
  // Obtener todos los usuarios
  const usersIterator = kv.list({ prefix: [...COLLECTIONS.USERS] });
  for await (const entry of usersIterator) {
    if (entry.key.length === 2 && entry.key[0] === COLLECTIONS.USERS[0]) {
      users[entry.value.id] = entry.value;
    }
  }
  
  // Obtener todos los miembros de proyectos
  const membersIterator = kv.list({ prefix: ["project_members"] });
  for await (const entry of membersIterator) {
    if (entry.key.length === 2 && entry.key[0] === "project_members") {
      const member = entry.value;
      if (!projectMembers[member.userId]) {
        projectMembers[member.userId] = [];
      }
      projectMembers[member.userId].push(member);
    }
  }
  
  // Verificar consistencia
  const inconsistencies: { userId: string; username: string; userRole: string; projectRoles: string[] }[] = [];
  
  for (const userId in projectMembers) {
    const user = users[userId];
    if (!user) continue; // Usuario no encontrado
    
    const userRole = user.role;
    const memberRoles = projectMembers[userId].map(m => m.role);
    
    // Verificar si hay inconsistencias
    let hasInconsistency = false;
    
    // Si el usuario es Scrum Master, debería tener al menos un rol de Scrum Master en algún proyecto
    if (userRole === UserRole.SCRUM_MASTER && !memberRoles.includes(ProjectRole.SCRUM_MASTER)) {
      hasInconsistency = true;
    }
    
    // Si el usuario es Product Owner, debería tener al menos un rol de Product Owner en algún proyecto
    if (userRole === UserRole.PRODUCT_OWNER && !memberRoles.includes(ProjectRole.PRODUCT_OWNER)) {
      hasInconsistency = true;
    }
    
    // Si el usuario tiene rol de Scrum Master en algún proyecto, su rol de usuario debería ser Scrum Master
    if (memberRoles.includes(ProjectRole.SCRUM_MASTER) && userRole !== UserRole.SCRUM_MASTER && userRole !== UserRole.ADMIN) {
      hasInconsistency = true;
    }
    
    // Si el usuario tiene rol de Product Owner en algún proyecto, su rol de usuario debería ser Product Owner
    if (memberRoles.includes(ProjectRole.PRODUCT_OWNER) && userRole !== UserRole.PRODUCT_OWNER && userRole !== UserRole.ADMIN) {
      hasInconsistency = true;
    }
    
    if (hasInconsistency) {
      inconsistencies.push({
        userId,
        username: user.username,
        userRole,
        projectRoles: memberRoles,
      });
    }
  }
  
  if (inconsistencies.length > 0) {
    console.log("¡ALERTA! Se encontraron inconsistencias entre roles de usuario y roles de proyecto:");
    for (const inc of inconsistencies) {
      console.log(`- Usuario ${inc.username} (${inc.userId}) tiene rol ${inc.userRole} pero roles de proyecto: ${inc.projectRoles.join(", ")}`);
    }
  } else {
    console.log("No se encontraron inconsistencias entre roles de usuario y roles de proyecto.");
  }
}

// Ejecutar todas las verificaciones
async function main() {
  try {
    await verifyUserRoles();
    await verifyProjectMemberRoles();
    await verifyRoleConsistency();
    
    console.log("\nVerificación completada.");
  } catch (error) {
    console.error("Error durante la verificación:", error);
  }
}

// Ejecutar el script
main();
