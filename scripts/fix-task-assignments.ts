#!/usr/bin/env -S deno run --unstable-kv -A

// Script para corregir asignaciones de tareas y mejorar métricas
import { getProjectMembers } from "../models/project.ts";
import { getUserById } from "../models/user.ts";
import { updateTask } from "../models/task.ts";

async function main() {
  try {
    const kv = await Deno.openKv();
    
    console.log("🔧 CORRIGIENDO ASIGNACIONES DE TAREAS");
    console.log("=".repeat(50));
    
    const projectId = "4c707aaa-1f3e-44a6-97eb-27eb52b5eac8";
    
    // Obtener miembros del proyecto
    const projectMembers = await getProjectMembers(projectId);
    const teamMembers = projectMembers.filter(m => m.role === "team_member");
    
    console.log(`👥 Miembros del equipo disponibles: ${teamMembers.length}`);
    
    // Obtener todas las tareas
    const tasks = [];
    for await (const entry of kv.list({ prefix: ["tasks"] })) {
      if (entry.key.length === 2) {
        tasks.push(entry.value);
      }
    }
    
    // 1. Corregir asignación inválida
    console.log("\n🔧 Corrigiendo asignación inválida...");
    const invalidTask = tasks.find(t => t.assignedTo === "14228f6e-b5b8-443d-80cc-1709557729eb");
    if (invalidTask) {
      // Asignar a Pedro Sánchez que ya tiene tareas de autenticación
      const pedroId = "7ce49763-7c6d-48a8-881e-6273892b093c";
      await updateTask(invalidTask.id, { assignedTo: pedroId });
      console.log(`✅ Tarea "${invalidTask.title}" reasignada a Pedro Sánchez`);
    }
    
    // 2. Asignar tareas sin asignar a miembros del equipo
    console.log("\n📋 Asignando tareas pendientes...");
    
    const unassignedTasks = tasks.filter(task => !task.assignedTo || task.assignedTo === "14228f6e-b5b8-443d-80cc-1709557729eb");
    
    // Estrategia de asignación inteligente
    const assignments = [
      // María González - Tareas de UI/UX
      { userId: "0cf26068-d790-4777-b9ad-bee3a24208c3", name: "María González", tasks: [
        "Crear wireframes del dashboard",
        "Implementar layout responsivo", 
        "Diseñar formulario de login",
        "Implementar navegación principal"
      ]},
      
      // Luis López (Scrum Master) - Tareas de gestión y validación
      { userId: "1c580dc2-f1f8-485a-80f5-46cdc605bedd", name: "Luis López", tasks: [
        "Implementar validación de credenciales",
        "Implementar validación de datos",
        "Agregar manejo de errores"
      ]},
      
      // Carlos García (Product Owner) - Tareas de funcionalidad de usuario
      { userId: "481db4fd-af03-4705-ac99-ce1f693cf750", name: "Carlos García", tasks: [
        "Crear vista de perfil",
        "Implementar edición de datos",
        "Agregar cambio de contraseña",
        "Implementar subida de foto"
      ]},
      
      // Distribuir el resto entre Pedro y Juan
      { userId: "7ce49763-7c6d-48a8-881e-6273892b093c", name: "Pedro Sánchez", tasks: [
        "Implementar redirección post-login",
        "Desarrollar widgets informativos"
      ]},
      
      { userId: "c6fb4fb9-3646-4791-b1da-c5cbff26bce5", name: "Juan Pérez", tasks: [
        "Configurar confirmación por email",
        "Diseñar formulario de registro"
      ]}
    ];
    
    let assignedCount = 0;
    
    for (const assignment of assignments) {
      console.log(`\n👤 Asignando tareas a ${assignment.name}:`);
      
      for (const taskTitle of assignment.tasks) {
        const task = unassignedTasks.find(t => 
          t.title.toLowerCase().includes(taskTitle.toLowerCase()) ||
          taskTitle.toLowerCase().includes(t.title.toLowerCase())
        );
        
        if (task && (!task.assignedTo || task.assignedTo === "14228f6e-b5b8-443d-80cc-1709557729eb")) {
          try {
            await updateTask(task.id, { assignedTo: assignment.userId });
            console.log(`  ✅ "${task.title}" asignada`);
            assignedCount++;
          } catch (error) {
            console.log(`  ❌ Error asignando "${task.title}":`, error.message);
          }
        }
      }
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ ${assignedCount} tareas asignadas correctamente`);
    
    // Verificar tareas restantes sin asignar
    const stillUnassigned = [];
    for await (const entry of kv.list({ prefix: ["tasks"] })) {
      if (entry.key.length === 2) {
        const task = entry.value;
        if (!task.assignedTo) {
          stillUnassigned.push(task);
        }
      }
    }
    
    if (stillUnassigned.length > 0) {
      console.log(`⚠️  ${stillUnassigned.length} tareas aún sin asignar:`);
      stillUnassigned.forEach(task => {
        console.log(`  - ${task.title}`);
      });
    } else {
      console.log(`🎉 ¡Todas las tareas han sido asignadas!`);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎯 CORRECCIÓN COMPLETADA");
    console.log("💡 Las métricas del proyecto ahora deberían mostrar el rendimiento real del equipo");
    
    kv.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
