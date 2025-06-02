#!/usr/bin/env -S deno run --unstable-kv -A

/**
 * Script simplificado para poblar la base de datos Deno KV con datos de ejemplo
 * Ejecutar con: deno run --unstable-kv -A scripts/populate-sample-data-simple.ts
 */

import { createUser, UserRole } from "../models/user.ts";
import { createProject, addProjectMember, ProjectStatus, ProjectRole } from "../models/project.ts";
import { createUserStory, UserStoryPriority } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { createSprint, SprintStatus } from "../models/sprint.ts";

console.log("🚀 Iniciando población de datos de ejemplo...");

async function populateBasicData() {
  try {
    // 1. Crear usuarios básicos
    console.log("👥 Creando usuarios...");

    const users = [];

    // Admin (ya existe, pero intentamos crear otros)
    try {
      const prof = await createUser({
        username: "prof.martinez",
        email: "martinez@universidad.edu",
        password: "prof123",
        firstName: "María",
        lastName: "Martínez",
        role: UserRole.ADMIN,
      });
      users.push(prof);
      console.log("✅ Profesor creado: prof.martinez");
    } catch {
      console.log("⚠️ Profesor ya existe");
    }

    // Product Owner
    try {
      const po = await createUser({
        username: "po.garcia",
        email: "garcia@universidad.edu",
        password: "po123",
        firstName: "Carlos",
        lastName: "García",
        role: UserRole.PRODUCT_OWNER,
      });
      users.push(po);
      console.log("✅ Product Owner creado: po.garcia");
    } catch {
      console.log("⚠️ Product Owner ya existe");
    }

    // Scrum Master
    try {
      const sm = await createUser({
        username: "sm.lopez",
        email: "lopez@universidad.edu",
        password: "sm123",
        firstName: "Luis",
        lastName: "López",
        role: UserRole.SCRUM_MASTER,
      });
      users.push(sm);
      console.log("✅ Scrum Master creado: sm.lopez");
    } catch {
      console.log("⚠️ Scrum Master ya existe");
    }

    // Estudiantes
    const studentData = [
      {
        username: "dev.perez",
        email: "perez@estudiante.edu",
        firstName: "Juan",
        lastName: "Pérez",
      },
      {
        username: "dev.gonzalez",
        email: "gonzalez@estudiante.edu",
        firstName: "María",
        lastName: "González",
      },
      {
        username: "dev.sanchez",
        email: "sanchez@estudiante.edu",
        firstName: "Pedro",
        lastName: "Sánchez",
      },
      {
        username: "dev.torres",
        email: "torres@estudiante.edu",
        firstName: "Laura",
        lastName: "Torres",
      },
      {
        username: "dev.morales",
        email: "morales@estudiante.edu",
        firstName: "Diego",
        lastName: "Morales",
      },
      {
        username: "dev.castro",
        email: "castro@estudiante.edu",
        firstName: "Sofia",
        lastName: "Castro",
      },
    ];

    for (const student of studentData) {
      try {
        const user = await createUser({
          username: student.username,
          email: student.email,
          password: "dev123",
          firstName: student.firstName,
          lastName: student.lastName,
          role: UserRole.TEAM_DEVELOPER,
        });
        users.push(user);
        console.log(`✅ Estudiante creado: ${student.username}`);
      } catch {
        console.log(`⚠️ Estudiante ya existe: ${student.username}`);
      }
    }

    // 2. Crear proyectos
    console.log("\n📁 Creando proyectos...");

    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const twoMonthsFromNow = now + 60 * 24 * 60 * 60 * 1000;

    try {
      const project1 = await createProject({
        name: "Sistema de Gestión Académica",
        description:
          "Desarrollo de un sistema web para gestionar estudiantes, cursos y calificaciones de la universidad.",
        status: ProjectStatus.IN_PROGRESS,
        startDate: oneMonthAgo,
        endDate: twoMonthsFromNow,
        createdBy: "admin", // ID del admin por defecto
      });
      console.log("✅ Proyecto creado: Sistema de Gestión Académica");

      // Asignar usuarios al proyecto (si existen)
      if (users.length > 0) {
        const po = users.find((u) => u.role === UserRole.PRODUCT_OWNER);
        const sm = users.find((u) => u.role === UserRole.SCRUM_MASTER);
        const devs = users.filter((u) => u.role === UserRole.TEAM_DEVELOPER).slice(0, 3);

        if (po) {
          await addProjectMember({
            userId: po.id,
            projectId: project1.id,
            role: ProjectRole.PRODUCT_OWNER,
          });
        }
        if (sm) {
          await addProjectMember({
            userId: sm.id,
            projectId: project1.id,
            role: ProjectRole.SCRUM_MASTER,
          });
        }
        for (const dev of devs) {
          await addProjectMember({
            userId: dev.id,
            projectId: project1.id,
            role: ProjectRole.TEAM_MEMBER,
          });
        }
        console.log("✅ Usuarios asignados al proyecto");
      }

      // 3. Crear historias de usuario
      console.log("\n📝 Creando historias de usuario...");

      const stories = [
        {
          title: "Registro de usuarios",
          description:
            "Como usuario nuevo, quiero poder registrarme en el sistema para acceder a las funcionalidades.",
          acceptanceCriteria:
            "- El usuario puede crear una cuenta con email y contraseña\n- Se valida que el email sea único\n- Se envía confirmación por email",
          priority: UserStoryPriority.HIGH,
          points: 8,
        },
        {
          title: "Autenticación de usuarios",
          description:
            "Como usuario registrado, quiero poder iniciar sesión para acceder a mi cuenta.",
          acceptanceCriteria:
            "- El usuario puede iniciar sesión con email/contraseña\n- Se mantiene la sesión activa\n- Opción de cerrar sesión",
          priority: UserStoryPriority.HIGH,
          points: 5,
        },
        {
          title: "Dashboard principal",
          description:
            "Como usuario autenticado, quiero ver un dashboard con información relevante.",
          acceptanceCriteria:
            "- Muestra resumen de actividades\n- Enlaces rápidos a funciones principales\n- Información personalizada por rol",
          priority: UserStoryPriority.MEDIUM,
          points: 13,
        },
      ];

      const createdStories = [];
      for (const storyData of stories) {
        const story = await createUserStory(
          {
            ...storyData,
            projectId: project1.id,
          },
          "admin"
        );
        createdStories.push(story);
        console.log(`✅ Historia creada: ${story.title}`);
      }

      // 4. Crear sprint
      console.log("\n🏃 Creando sprint...");

      await createSprint({
        name: "Sprint 1 - Fundamentos",
        goal: "Implementar funcionalidades básicas de autenticación y registro",
        projectId: project1.id,
        status: SprintStatus.ACTIVE,
        startDate: oneMonthAgo,
        endDate: now + 14 * 24 * 60 * 60 * 1000,
        createdBy: "admin",
      });
      console.log("✅ Sprint creado: Sprint 1");

      // 5. Crear tareas básicas
      console.log("\n✅ Creando tareas...");

      if (createdStories.length > 0 && users.length > 0) {
        const devs = users.filter((u) => u.role === UserRole.TEAM_DEVELOPER);

        for (const story of createdStories) {
          const tasks = [
            {
              title: `Diseño - ${story.title}`,
              description: `Crear diseño para ${story.title}`,
              status: TaskStatus.DONE,
              estimatedHours: 4,
              spentHours: 3,
            },
            {
              title: `Implementación - ${story.title}`,
              description: `Desarrollar ${story.title}`,
              status: TaskStatus.IN_PROGRESS,
              estimatedHours: 8,
              spentHours: 5,
            },
          ];

          for (const taskData of tasks) {
            const assignedDev = devs[Math.floor(Math.random() * devs.length)];
            await createTask({
              ...taskData,
              userStoryId: story.id,
              assignedTo: assignedDev?.id || "admin",
              createdBy: "admin",
              isDeliverable: false,
            });
          }
        }
        console.log("✅ Tareas creadas");
      }
    } catch (error) {
      console.log(
        "⚠️ Error creando proyecto:",
        error instanceof Error ? error.message : String(error)
      );
    }

    console.log("\n🎉 ¡Datos de ejemplo creados exitosamente!");
    console.log("\n📋 Credenciales de acceso:");
    console.log("Admin: admin@admin.com / admin123");
    console.log("Profesor: martinez@universidad.edu / prof123");
    console.log("Product Owner: garcia@universidad.edu / po123");
    console.log("Scrum Master: lopez@universidad.edu / sm123");
    console.log("Estudiante: perez@estudiante.edu / dev123");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

if (import.meta.main) {
  await populateBasicData();
}
