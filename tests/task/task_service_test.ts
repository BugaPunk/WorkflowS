// tests/task/task_service_test.ts
import { assertEquals, assertExists, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { stub } from "https://deno.land/std/testing/mock.ts";

// Definir enumeración para estado de la tarea
enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  BLOCKED = "blocked",
}

// Definir interfaces para los modelos
interface Task {
  id: string;
  title: string;
  description?: string;
  userStoryId: string;
  status: TaskStatus;
  assignedTo?: string;
  estimatedHours?: number;
  spentHours?: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// Mock de almacenamiento
const taskStore: Record<string, Task> = {};
const userStoryStore: Record<string, { id: string; title: string; projectId: string }> = {
  "us-123": { id: "us-123", title: "User Story 1", projectId: "project-123" },
  "us-456": { id: "us-456", title: "User Story 2", projectId: "project-123" }
};
const userStore: Record<string, { id: string; username: string; role: string }> = {
  "user-123": { id: "user-123", username: "admin", role: "admin" },
  "user-456": { id: "user-456", username: "developer", role: "team_developer" }
};

// Mock de funciones del modelo
function createTask(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const now = Date.now();
  const id = `task-${now}-${Math.random().toString(36).substring(2, 9)}`;
  
  const task: Task = {
    id,
    title: data.title,
    description: data.description,
    userStoryId: data.userStoryId,
    status: data.status,
    assignedTo: data.assignedTo,
    estimatedHours: data.estimatedHours,
    spentHours: data.spentHours,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now
  };
  
  taskStore[id] = task;
  return task;
}

function getTaskById(id: string): Task | undefined {
  return taskStore[id];
}

function updateTask(id: string, data: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Task | undefined {
  const task = taskStore[id];
  if (!task) return undefined;
  
  const updatedTask: Task = {
    ...task,
    ...data,
    updatedAt: Date.now()
  };
  
  taskStore[id] = updatedTask;
  return updatedTask;
}

function getTasksByUserStoryId(userStoryId: string): Task[] {
  return Object.values(taskStore).filter(task => task.userStoryId === userStoryId);
}

function getTasksByAssignee(userId: string): Task[] {
  return Object.values(taskStore).filter(task => task.assignedTo === userId);
}

// Servicio de Tarea
const TaskService = {
  // Crear una tarea con validación
  async createTask(data: {
    title: string;
    description?: string;
    userStoryId: string;
    estimatedHours?: number;
    createdBy: string;
  }): Promise<Task> {
    // Validar datos
    if (!data.title || data.title.length < 3) {
      throw new Error("Task title must be at least 3 characters long");
    }
    
    if (!data.userStoryId) {
      throw new Error("User Story ID is required");
    }
    
    if (!userStoryStore[data.userStoryId]) {
      throw new Error("User Story not found");
    }
    
    if (data.estimatedHours !== undefined && data.estimatedHours < 0) {
      throw new Error("Estimated hours cannot be negative");
    }
    
    // Crear la tarea
    return createTask({
      title: data.title,
      description: data.description,
      userStoryId: data.userStoryId,
      status: TaskStatus.TODO,
      estimatedHours: data.estimatedHours,
      createdBy: data.createdBy
    });
  },
  
  // Obtener tareas de una historia de usuario
  async getTasksByUserStory(userStoryId: string): Promise<Task[]> {
    if (!userStoryId) {
      throw new Error("User Story ID is required");
    }
    
    if (!userStoryStore[userStoryId]) {
      throw new Error("User Story not found");
    }
    
    return getTasksByUserStoryId(userStoryId);
  },
  
  // Obtener tareas asignadas a un usuario
  async getTasksByAssignee(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    if (!userStore[userId]) {
      throw new Error("User not found");
    }
    
    return getTasksByAssignee(userId);
  },
  
  // Asignar una tarea a un usuario
  async assignTask(taskId: string, userId: string): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const task = getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (!userStore[userId]) {
      throw new Error("User not found");
    }
    
    const updatedTask = updateTask(taskId, { assignedTo: userId });
    if (!updatedTask) {
      throw new Error("Failed to assign task");
    }
    
    return updatedTask;
  },
  
  // Actualizar el estado de una tarea
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    
    const task = getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Validar transiciones de estado
    if (task.status === TaskStatus.DONE && status !== TaskStatus.DONE) {
      throw new Error("Cannot change status of a completed task");
    }
    
    const updatedTask = updateTask(taskId, { status });
    if (!updatedTask) {
      throw new Error("Failed to update task status");
    }
    
    return updatedTask;
  },
  
  // Registrar horas dedicadas a una tarea
  async logTaskHours(taskId: string, hours: number): Promise<Task> {
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    
    if (hours <= 0) {
      throw new Error("Hours must be positive");
    }
    
    const task = getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    const currentSpentHours = task.spentHours || 0;
    const updatedTask = updateTask(taskId, { spentHours: currentSpentHours + hours });
    
    if (!updatedTask) {
      throw new Error("Failed to log hours");
    }
    
    return updatedTask;
  }
};

// Pruebas
Deno.test("Task Service Tests", async (t) => {
  // Limpiar el almacenamiento antes de cada prueba
  for (const id in taskStore) delete taskStore[id];
  
  await t.step("createTask should create a task with validation", async () => {
    const taskData = {
      title: "Implement login form",
      description: "Create a login form with email and password fields",
      userStoryId: "us-123",
      estimatedHours: 4,
      createdBy: "user-123"
    };
    
    const task = await TaskService.createTask(taskData);
    
    assertExists(task);
    assertEquals(task.title, taskData.title);
    assertEquals(task.description, taskData.description);
    assertEquals(task.userStoryId, taskData.userStoryId);
    assertEquals(task.status, TaskStatus.TODO);
    assertEquals(task.estimatedHours, taskData.estimatedHours);
    assertEquals(task.createdBy, taskData.createdBy);
  });
  
  await t.step("createTask should validate task title", async () => {
    const invalidTaskData = {
      title: "Im", // Too short
      userStoryId: "us-123",
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => TaskService.createTask(invalidTaskData),
      Error,
      "Task title must be at least 3 characters long"
    );
  });
  
  await t.step("createTask should validate user story existence", async () => {
    const invalidTaskData = {
      title: "Implement registration form",
      userStoryId: "non-existent-us",
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => TaskService.createTask(invalidTaskData),
      Error,
      "User Story not found"
    );
  });
  
  await t.step("createTask should validate estimated hours", async () => {
    const invalidTaskData = {
      title: "Implement logout button",
      userStoryId: "us-123",
      estimatedHours: -2, // Negative hours
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => TaskService.createTask(invalidTaskData),
      Error,
      "Estimated hours cannot be negative"
    );
  });
  
  await t.step("getTasksByUserStory should return tasks for a user story", async () => {
    // Create some tasks for the user story
    await TaskService.createTask({
      title: "Task A for US1",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    await TaskService.createTask({
      title: "Task B for US1",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    await TaskService.createTask({
      title: "Task for US2",
      userStoryId: "us-456",
      createdBy: "user-123"
    });
    
    const tasks = await TaskService.getTasksByUserStory("us-123");
    
    assertEquals(tasks.length, 2);
    assertEquals(tasks[0].userStoryId, "us-123");
    assertEquals(tasks[1].userStoryId, "us-123");
  });
  
  await t.step("assignTask should assign a task to a user", async () => {
    const task = await TaskService.createTask({
      title: "Task to assign",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    const updatedTask = await TaskService.assignTask(task.id, "user-456");
    
    assertExists(updatedTask);
    assertEquals(updatedTask.id, task.id);
    assertEquals(updatedTask.assignedTo, "user-456");
  });
  
  await t.step("getTasksByAssignee should return tasks assigned to a user", async () => {
    // Create and assign some tasks
    const taskA = await TaskService.createTask({
      title: "Task A for developer",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    await TaskService.assignTask(taskA.id, "user-456");
    
    const taskB = await TaskService.createTask({
      title: "Task B for developer",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    await TaskService.assignTask(taskB.id, "user-456");
    
    const taskC = await TaskService.createTask({
      title: "Task for admin",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    await TaskService.assignTask(taskC.id, "user-123");
    
    const tasks = await TaskService.getTasksByAssignee("user-456");
    
    assertEquals(tasks.length, 2);
    assertEquals(tasks[0].assignedTo, "user-456");
    assertEquals(tasks[1].assignedTo, "user-456");
  });
  
  await t.step("updateTaskStatus should update task status", async () => {
    const task = await TaskService.createTask({
      title: "Task to update status",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    const updatedTask = await TaskService.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
    
    assertExists(updatedTask);
    assertEquals(updatedTask.id, task.id);
    assertEquals(updatedTask.status, TaskStatus.IN_PROGRESS);
  });
  
  await t.step("updateTaskStatus should not allow changing status of completed task", async () => {
    const task = await TaskService.createTask({
      title: "Completed task",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    await TaskService.updateTaskStatus(task.id, TaskStatus.DONE);
    
    await assertThrows(
      () => TaskService.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS),
      Error,
      "Cannot change status of a completed task"
    );
  });
  
  await t.step("logTaskHours should add hours to a task", async () => {
    const task = await TaskService.createTask({
      title: "Task for logging hours",
      userStoryId: "us-123",
      estimatedHours: 8,
      createdBy: "user-123"
    });
    
    // Log 3 hours
    const updatedTask1 = await TaskService.logTaskHours(task.id, 3);
    assertExists(updatedTask1);
    assertEquals(updatedTask1.spentHours, 3);
    
    // Log 2 more hours
    const updatedTask2 = await TaskService.logTaskHours(task.id, 2);
    assertExists(updatedTask2);
    assertEquals(updatedTask2.spentHours, 5);
  });
  
  await t.step("logTaskHours should validate hours", async () => {
    const task = await TaskService.createTask({
      title: "Another task for logging hours",
      userStoryId: "us-123",
      createdBy: "user-123"
    });
    
    await assertThrows(
      () => TaskService.logTaskHours(task.id, 0),
      Error,
      "Hours must be positive"
    );
    
    await assertThrows(
      () => TaskService.logTaskHours(task.id, -1),
      Error,
      "Hours must be positive"
    );
  });
});
