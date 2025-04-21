// tests/task/task_model_test.ts
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
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

interface UserStory {
  id: string;
  title: string;
  projectId: string;
}

interface User {
  id: string;
  username: string;
  role: string;
}

// Mock de almacenamiento
const taskStore: Record<string, Task> = {};
const userStoryStore: Record<string, UserStory> = {
  "us-123": { id: "us-123", title: "User Story 1", projectId: "project-123" },
  "us-456": { id: "us-456", title: "User Story 2", projectId: "project-123" }
};
const userStore: Record<string, User> = {
  "user-123": { id: "user-123", username: "admin", role: "admin" },
  "user-456": { id: "user-456", username: "developer", role: "team_developer" }
};

// Función para crear una tarea
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

// Función para obtener una tarea por ID
function getTaskById(id: string): Task | undefined {
  return taskStore[id];
}

// Función para actualizar una tarea
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

// Función para eliminar una tarea
function deleteTask(id: string): boolean {
  if (!taskStore[id]) return false;
  delete taskStore[id];
  return true;
}

// Función para asignar una tarea a un usuario
function assignTaskToUser(taskId: string, userId: string): Task | undefined {
  const task = taskStore[taskId];
  if (!task) return undefined;
  
  const user = userStore[userId];
  if (!user) return undefined;
  
  const updatedTask: Task = {
    ...task,
    assignedTo: userId,
    updatedAt: Date.now()
  };
  
  taskStore[taskId] = updatedTask;
  return updatedTask;
}

// Función para actualizar el estado de una tarea
function updateTaskStatus(taskId: string, status: TaskStatus): Task | undefined {
  const task = taskStore[taskId];
  if (!task) return undefined;
  
  const updatedTask: Task = {
    ...task,
    status,
    updatedAt: Date.now()
  };
  
  taskStore[taskId] = updatedTask;
  return updatedTask;
}

// Función para registrar horas dedicadas a una tarea
function logTaskHours(taskId: string, hours: number): Task | undefined {
  const task = taskStore[taskId];
  if (!task) return undefined;
  
  if (hours < 0) return undefined;
  
  const currentSpentHours = task.spentHours || 0;
  
  const updatedTask: Task = {
    ...task,
    spentHours: currentSpentHours + hours,
    updatedAt: Date.now()
  };
  
  taskStore[taskId] = updatedTask;
  return updatedTask;
}

// Pruebas
Deno.test("Task Model Tests", async (t) => {
  // Limpiar el almacenamiento antes de cada prueba
  for (const id in taskStore) delete taskStore[id];
  
  await t.step("createTask should create a task with correct data", () => {
    const taskData = {
      title: "Implement login form",
      description: "Create a login form with email and password fields",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      estimatedHours: 4,
      createdBy: "user-123"
    };
    
    const task = createTask(taskData);
    
    assertExists(task);
    assertEquals(task.title, taskData.title);
    assertEquals(task.description, taskData.description);
    assertEquals(task.userStoryId, taskData.userStoryId);
    assertEquals(task.status, taskData.status);
    assertEquals(task.estimatedHours, taskData.estimatedHours);
    assertEquals(task.createdBy, taskData.createdBy);
    assertExists(task.id);
    assertExists(task.createdAt);
    assertExists(task.updatedAt);
  });
  
  await t.step("getTaskById should return the correct task", () => {
    const taskData = {
      title: "Implement registration form",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123"
    };
    
    const createdTask = createTask(taskData);
    const retrievedTask = getTaskById(createdTask.id);
    
    assertExists(retrievedTask);
    assertEquals(retrievedTask?.id, createdTask.id);
    assertEquals(retrievedTask?.title, taskData.title);
    assertEquals(retrievedTask?.userStoryId, taskData.userStoryId);
  });
  
  await t.step("updateTask should update a task with correct data", () => {
    const taskData = {
      title: "Implement logout button",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123"
    };
    
    const createdTask = createTask(taskData);
    const updatedData = {
      title: "Implement logout functionality",
      description: "Add logout button and handle session termination",
      status: TaskStatus.IN_PROGRESS
    };
    
    const updatedTask = updateTask(createdTask.id, updatedData);
    
    assertExists(updatedTask);
    assertEquals(updatedTask?.id, createdTask.id);
    assertEquals(updatedTask?.title, updatedData.title);
    assertEquals(updatedTask?.description, updatedData.description);
    assertEquals(updatedTask?.status, updatedData.status);
    assertNotEquals(updatedTask?.updatedAt, createdTask.updatedAt);
  });
  
  await t.step("deleteTask should delete a task", () => {
    const taskData = {
      title: "Task to Delete",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123"
    };
    
    const createdTask = createTask(taskData);
    const deleteResult = deleteTask(createdTask.id);
    const retrievedTask = getTaskById(createdTask.id);
    
    assertEquals(deleteResult, true);
    assertEquals(retrievedTask, undefined);
  });
  
  await t.step("assignTaskToUser should assign a task to a user", () => {
    const taskData = {
      title: "Implement password reset",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123"
    };
    
    const task = createTask(taskData);
    const updatedTask = assignTaskToUser(task.id, "user-456");
    
    assertExists(updatedTask);
    assertEquals(updatedTask?.id, task.id);
    assertEquals(updatedTask?.assignedTo, "user-456");
  });
  
  await t.step("updateTaskStatus should update the status of a task", () => {
    const taskData = {
      title: "Implement email verification",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123"
    };
    
    const task = createTask(taskData);
    const updatedTask = updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
    
    assertExists(updatedTask);
    assertEquals(updatedTask?.id, task.id);
    assertEquals(updatedTask?.status, TaskStatus.IN_PROGRESS);
  });
  
  await t.step("logTaskHours should add hours to a task", () => {
    const taskData = {
      title: "Implement social login",
      userStoryId: "us-123",
      status: TaskStatus.IN_PROGRESS,
      estimatedHours: 8,
      createdBy: "user-123"
    };
    
    const task = createTask(taskData);
    
    // Log 2 hours
    const updatedTask1 = logTaskHours(task.id, 2);
    assertExists(updatedTask1);
    assertEquals(updatedTask1?.spentHours, 2);
    
    // Log 3 more hours
    const updatedTask2 = logTaskHours(task.id, 3);
    assertExists(updatedTask2);
    assertEquals(updatedTask2?.spentHours, 5);
  });
  
  await t.step("logTaskHours should not accept negative hours", () => {
    const taskData = {
      title: "Implement account settings",
      userStoryId: "us-123",
      status: TaskStatus.IN_PROGRESS,
      spentHours: 4,
      createdBy: "user-123"
    };
    
    const task = createTask(taskData);
    const updatedTask = logTaskHours(task.id, -2);
    
    assertEquals(updatedTask, undefined);
    assertEquals(taskStore[task.id].spentHours, 4); // Should remain unchanged
  });
});
