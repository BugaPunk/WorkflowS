// tests/validation/backlog_consistency_test.ts
import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Definir enumeraciones para historias de usuario
enum UserStoryPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

enum UserStoryStatus {
  BACKLOG = "backlog",
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  DONE = "done",
}

// Definir enumeración para estado del sprint
enum SprintStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

// Definir el esquema de la historia de usuario
const UserStorySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  acceptanceCriteria: z.string().min(5),
  priority: z.nativeEnum(UserStoryPriority).default(UserStoryPriority.MEDIUM),
  status: z.nativeEnum(UserStoryStatus).default(UserStoryStatus.BACKLOG),
  points: z.number().min(1).max(13).optional(),
  projectId: z.string().min(1),
  createdBy: z.string().min(1),
  sprintId: z.string().optional(),
});

// Definir el esquema del sprint
const SprintSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(100),
  goal: z.string().optional(),
  projectId: z.string().min(1),
  status: z.nativeEnum(SprintStatus).default(SprintStatus.PLANNED),
  startDate: z.number().optional(), // timestamp
  endDate: z.number().optional(), // timestamp
  createdBy: z.string().min(1), // userId del creador
});

// Tipo para representar un backlog
type Backlog = {
  userStories: z.infer<typeof UserStorySchema>[];
  sprints: z.infer<typeof SprintSchema>[];
};

// Función para verificar la consistencia del backlog
function verifyBacklogConsistency(backlog: Backlog) {
  const errors: string[] = [];
  
  // Verificar que las historias de usuario asignadas a sprints tengan el estado correcto
  backlog.userStories.forEach(userStory => {
    if (userStory.sprintId) {
      // Buscar el sprint al que está asignada la historia
      const sprint = backlog.sprints.find(s => s.id === userStory.sprintId);
      
      // Verificar que el sprint exista
      if (!sprint) {
        errors.push(`La historia de usuario "${userStory.title}" está asignada a un sprint que no existe (ID: ${userStory.sprintId}).`);
        return;
      }
      
      // Verificar que el estado de la historia sea coherente con el estado del sprint
      if (sprint.status === SprintStatus.ACTIVE && userStory.status === UserStoryStatus.BACKLOG) {
        errors.push(`La historia de usuario "${userStory.title}" está en estado BACKLOG pero está asignada a un sprint ACTIVE.`);
      }
      
      if (sprint.status === SprintStatus.COMPLETED && 
          ![UserStoryStatus.DONE, UserStoryStatus.TESTING].includes(userStory.status)) {
        errors.push(`La historia de usuario "${userStory.title}" no está completada pero está asignada a un sprint COMPLETED.`);
      }
      
      // Verificar que la historia pertenezca al mismo proyecto que el sprint
      if (userStory.projectId !== sprint.projectId) {
        errors.push(`La historia de usuario "${userStory.title}" pertenece a un proyecto diferente al del sprint "${sprint.name}".`);
      }
    }
  });
  
  // Verificar que no haya historias duplicadas en el backlog
  const userStoryTitles = backlog.userStories.map(us => us.title);
  const uniqueTitles = new Set(userStoryTitles);
  if (userStoryTitles.length !== uniqueTitles.size) {
    errors.push("Hay historias de usuario con títulos duplicados en el backlog.");
  }
  
  // Verificar que no haya sprints con fechas inválidas
  backlog.sprints.forEach(sprint => {
    if (sprint.startDate && sprint.endDate && sprint.startDate > sprint.endDate) {
      errors.push(`El sprint "${sprint.name}" tiene una fecha de inicio posterior a la fecha de fin.`);
    }
  });
  
  return {
    isConsistent: errors.length === 0,
    errors
  };
}

Deno.test("Backlog Consistency", async (t) => {
  await t.step("should detect user stories assigned to non-existent sprints", async () => {
    const backlog: Backlog = {
      userStories: [
        {
          id: "us1",
          title: "User Story 1",
          description: "This is a valid description for a user story",
          acceptanceCriteria: "The feature should work correctly",
          priority: UserStoryPriority.HIGH,
          status: UserStoryStatus.PLANNED,
          projectId: "project123",
          createdBy: "user123",
          sprintId: "non-existent-sprint"
        }
      ],
      sprints: [
        {
          id: "sprint1",
          name: "Sprint 1",
          projectId: "project123",
          status: SprintStatus.PLANNED,
          createdBy: "user123"
        }
      ]
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect inconsistent user story status with sprint status", async () => {
    const backlog: Backlog = {
      userStories: [
        {
          id: "us1",
          title: "User Story 1",
          description: "This is a valid description for a user story",
          acceptanceCriteria: "The feature should work correctly",
          priority: UserStoryPriority.HIGH,
          status: UserStoryStatus.BACKLOG, // Inconsistent with ACTIVE sprint
          projectId: "project123",
          createdBy: "user123",
          sprintId: "sprint1"
        }
      ],
      sprints: [
        {
          id: "sprint1",
          name: "Sprint 1",
          projectId: "project123",
          status: SprintStatus.ACTIVE, // Active sprint
          createdBy: "user123"
        }
      ]
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect user stories from different projects", async () => {
    const backlog: Backlog = {
      userStories: [
        {
          id: "us1",
          title: "User Story 1",
          description: "This is a valid description for a user story",
          acceptanceCriteria: "The feature should work correctly",
          priority: UserStoryPriority.HIGH,
          status: UserStoryStatus.PLANNED,
          projectId: "project456", // Different project
          createdBy: "user123",
          sprintId: "sprint1"
        }
      ],
      sprints: [
        {
          id: "sprint1",
          name: "Sprint 1",
          projectId: "project123", // Different project
          status: SprintStatus.PLANNED,
          createdBy: "user123"
        }
      ]
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect duplicate user story titles", async () => {
    const backlog: Backlog = {
      userStories: [
        {
          id: "us1",
          title: "Duplicate Title", // Duplicate title
          description: "This is a valid description for a user story",
          acceptanceCriteria: "The feature should work correctly",
          priority: UserStoryPriority.HIGH,
          status: UserStoryStatus.BACKLOG,
          projectId: "project123",
          createdBy: "user123"
        },
        {
          id: "us2",
          title: "Duplicate Title", // Duplicate title
          description: "This is another valid description",
          acceptanceCriteria: "The feature should also work correctly",
          priority: UserStoryPriority.MEDIUM,
          status: UserStoryStatus.BACKLOG,
          projectId: "project123",
          createdBy: "user123"
        }
      ],
      sprints: []
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect sprints with invalid dates", async () => {
    const now = Date.now();
    const backlog: Backlog = {
      userStories: [],
      sprints: [
        {
          id: "sprint1",
          name: "Sprint 1",
          projectId: "project123",
          status: SprintStatus.PLANNED,
          startDate: now + 1000, // Start date after end date
          endDate: now,
          createdBy: "user123"
        }
      ]
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should accept a consistent backlog", async () => {
    const now = Date.now();
    const backlog: Backlog = {
      userStories: [
        {
          id: "us1",
          title: "User Story 1",
          description: "This is a valid description for a user story",
          acceptanceCriteria: "The feature should work correctly",
          priority: UserStoryPriority.HIGH,
          status: UserStoryStatus.PLANNED,
          projectId: "project123",
          createdBy: "user123",
          sprintId: "sprint1"
        },
        {
          id: "us2",
          title: "User Story 2",
          description: "This is another valid description",
          acceptanceCriteria: "The feature should also work correctly",
          priority: UserStoryPriority.MEDIUM,
          status: UserStoryStatus.BACKLOG,
          projectId: "project123",
          createdBy: "user123"
        }
      ],
      sprints: [
        {
          id: "sprint1",
          name: "Sprint 1",
          projectId: "project123",
          status: SprintStatus.PLANNED,
          startDate: now,
          endDate: now + 14 * 24 * 60 * 60 * 1000, // 2 weeks later
          createdBy: "user123"
        }
      ]
    };
    
    const result = verifyBacklogConsistency(backlog);
    assertEquals(result.isConsistent, true);
    assertEquals(result.errors.length, 0);
  });
});
