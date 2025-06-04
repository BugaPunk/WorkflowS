#!/usr/bin/env -S deno run --unstable-kv -A

// Script para analizar las asignaciones de tareas y corregir problemas
import { getProjectMembers } from "../models/project.ts";
import { getUserById } from "../models/user.ts";

async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("🔍 ANÁLISIS DETALLADO DE ASIGNACIONES");
    console.log("=".repeat(50));
    
    const projectId = "4c707aaa-1f3e-44a6-97eb-27eb52b5eac8";
    
    // Obtener miembros del proyecto
    const projectMembers = await getProjectMembers(projectId);
    console.log(`👥 Miembros del proyecto: ${projectMembers.length}`);
    
    // Obtener todas las tareas
    const tasks = [];
    for await (const entry of kv.list({ prefix: ["tasks"] })) {
      if (entry.key.length === 2) {
        tasks.push(entry.value);
      }
    }
    
    console.log(`📋 Total tareas: ${tasks.length}`);
    
    // Analizar asignaciones por usuario
    console.log("\n👤 ANÁLISIS POR USUARIO:");
    
    for (const member of projectMembers) {
      const user = await getUserById(member.userId);
      if (!user) continue;
      
      const userTasks = tasks.filter(task => task.assignedTo === member.userId);
      const completedTasks = userTasks.filter(task => task.status === "done");
      const inProgressTasks = userTasks.filter(task => task.status === "in_progress" || task.status === "review");
      const todoTasks = userTasks.filter(task => task.status === "todo");
      const hoursWorked = userTasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);
      
      console.log(`\n${user.firstName} ${user.lastName} (${member.role}):`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Total tareas: ${userTasks.length}`);
      console.log(`  - Completadas: ${completedTasks.length}`);
      console.log(`  - En progreso: ${inProgressTasks.length}`);
      console.log(`  - Por hacer: ${todoTasks.length}`);
      console.log(`  - Horas trabajadas: ${hoursWorked}h`);
      
      if (userTasks.length > 0) {
        console.log(`  - Tareas asignadas:`);
        userTasks.forEach(task => {
          console.log(`    * ${task.title} (${task.status}) - ${task.spentHours || 0}h`);
        });
      }
    }
    
    // Analizar tareas sin asignar
    const unassignedTasks = tasks.filter(task => !task.assignedTo);
    console.log(`\n❌ TAREAS SIN ASIGNAR: ${unassignedTasks.length}`);
    
    if (unassignedTasks.length > 0) {
      console.log("Lista de tareas sin asignar:");
      unassignedTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} (${task.status})`);
      });
    }
    
    // Analizar tareas con assignedTo inválido
    const invalidAssignments = tasks.filter(task => {
      if (!task.assignedTo) return false;
      return !projectMembers.some(member => member.userId === task.assignedTo);
    });
    
    if (invalidAssignments.length > 0) {
      console.log(`\n⚠️  ASIGNACIONES INVÁLIDAS: ${invalidAssignments.length}`);
      invalidAssignments.forEach(task => {
        console.log(`  - ${task.title} asignada a: ${task.assignedTo} (usuario no encontrado en proyecto)`);
      });
    }
    
    // Sugerencias de mejora
    console.log("\n💡 SUGERENCIAS:");
    
    if (unassignedTasks.length > 0) {
      console.log(`1. Asignar ${unassignedTasks.length} tareas pendientes a miembros del equipo`);
    }
    
    const membersWithoutTasks = projectMembers.filter(member => {
      return !tasks.some(task => task.assignedTo === member.userId);
    });
    
    if (membersWithoutTasks.length > 0) {
      console.log(`2. ${membersWithoutTasks.length} miembros sin tareas asignadas:`);
      for (const member of membersWithoutTasks) {
        const user = await getUserById(member.userId);
        if (user) {
          console.log(`   - ${user.firstName} ${user.lastName} (${member.role})`);
        }
      }
    }
    
    if (invalidAssignments.length > 0) {
      console.log(`3. Corregir ${invalidAssignments.length} asignaciones inválidas`);
    }
    
    console.log("\n" + "=".repeat(50));
    
    kv.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
