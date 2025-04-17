// tests/task/task_api_test.ts
import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
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

// Mock de servicio de Tarea
const TaskService = {
  createTask: stub((data: any) => {
    const now = Date.now();
    return Promise.resolve({
      id: `task-${now}`,
      title: data.title,
      description: data.description,
      userStoryId: data.userStoryId,
      status: TaskStatus.TODO,
      estimatedHours: data.estimatedHours,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now
    });
  }),
  
  getTaskById: stub((id: string) => {
    if (id === "non-existent-task") {
      return Promise.resolve(undefined);
    }
    
    return Promise.resolve({
      id,
      title: "Test Task",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000
    });
  }),
  
  getTasksByUserStory: stub((userStoryId: string) => {
    return Promise.resolve([
      {
        id: "task-1",
        title: "Task 1",
        userStoryId,
        status: TaskStatus.DONE,
        createdBy: "user-123",
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 1000
      },
      {
        id: "task-2",
        title: "Task 2",
        userStoryId,
        status: TaskStatus.IN_PROGRESS,
        createdBy: "user-123",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 500
      }
    ]);
  }),
  
  getTasksByAssignee: stub((userId: string) => {
    return Promise.resolve([
      {
        id: "task-3",
        title: "Task 3",
        userStoryId: "us-123",
        status: TaskStatus.IN_PROGRESS,
        assignedTo: userId,
        createdBy: "user-123",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 500
      }
    ]);
  }),
  
  assignTask: stub((taskId: string, userId: string) => {
    return Promise.resolve({
      id: taskId,
      title: "Test Task",
      userStoryId: "us-123",
      status: TaskStatus.TODO,
      assignedTo: userId,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    });
  }),
  
  updateTaskStatus: stub((taskId: string, status: TaskStatus) => {
    return Promise.resolve({
      id: taskId,
      title: "Test Task",
      userStoryId: "us-123",
      status,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    });
  }),
  
  logTaskHours: stub((taskId: string, hours: number) => {
    return Promise.resolve({
      id: taskId,
      title: "Test Task",
      userStoryId: "us-123",
      status: TaskStatus.IN_PROGRESS,
      spentHours: hours,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    });
  })
};

// Mock de controladores de API
const TaskController = {
  // Crear una tarea
  async createTask(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      
      // Validar datos
      if (!data.title) {
        return new Response(JSON.stringify({ error: "Task title is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (!data.userStoryId) {
        return new Response(JSON.stringify({ error: "User Story ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Crear la tarea
      const task = await TaskService.createTask(data);
      
      return new Response(JSON.stringify({ task }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Obtener una tarea por ID
  async getTaskById(request: Request, params: { id: string }): Promise<Response> {
    try {
      const task = await TaskService.getTaskById(params.id);
      
      if (!task) {
        return new Response(JSON.stringify({ error: "Task not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ task }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Obtener tareas por historia de usuario
  async getTasksByUserStory(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userStoryId = url.searchParams.get("userStoryId");
      
      if (!userStoryId) {
        return new Response(JSON.stringify({ error: "User Story ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const tasks = await TaskService.getTasksByUserStory(userStoryId);
      
      return new Response(JSON.stringify({ tasks }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Obtener tareas por asignado
  async getTasksByAssignee(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const tasks = await TaskService.getTasksByAssignee(userId);
      
      return new Response(JSON.stringify({ tasks }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Asignar una tarea a un usuario
  async assignTask(request: Request, params: { id: string }): Promise<Response> {
    try {
      const data = await request.json();
      
      if (!data.userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const task = await TaskService.assignTask(params.id, data.userId);
      
      return new Response(JSON.stringify({ task }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Actualizar el estado de una tarea
  async updateTaskStatus(request: Request, params: { id: string }): Promise<Response> {
    try {
      const data = await request.json();
      
      if (!data.status) {
        return new Response(JSON.stringify({ error: "Status is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Validar el estado
      if (!Object.values(TaskStatus).includes(data.status)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const task = await TaskService.updateTaskStatus(params.id, data.status);
      
      return new Response(JSON.stringify({ task }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  
  // Registrar horas dedicadas a una tarea
  async logTaskHours(request: Request, params: { id: string }): Promise<Response> {
    try {
      const data = await request.json();
      
      if (data.hours === undefined) {
        return new Response(JSON.stringify({ error: "Hours are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (typeof data.hours !== "number" || data.hours <= 0) {
        return new Response(JSON.stringify({ error: "Hours must be a positive number" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const task = await TaskService.logTaskHours(params.id, data.hours);
      
      return new Response(JSON.stringify({ task }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};

// Función para crear una solicitud
function createRequest(method: string, url: string, body?: any): Request {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return new Request(url, options);
}

// Pruebas
Deno.test("Task API Tests", async (t) => {
  // Restablecer los stubs antes de cada prueba
  TaskService.createTask.reset();
  TaskService.getTaskById.reset();
  TaskService.getTasksByUserStory.reset();
  TaskService.getTasksByAssignee.reset();
  TaskService.assignTask.reset();
  TaskService.updateTaskStatus.reset();
  TaskService.logTaskHours.reset();
  
  await t.step("POST /api/tasks should create a task", async () => {
    const taskData = {
      title: "Implement login form",
      description: "Create a login form with email and password fields",
      userStoryId: "us-123",
      estimatedHours: 4,
      createdBy: "user-123"
    };
    
    const request = createRequest("POST", "https://example.com/api/tasks", taskData);
    const response = await TaskController.createTask(request);
    const data = await response.json();
    
    assertEquals(response.status, 201);
    assertExists(data.task);
    assertEquals(data.task.title, taskData.title);
    assertEquals(data.task.description, taskData.description);
    assertEquals(data.task.userStoryId, taskData.userStoryId);
    assertEquals(data.task.status, TaskStatus.TODO);
    assertEquals(data.task.estimatedHours, taskData.estimatedHours);
    assertEquals(TaskService.createTask.calls.length, 1);
  });
  
  await t.step("POST /api/tasks should validate required fields", async () => {
    // Missing title
    const invalidData1 = {
      userStoryId: "us-123",
      createdBy: "user-123"
    };
    
    const request1 = createRequest("POST", "https://example.com/api/tasks", invalidData1);
    const response1 = await TaskController.createTask(request1);
    const data1 = await response1.json();
    
    assertEquals(response1.status, 400);
    assertEquals(data1.error, "Task title is required");
    
    // Missing userStoryId
    const invalidData2 = {
      title: "Implement login form",
      createdBy: "user-123"
    };
    
    const request2 = createRequest("POST", "https://example.com/api/tasks", invalidData2);
    const response2 = await TaskController.createTask(request2);
    const data2 = await response2.json();
    
    assertEquals(response2.status, 400);
    assertEquals(data2.error, "User Story ID is required");
  });
  
  await t.step("GET /api/tasks/:id should return a task", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks/task-123");
    const response = await TaskController.getTaskById(request, { id: "task-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.task);
    assertEquals(data.task.id, "task-123");
    assertEquals(TaskService.getTaskById.calls.length, 1);
  });
  
  await t.step("GET /api/tasks/:id should return 404 for non-existent task", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks/non-existent-task");
    const response = await TaskController.getTaskById(request, { id: "non-existent-task" });
    const data = await response.json();
    
    assertEquals(response.status, 404);
    assertEquals(data.error, "Task not found");
  });
  
  await t.step("GET /api/tasks should return tasks for a user story", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks?userStoryId=us-123");
    const response = await TaskController.getTasksByUserStory(request);
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.tasks);
    assertEquals(data.tasks.length, 2);
    assertEquals(data.tasks[0].userStoryId, "us-123");
    assertEquals(data.tasks[1].userStoryId, "us-123");
    assertEquals(TaskService.getTasksByUserStory.calls.length, 1);
  });
  
  await t.step("GET /api/tasks should validate userStoryId parameter", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks");
    const response = await TaskController.getTasksByUserStory(request);
    const data = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(data.error, "User Story ID is required");
  });
  
  await t.step("GET /api/tasks/assigned should return tasks assigned to a user", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks/assigned?userId=user-456");
    const response = await TaskController.getTasksByAssignee(request);
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.tasks);
    assertEquals(data.tasks.length, 1);
    assertEquals(data.tasks[0].assignedTo, "user-456");
    assertEquals(TaskService.getTasksByAssignee.calls.length, 1);
  });
  
  await t.step("GET /api/tasks/assigned should validate userId parameter", async () => {
    const request = createRequest("GET", "https://example.com/api/tasks/assigned");
    const response = await TaskController.getTasksByAssignee(request);
    const data = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(data.error, "User ID is required");
  });
  
  await t.step("PATCH /api/tasks/:id/assign should assign a task to a user", async () => {
    const assignData = {
      userId: "user-456"
    };
    
    const request = createRequest("PATCH", "https://example.com/api/tasks/task-123/assign", assignData);
    const response = await TaskController.assignTask(request, { id: "task-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.task);
    assertEquals(data.task.id, "task-123");
    assertEquals(data.task.assignedTo, "user-456");
    assertEquals(TaskService.assignTask.calls.length, 1);
  });
  
  await t.step("PATCH /api/tasks/:id/assign should validate userId", async () => {
    const invalidData = {};
    
    const request = createRequest("PATCH", "https://example.com/api/tasks/task-123/assign", invalidData);
    const response = await TaskController.assignTask(request, { id: "task-123" });
    const data = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(data.error, "User ID is required");
  });
  
  await t.step("PATCH /api/tasks/:id/status should update task status", async () => {
    const statusData = {
      status: TaskStatus.IN_PROGRESS
    };
    
    const request = createRequest("PATCH", "https://example.com/api/tasks/task-123/status", statusData);
    const response = await TaskController.updateTaskStatus(request, { id: "task-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.task);
    assertEquals(data.task.id, "task-123");
    assertEquals(data.task.status, TaskStatus.IN_PROGRESS);
    assertEquals(TaskService.updateTaskStatus.calls.length, 1);
  });
  
  await t.step("PATCH /api/tasks/:id/status should validate status", async () => {
    // Missing status
    const invalidData1 = {};
    
    const request1 = createRequest("PATCH", "https://example.com/api/tasks/task-123/status", invalidData1);
    const response1 = await TaskController.updateTaskStatus(request1, { id: "task-123" });
    const data1 = await response1.json();
    
    assertEquals(response1.status, 400);
    assertEquals(data1.error, "Status is required");
    
    // Invalid status
    const invalidData2 = {
      status: "invalid_status"
    };
    
    const request2 = createRequest("PATCH", "https://example.com/api/tasks/task-123/status", invalidData2);
    const response2 = await TaskController.updateTaskStatus(request2, { id: "task-123" });
    const data2 = await response2.json();
    
    assertEquals(response2.status, 400);
    assertEquals(data2.error, "Invalid status");
  });
  
  await t.step("POST /api/tasks/:id/hours should log hours for a task", async () => {
    const hoursData = {
      hours: 3
    };
    
    const request = createRequest("POST", "https://example.com/api/tasks/task-123/hours", hoursData);
    const response = await TaskController.logTaskHours(request, { id: "task-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.task);
    assertEquals(data.task.id, "task-123");
    assertEquals(data.task.spentHours, 3);
    assertEquals(TaskService.logTaskHours.calls.length, 1);
  });
  
  await t.step("POST /api/tasks/:id/hours should validate hours", async () => {
    // Missing hours
    const invalidData1 = {};
    
    const request1 = createRequest("POST", "https://example.com/api/tasks/task-123/hours", invalidData1);
    const response1 = await TaskController.logTaskHours(request1, { id: "task-123" });
    const data1 = await response1.json();
    
    assertEquals(response1.status, 400);
    assertEquals(data1.error, "Hours are required");
    
    // Non-positive hours
    const invalidData2 = {
      hours: 0
    };
    
    const request2 = createRequest("POST", "https://example.com/api/tasks/task-123/hours", invalidData2);
    const response2 = await TaskController.logTaskHours(request2, { id: "task-123" });
    const data2 = await response2.json();
    
    assertEquals(response2.status, 400);
    assertEquals(data2.error, "Hours must be a positive number");
    
    // Negative hours
    const invalidData3 = {
      hours: -2
    };
    
    const request3 = createRequest("POST", "https://example.com/api/tasks/task-123/hours", invalidData3);
    const response3 = await TaskController.logTaskHours(request3, { id: "task-123" });
    const data3 = await response3.json();
    
    assertEquals(response3.status, 400);
    assertEquals(data3.error, "Hours must be a positive number");
  });
});
