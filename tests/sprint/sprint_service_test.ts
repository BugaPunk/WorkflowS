// tests/sprint/sprint_service_test.ts
import { assertEquals, assertExists, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
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

interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: string;
  status: string;
  points?: number;
  projectId: string;
  createdBy: string;
  sprintId?: string;
  createdAt: number;
  updatedAt: number;
}

// Mock de almacenamiento
const sprintStore: Record<string, Sprint> = {};
const userStoryStore: Record<string, UserStory> = {};
const projectStore: Record<string, { id: string; name: string }> = {
  "project-123": { id: "project-123", name: "Test Project" }
};

// Mock de funciones del modelo
function createSprint(data: Omit<Sprint, "id" | "createdAt" | "updatedAt">): Sprint {
  const now = Date.now();
  const id = `sprint-${now}-${Math.random().toString(36).substring(2, 9)}`;
  
  const sprint: Sprint = {
    id,
    name: data.name,
    goal: data.goal,
    projectId: data.projectId,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now
  };
  
  sprintStore[id] = sprint;
  return sprint;
}

function getSprintById(id: string): Sprint | undefined {
  return sprintStore[id];
}

function updateSprint(id: string, data: Partial<Omit<Sprint, "id" | "createdAt" | "updatedAt">>): Sprint | undefined {
  const sprint = sprintStore[id];
  if (!sprint) return undefined;
  
  const updatedSprint: Sprint = {
    ...sprint,
    ...data,
    updatedAt: Date.now()
  };
  
  sprintStore[id] = updatedSprint;
  return updatedSprint;
}

function getSprintsByProjectId(projectId: string): Sprint[] {
  return Object.values(sprintStore).filter(sprint => sprint.projectId === projectId);
}

function assignUserStoryToSprint(userStoryId: string, sprintId: string): UserStory | undefined {
  const userStory = userStoryStore[userStoryId];
  if (!userStory) return undefined;
  
  const sprint = sprintStore[sprintId];
  if (!sprint) return undefined;
  
  if (userStory.projectId !== sprint.projectId) return undefined;
  
  const updatedUserStory: UserStory = {
    ...userStory,
    sprintId,
    updatedAt: Date.now()
  };
  
  userStoryStore[userStoryId] = updatedUserStory;
  return updatedUserStory;
}

// Servicio de Sprint
const SprintService = {
  // Crear un sprint con validación
  async createSprint(data: {
    name: string;
    goal?: string;
    projectId: string;
    startDate?: number;
    endDate?: number;
    createdBy: string;
  }): Promise<Sprint> {
    // Validar datos
    if (!data.name || data.name.length < 3) {
      throw new Error("Sprint name must be at least 3 characters long");
    }
    
    if (!data.projectId) {
      throw new Error("Project ID is required");
    }
    
    if (!projectStore[data.projectId]) {
      throw new Error("Project not found");
    }
    
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error("Start date cannot be after end date");
    }
    
    // Crear el sprint
    return createSprint({
      name: data.name,
      goal: data.goal,
      projectId: data.projectId,
      status: SprintStatus.PLANNED,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: data.createdBy
    });
  },
  
  // Obtener sprints de un proyecto
  async getSprintsByProject(projectId: string): Promise<Sprint[]> {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    if (!projectStore[projectId]) {
      throw new Error("Project not found");
    }
    
    return getSprintsByProjectId(projectId);
  },
  
  // Actualizar el estado de un sprint
  async updateSprintStatus(sprintId: string, status: SprintStatus): Promise<Sprint> {
    if (!sprintId) {
      throw new Error("Sprint ID is required");
    }
    
    const sprint = getSprintById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }
    
    // Validar transiciones de estado
    if (sprint.status === SprintStatus.COMPLETED && status !== SprintStatus.COMPLETED) {
      throw new Error("Cannot change status of a completed sprint");
    }
    
    if (sprint.status === SprintStatus.CANCELLED && status !== SprintStatus.CANCELLED) {
      throw new Error("Cannot change status of a cancelled sprint");
    }
    
    // Si se activa el sprint, asegurarse de que tenga fecha de inicio
    if (status === SprintStatus.ACTIVE && !sprint.startDate) {
      const updatedSprint = updateSprint(sprintId, {
        status,
        startDate: Date.now()
      });
      
      if (!updatedSprint) {
        throw new Error("Failed to update sprint");
      }
      
      return updatedSprint;
    }
    
    // Si se completa el sprint, asegurarse de que tenga fecha de fin
    if (status === SprintStatus.COMPLETED && !sprint.endDate) {
      const updatedSprint = updateSprint(sprintId, {
        status,
        endDate: Date.now()
      });
      
      if (!updatedSprint) {
        throw new Error("Failed to update sprint");
      }
      
      return updatedSprint;
    }
    
    const updatedSprint = updateSprint(sprintId, { status });
    if (!updatedSprint) {
      throw new Error("Failed to update sprint");
    }
    
    return updatedSprint;
  },
  
  // Asignar historia de usuario a sprint
  async assignUserStoryToSprint(userStoryId: string, sprintId: string): Promise<UserStory> {
    if (!userStoryId) {
      throw new Error("User Story ID is required");
    }
    
    if (!sprintId) {
      throw new Error("Sprint ID is required");
    }
    
    const userStory = userStoryStore[userStoryId];
    if (!userStory) {
      throw new Error("User Story not found");
    }
    
    const sprint = getSprintById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }
    
    // Verificar que la historia de usuario y el sprint pertenezcan al mismo proyecto
    if (userStory.projectId !== sprint.projectId) {
      throw new Error("User Story and Sprint must belong to the same project");
    }
    
    const updatedUserStory = assignUserStoryToSprint(userStoryId, sprintId);
    if (!updatedUserStory) {
      throw new Error("Failed to assign User Story to Sprint");
    }
    
    return updatedUserStory;
  }
};

// Función para crear una historia de usuario (para pruebas)
function createUserStory(data: Omit<UserStory, "id" | "createdAt" | "updatedAt">): UserStory {
  const now = Date.now();
  const id = `us-${now}-${Math.random().toString(36).substring(2, 9)}`;
  
  const userStory: UserStory = {
    id,
    title: data.title,
    description: data.description,
    acceptanceCriteria: data.acceptanceCriteria,
    priority: data.priority,
    status: data.status,
    points: data.points,
    projectId: data.projectId,
    createdBy: data.createdBy,
    sprintId: data.sprintId,
    createdAt: now,
    updatedAt: now
  };
  
  userStoryStore[id] = userStory;
  return userStory;
}

// Pruebas
Deno.test("Sprint Service Tests", async (t) => {
  // Limpiar el almacenamiento antes de cada prueba
  for (const id in sprintStore) delete sprintStore[id];
  for (const id in userStoryStore) delete userStoryStore[id];
  
  await t.step("createSprint should create a sprint with validation", async () => {
    const sprintData = {
      name: "Sprint 1",
      goal: "Complete user authentication",
      projectId: "project-123",
      startDate: Date.now(),
      endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 2 weeks later
      createdBy: "user-123"
    };
    
    const sprint = await SprintService.createSprint(sprintData);
    
    assertExists(sprint);
    assertEquals(sprint.name, sprintData.name);
    assertEquals(sprint.goal, sprintData.goal);
    assertEquals(sprint.projectId, sprintData.projectId);
    assertEquals(sprint.status, SprintStatus.PLANNED);
    assertEquals(sprint.startDate, sprintData.startDate);
    assertEquals(sprint.endDate, sprintData.endDate);
    assertEquals(sprint.createdBy, sprintData.createdBy);
  });
  
  await t.step("createSprint should validate sprint name", async () => {
    const invalidSprintData = {
      name: "Sp", // Too short
      projectId: "project-123",
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => SprintService.createSprint(invalidSprintData),
      Error,
      "Sprint name must be at least 3 characters long"
    );
  });
  
  await t.step("createSprint should validate project existence", async () => {
    const invalidSprintData = {
      name: "Sprint 2",
      projectId: "non-existent-project",
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => SprintService.createSprint(invalidSprintData),
      Error,
      "Project not found"
    );
  });
  
  await t.step("createSprint should validate date consistency", async () => {
    const now = Date.now();
    const invalidSprintData = {
      name: "Sprint 3",
      projectId: "project-123",
      startDate: now + 1000, // Start date after end date
      endDate: now,
      createdBy: "user-123"
    };
    
    await assertThrows(
      () => SprintService.createSprint(invalidSprintData),
      Error,
      "Start date cannot be after end date"
    );
  });
  
  await t.step("getSprintsByProject should return sprints for a project", async () => {
    // Create some sprints for the project
    await SprintService.createSprint({
      name: "Sprint A",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    await SprintService.createSprint({
      name: "Sprint B",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    const sprints = await SprintService.getSprintsByProject("project-123");
    
    assertEquals(sprints.length, 2);
    assertEquals(sprints[0].projectId, "project-123");
    assertEquals(sprints[1].projectId, "project-123");
  });
  
  await t.step("updateSprintStatus should update sprint status", async () => {
    const sprint = await SprintService.createSprint({
      name: "Sprint C",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    const updatedSprint = await SprintService.updateSprintStatus(sprint.id, SprintStatus.ACTIVE);
    
    assertExists(updatedSprint);
    assertEquals(updatedSprint.id, sprint.id);
    assertEquals(updatedSprint.status, SprintStatus.ACTIVE);
    assertExists(updatedSprint.startDate); // Should set start date when activating
  });
  
  await t.step("updateSprintStatus should set end date when completing a sprint", async () => {
    const sprint = await SprintService.createSprint({
      name: "Sprint D",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    const updatedSprint = await SprintService.updateSprintStatus(sprint.id, SprintStatus.COMPLETED);
    
    assertExists(updatedSprint);
    assertEquals(updatedSprint.id, sprint.id);
    assertEquals(updatedSprint.status, SprintStatus.COMPLETED);
    assertExists(updatedSprint.endDate); // Should set end date when completing
  });
  
  await t.step("updateSprintStatus should not allow changing status of completed sprint", async () => {
    const sprint = await SprintService.createSprint({
      name: "Sprint E",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    await SprintService.updateSprintStatus(sprint.id, SprintStatus.COMPLETED);
    
    await assertThrows(
      () => SprintService.updateSprintStatus(sprint.id, SprintStatus.ACTIVE),
      Error,
      "Cannot change status of a completed sprint"
    );
  });
  
  await t.step("assignUserStoryToSprint should assign a user story to a sprint", async () => {
    // Create a sprint
    const sprint = await SprintService.createSprint({
      name: "Sprint F",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    // Create a user story
    const userStory = createUserStory({
      title: "User Story 1",
      description: "As a user, I want to log in",
      acceptanceCriteria: "I can log in with valid credentials",
      priority: "high",
      status: "backlog",
      projectId: "project-123", // Same project as the sprint
      createdBy: "user-123"
    });
    
    const updatedUserStory = await SprintService.assignUserStoryToSprint(userStory.id, sprint.id);
    
    assertExists(updatedUserStory);
    assertEquals(updatedUserStory.id, userStory.id);
    assertEquals(updatedUserStory.sprintId, sprint.id);
  });
  
  await t.step("assignUserStoryToSprint should validate project consistency", async () => {
    // Create a sprint
    const sprint = await SprintService.createSprint({
      name: "Sprint G",
      projectId: "project-123",
      createdBy: "user-123"
    });
    
    // Create a user story in a different project
    const userStory = createUserStory({
      title: "User Story 2",
      description: "As a user, I want to log out",
      acceptanceCriteria: "I can log out from the system",
      priority: "medium",
      status: "backlog",
      projectId: "project-456", // Different project from the sprint
      createdBy: "user-123"
    });
    
    await assertThrows(
      () => SprintService.assignUserStoryToSprint(userStory.id, sprint.id),
      Error,
      "User Story and Sprint must belong to the same project"
    );
  });
});
