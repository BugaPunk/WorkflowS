import "$std/dotenv/load.ts";
import { createUser, getUserByEmail, createProject, getProjectsByUserId, createTask, getTasksByProjectId } from "./db/db.ts";

// Función principal de prueba
async function testDatabase() {
  console.log("Iniciando prueba de base de datos...");
  
  try {
    // 1. Crear un usuario de prueba
    console.log("Creando usuario de prueba...");
    const email = `test${Date.now()}@example.com`; // Email único para evitar conflictos
    const newUser = await createUser({
      name: "Usuario de Prueba",
      email: email,
    });
    
    console.log("Usuario creado:", newUser);
    
    // 2. Verificar que el usuario se haya guardado
    console.log("Verificando que el usuario se haya guardado...");
    const foundUser = await getUserByEmail(email);
    console.log("Usuario encontrado:", foundUser);
    
    if (foundUser.length === 0) {
      throw new Error("¡El usuario no se guardó correctamente!");
    }
    
    const userId = foundUser[0].id;
    
    // 3. Crear un proyecto para el usuario
    console.log("Creando proyecto de prueba...");
    const newProject = await createProject({
      name: "Proyecto de Prueba",
      description: "Este es un proyecto de prueba",
      userId: userId,
    });
    
    console.log("Proyecto creado:", newProject);
    
    // 4. Verificar que el proyecto se haya guardado
    console.log("Verificando que el proyecto se haya guardado...");
    const foundProjects = await getProjectsByUserId(userId);
    console.log("Proyectos encontrados:", foundProjects);
    
    if (foundProjects.length === 0) {
      throw new Error("¡El proyecto no se guardó correctamente!");
    }
    
    const projectId = foundProjects[0].id;
    
    // 5. Crear una tarea para el proyecto
    console.log("Creando tarea de prueba...");
    const newTask = await createTask({
      title: "Tarea de Prueba",
      description: "Esta es una tarea de prueba",
      status: "pendiente",
      projectId: projectId,
      assignedTo: userId,
      isComplete: false,
    });
    
    console.log("Tarea creada:", newTask);
    
    // 6. Verificar que la tarea se haya guardado
    console.log("Verificando que la tarea se haya guardado...");
    const foundTasks = await getTasksByProjectId(projectId);
    console.log("Tareas encontradas:", foundTasks);
    
    if (foundTasks.length === 0) {
      throw new Error("¡La tarea no se guardó correctamente!");
    }
    
    console.log("¡Prueba completada con éxito! La base de datos está funcionando correctamente.");
    
  } catch (error) {
    console.error("Error durante la prueba:", error);
  }
}

// Ejecutar la prueba
await testDatabase();
