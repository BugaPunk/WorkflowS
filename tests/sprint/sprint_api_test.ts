// tests/sprint/sprint_api_test.ts
import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { stub } from "https://deno.land/std/testing/mock.ts";

// Definir enumeración para estado del sprint
enum SprintStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

// Definir interfaces para los modelos
interface Sprint {
  id: string;
  name: string;
  goal?: string;
  projectId: string;
  status: SprintStatus;
  startDate?: number;
  endDate?: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// Mock de servicio de Sprint
const SprintService = {
  createSprint: stub((data: any) => {
    const now = Date.now();
    return Promise.resolve({
      id: `sprint-${now}`,
      name: data.name,
      goal: data.goal,
      projectId: data.projectId,
      status: SprintStatus.PLANNED,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now
    });
  }),
  
  getSprintById: stub((id: string) => {
    if (id === "non-existent-sprint") {
      return Promise.resolve(undefined);
    }
    
    return Promise.resolve({
      id,
      name: "Test Sprint",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000
    });
  }),
  
  getSprintsByProject: stub((projectId: string) => {
    return Promise.resolve([
      {
        id: "sprint-1",
        name: "Sprint 1",
        projectId,
        status: SprintStatus.COMPLETED,
        createdBy: "user-123",
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 1000
      },
      {
        id: "sprint-2",
        name: "Sprint 2",
        projectId,
        status: SprintStatus.ACTIVE,
        createdBy: "user-123",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 500
      }
    ]);
  }),
  
  updateSprintStatus: stub((id: string, status: SprintStatus) => {
    return Promise.resolve({
      id,
      name: "Test Sprint",
      projectId: "project-123",
      status,
      createdBy: "user-123",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    });
  }),
  
  assignUserStoryToSprint: stub((userStoryId: string, sprintId: string) => {
    return Promise.resolve({
      id: userStoryId,
      title: "Test User Story",
      description: "Test description",
      acceptanceCriteria: "Test criteria",
      priority: "high",
      status: "planned",
      projectId: "project-123",
      createdBy: "user-123",
      sprintId,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now()
    });
  })
};

// Mock de controladores de API
const SprintController = {
  // Crear un sprint
  async createSprint(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      
      // Validar datos
      if (!data.name) {
        return new Response(JSON.stringify({ error: "Sprint name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (!data.projectId) {
        return new Response(JSON.stringify({ error: "Project ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Crear el sprint
      const sprint = await SprintService.createSprint(data);
      
      return new Response(JSON.stringify({ sprint }), {
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
  
  // Obtener un sprint por ID
  async getSprintById(request: Request, params: { id: string }): Promise<Response> {
    try {
      const sprint = await SprintService.getSprintById(params.id);
      
      if (!sprint) {
        return new Response(JSON.stringify({ error: "Sprint not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ sprint }), {
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
  
  // Obtener sprints por proyecto
  async getSprintsByProject(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const projectId = url.searchParams.get("projectId");
      
      if (!projectId) {
        return new Response(JSON.stringify({ error: "Project ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const sprints = await SprintService.getSprintsByProject(projectId);
      
      return new Response(JSON.stringify({ sprints }), {
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
  
  // Actualizar el estado de un sprint
  async updateSprintStatus(request: Request, params: { id: string }): Promise<Response> {
    try {
      const data = await request.json();
      
      if (!data.status) {
        return new Response(JSON.stringify({ error: "Status is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Validar el estado
      if (!Object.values(SprintStatus).includes(data.status)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const sprint = await SprintService.updateSprintStatus(params.id, data.status);
      
      return new Response(JSON.stringify({ sprint }), {
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
  
  // Asignar una historia de usuario a un sprint
  async assignUserStoryToSprint(request: Request, params: { id: string }): Promise<Response> {
    try {
      const data = await request.json();
      
      if (!data.userStoryId) {
        return new Response(JSON.stringify({ error: "User Story ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      const userStory = await SprintService.assignUserStoryToSprint(data.userStoryId, params.id);
      
      return new Response(JSON.stringify({ userStory }), {
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
Deno.test("Sprint API Tests", async (t) => {
  // Restablecer los stubs antes de cada prueba
  SprintService.createSprint.reset();
  SprintService.getSprintById.reset();
  SprintService.getSprintsByProject.reset();
  SprintService.updateSprintStatus.reset();
  SprintService.assignUserStoryToSprint.reset();
  
  await t.step("POST /api/sprints should create a sprint", async () => {
    const sprintData = {
      name: "Sprint 1",
      goal: "Complete user authentication",
      projectId: "project-123",
      createdBy: "user-123"
    };
    
    const request = createRequest("POST", "https://example.com/api/sprints", sprintData);
    const response = await SprintController.createSprint(request);
    const data = await response.json();
    
    assertEquals(response.status, 201);
    assertExists(data.sprint);
    assertEquals(data.sprint.name, sprintData.name);
    assertEquals(data.sprint.goal, sprintData.goal);
    assertEquals(data.sprint.projectId, sprintData.projectId);
    assertEquals(data.sprint.status, SprintStatus.PLANNED);
    assertEquals(SprintService.createSprint.calls.length, 1);
  });
  
  await t.step("POST /api/sprints should validate required fields", async () => {
    // Missing name
    const invalidData1 = {
      projectId: "project-123",
      createdBy: "user-123"
    };
    
    const request1 = createRequest("POST", "https://example.com/api/sprints", invalidData1);
    const response1 = await SprintController.createSprint(request1);
    const data1 = await response1.json();
    
    assertEquals(response1.status, 400);
    assertEquals(data1.error, "Sprint name is required");
    
    // Missing projectId
    const invalidData2 = {
      name: "Sprint 1",
      createdBy: "user-123"
    };
    
    const request2 = createRequest("POST", "https://example.com/api/sprints", invalidData2);
    const response2 = await SprintController.createSprint(request2);
    const data2 = await response2.json();
    
    assertEquals(response2.status, 400);
    assertEquals(data2.error, "Project ID is required");
  });
  
  await t.step("GET /api/sprints/:id should return a sprint", async () => {
    const request = createRequest("GET", "https://example.com/api/sprints/sprint-123");
    const response = await SprintController.getSprintById(request, { id: "sprint-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.sprint);
    assertEquals(data.sprint.id, "sprint-123");
    assertEquals(SprintService.getSprintById.calls.length, 1);
  });
  
  await t.step("GET /api/sprints/:id should return 404 for non-existent sprint", async () => {
    const request = createRequest("GET", "https://example.com/api/sprints/non-existent-sprint");
    const response = await SprintController.getSprintById(request, { id: "non-existent-sprint" });
    const data = await response.json();
    
    assertEquals(response.status, 404);
    assertEquals(data.error, "Sprint not found");
  });
  
  await t.step("GET /api/sprints should return sprints for a project", async () => {
    const request = createRequest("GET", "https://example.com/api/sprints?projectId=project-123");
    const response = await SprintController.getSprintsByProject(request);
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.sprints);
    assertEquals(data.sprints.length, 2);
    assertEquals(data.sprints[0].projectId, "project-123");
    assertEquals(data.sprints[1].projectId, "project-123");
    assertEquals(SprintService.getSprintsByProject.calls.length, 1);
  });
  
  await t.step("GET /api/sprints should validate projectId parameter", async () => {
    const request = createRequest("GET", "https://example.com/api/sprints");
    const response = await SprintController.getSprintsByProject(request);
    const data = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(data.error, "Project ID is required");
  });
  
  await t.step("PATCH /api/sprints/:id/status should update sprint status", async () => {
    const statusData = {
      status: SprintStatus.ACTIVE
    };
    
    const request = createRequest("PATCH", "https://example.com/api/sprints/sprint-123/status", statusData);
    const response = await SprintController.updateSprintStatus(request, { id: "sprint-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.sprint);
    assertEquals(data.sprint.id, "sprint-123");
    assertEquals(data.sprint.status, SprintStatus.ACTIVE);
    assertEquals(SprintService.updateSprintStatus.calls.length, 1);
  });
  
  await t.step("PATCH /api/sprints/:id/status should validate status", async () => {
    // Missing status
    const invalidData1 = {};
    
    const request1 = createRequest("PATCH", "https://example.com/api/sprints/sprint-123/status", invalidData1);
    const response1 = await SprintController.updateSprintStatus(request1, { id: "sprint-123" });
    const data1 = await response1.json();
    
    assertEquals(response1.status, 400);
    assertEquals(data1.error, "Status is required");
    
    // Invalid status
    const invalidData2 = {
      status: "invalid_status"
    };
    
    const request2 = createRequest("PATCH", "https://example.com/api/sprints/sprint-123/status", invalidData2);
    const response2 = await SprintController.updateSprintStatus(request2, { id: "sprint-123" });
    const data2 = await response2.json();
    
    assertEquals(response2.status, 400);
    assertEquals(data2.error, "Invalid status");
  });
  
  await t.step("POST /api/sprints/:id/user-stories should assign a user story to a sprint", async () => {
    const assignData = {
      userStoryId: "us-123"
    };
    
    const request = createRequest("POST", "https://example.com/api/sprints/sprint-123/user-stories", assignData);
    const response = await SprintController.assignUserStoryToSprint(request, { id: "sprint-123" });
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.userStory);
    assertEquals(data.userStory.id, "us-123");
    assertEquals(data.userStory.sprintId, "sprint-123");
    assertEquals(SprintService.assignUserStoryToSprint.calls.length, 1);
  });
  
  await t.step("POST /api/sprints/:id/user-stories should validate userStoryId", async () => {
    const invalidData = {};
    
    const request = createRequest("POST", "https://example.com/api/sprints/sprint-123/user-stories", invalidData);
    const response = await SprintController.assignUserStoryToSprint(request, { id: "sprint-123" });
    const data = await response.json();
    
    assertEquals(response.status, 400);
    assertEquals(data.error, "User Story ID is required");
  });
});
