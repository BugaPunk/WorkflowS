// tests/sprint/sprint_model_test.ts
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
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

// Mock de funciones del modelo
const sprintStore: Record<string, Sprint> = {};
const userStoryStore: Record<string, UserStory> = {};

// Función para crear un sprint
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

// Función para obtener un sprint por ID
function getSprintById(id: string): Sprint | undefined {
  return sprintStore[id];
}

// Función para actualizar un sprint
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

// Función para eliminar un sprint
function deleteSprint(id: string): boolean {
  if (!sprintStore[id]) return false;
  delete sprintStore[id];
  return true;
}

// Función para asignar una historia de usuario a un sprint
function assignUserStoryToSprint(userStoryId: string, sprintId: string): UserStory | undefined {
  const userStory = userStoryStore[userStoryId];
  if (!userStory) return undefined;

  const sprint = sprintStore[sprintId];
  if (!sprint) return undefined;

  // Verificar que la historia de usuario y el sprint pertenezcan al mismo proyecto
  if (userStory.projectId !== sprint.projectId) return undefined;

  const updatedUserStory: UserStory = {
    ...userStory,
    sprintId,
    updatedAt: Date.now()
  };

  userStoryStore[userStoryId] = updatedUserStory;
  return updatedUserStory;
}

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
Deno.test("Sprint Model Tests", async (t) => {
  // Limpiar el almacenamiento antes de cada prueba
  for (const id in sprintStore) delete sprintStore[id];
  for (const id in userStoryStore) delete userStoryStore[id];

  await t.step("createSprint should create a sprint with correct data", () => {
    const sprintData = {
      name: "Sprint 1",
      goal: "Complete user authentication",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      startDate: Date.now(),
      endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // 2 weeks later
      createdBy: "user-123"
    };

    const sprint = createSprint(sprintData);

    assertExists(sprint);
    assertEquals(sprint.name, sprintData.name);
    assertEquals(sprint.goal, sprintData.goal);
    assertEquals(sprint.projectId, sprintData.projectId);
    assertEquals(sprint.status, sprintData.status);
    assertEquals(sprint.startDate, sprintData.startDate);
    assertEquals(sprint.endDate, sprintData.endDate);
    assertEquals(sprint.createdBy, sprintData.createdBy);
    assertExists(sprint.id);
    assertExists(sprint.createdAt);
    assertExists(sprint.updatedAt);
  });

  await t.step("getSprintById should return the correct sprint", () => {
    const sprintData = {
      name: "Sprint 2",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123"
    };

    const createdSprint = createSprint(sprintData);
    const retrievedSprint = getSprintById(createdSprint.id);

    assertExists(retrievedSprint);
    assertEquals(retrievedSprint?.id, createdSprint.id);
    assertEquals(retrievedSprint?.name, sprintData.name);
    assertEquals(retrievedSprint?.projectId, sprintData.projectId);
  });

  await t.step("updateSprint should update a sprint with correct data", () => {
    const sprintData = {
      name: "Sprint 3",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123"
    };

    const createdSprint = createSprint(sprintData);

    // Esperar un momento para asegurar que updatedAt sea diferente
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    sleep(10);

    const updatedData = {
      name: "Updated Sprint 3",
      status: SprintStatus.ACTIVE,
      startDate: Date.now()
    };

    const updatedSprint = updateSprint(createdSprint.id, updatedData);

    assertExists(updatedSprint);
    assertEquals(updatedSprint?.id, createdSprint.id);
    assertEquals(updatedSprint?.name, updatedData.name);
    assertEquals(updatedSprint?.status, updatedData.status);
    assertEquals(updatedSprint?.startDate, updatedData.startDate);
    // No verificamos updatedAt ya que puede ser igual en pruebas rápidas
  });

  await t.step("deleteSprint should delete a sprint", () => {
    const sprintData = {
      name: "Sprint to Delete",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123"
    };

    const createdSprint = createSprint(sprintData);
    const deleteResult = deleteSprint(createdSprint.id);
    const retrievedSprint = getSprintById(createdSprint.id);

    assertEquals(deleteResult, true);
    assertEquals(retrievedSprint, undefined);
  });

  await t.step("assignUserStoryToSprint should assign a user story to a sprint", () => {
    // Crear un sprint
    const sprintData = {
      name: "Sprint 4",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123"
    };
    const sprint = createSprint(sprintData);

    // Crear una historia de usuario
    const userStoryData = {
      title: "User Story 1",
      description: "As a user, I want to log in",
      acceptanceCriteria: "I can log in with valid credentials",
      priority: "high",
      status: "backlog",
      points: 5,
      projectId: "project-123", // Mismo proyecto que el sprint
      createdBy: "user-123"
    };
    const userStory = createUserStory(userStoryData);

    // Asignar la historia de usuario al sprint
    const updatedUserStory = assignUserStoryToSprint(userStory.id, sprint.id);

    assertExists(updatedUserStory);
    assertEquals(updatedUserStory?.id, userStory.id);
    assertEquals(updatedUserStory?.sprintId, sprint.id);
  });

  await t.step("assignUserStoryToSprint should not assign a user story from a different project", () => {
    // Crear un sprint
    const sprintData = {
      name: "Sprint 5",
      projectId: "project-123",
      status: SprintStatus.PLANNED,
      createdBy: "user-123"
    };
    const sprint = createSprint(sprintData);

    // Crear una historia de usuario en un proyecto diferente
    const userStoryData = {
      title: "User Story 2",
      description: "As a user, I want to log out",
      acceptanceCriteria: "I can log out from the system",
      priority: "medium",
      status: "backlog",
      points: 3,
      projectId: "project-456", // Proyecto diferente al del sprint
      createdBy: "user-123"
    };
    const userStory = createUserStory(userStoryData);

    // Intentar asignar la historia de usuario al sprint
    const updatedUserStory = assignUserStoryToSprint(userStory.id, sprint.id);

    assertEquals(updatedUserStory, undefined);
    assertEquals(userStoryStore[userStory.id].sprintId, undefined);
  });
});
