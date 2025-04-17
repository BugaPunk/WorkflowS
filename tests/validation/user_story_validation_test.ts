// tests/validation/user_story_validation_test.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Definir enumeraciones para la historia de usuario
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

// Definir el esquema de la historia de usuario para validación
const UserStorySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  acceptanceCriteria: z.string().min(5),
  priority: z.nativeEnum(UserStoryPriority).default(UserStoryPriority.MEDIUM),
  status: z.nativeEnum(UserStoryStatus).default(UserStoryStatus.BACKLOG),
  points: z.number().min(1).max(13).optional(),
  projectId: z.string().min(1),
  createdBy: z.string().min(1),
});

// Función de validación para simular la validación del formulario
function validateUserStoryData(data: unknown) {
  const result = UserStorySchema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {} };
  } else {
    const formattedErrors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      formattedErrors[path] = err.message;
    });
    return { success: false, errors: formattedErrors };
  }
}

Deno.test("User Story Form Validation", async (t) => {
  await t.step("should validate title length", async () => {
    // Test invalid title (too short)
    const invalidTitle = validateUserStoryData({
      title: "ab",
      description: "This is a valid description for a user story",
      acceptanceCriteria: "The feature should work correctly",
      priority: UserStoryPriority.HIGH,
      points: 5,
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(invalidTitle.success, false);
    assertEquals(typeof invalidTitle.errors.title, "string");
  });

  await t.step("should validate description length", async () => {
    // Test invalid description (too short)
    const invalidDescription = validateUserStoryData({
      title: "Valid User Story Title",
      description: "Too short",
      acceptanceCriteria: "The feature should work correctly",
      priority: UserStoryPriority.HIGH,
      points: 5,
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(invalidDescription.success, false);
    assertEquals(typeof invalidDescription.errors.description, "string");
  });

  await t.step("should validate acceptance criteria", async () => {
    // Test invalid acceptance criteria (too short)
    const invalidCriteria = validateUserStoryData({
      title: "Valid User Story Title",
      description: "This is a valid description for a user story",
      acceptanceCriteria: "Too",
      priority: UserStoryPriority.HIGH,
      points: 5,
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(invalidCriteria.success, false);
    assertEquals(typeof invalidCriteria.errors.acceptanceCriteria, "string");
  });

  await t.step("should validate story points range", async () => {
    // Test invalid points (too high)
    const invalidPoints = validateUserStoryData({
      title: "Valid User Story Title",
      description: "This is a valid description for a user story",
      acceptanceCriteria: "The feature should work correctly",
      priority: UserStoryPriority.HIGH,
      points: 20, // Too high, max is 13
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(invalidPoints.success, false);
    assertEquals(typeof invalidPoints.errors.points, "string");
  });

  await t.step("should accept valid data", async () => {
    // Test valid data
    const validData = validateUserStoryData({
      title: "Valid User Story Title",
      description: "This is a valid description for a user story",
      acceptanceCriteria: "The feature should work correctly",
      priority: UserStoryPriority.HIGH,
      points: 5,
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(validData.success, true);
    assertEquals(validData.errors, {});
  });

  await t.step("should use default values for priority and status", async () => {
    // Test with missing priority and status
    const withDefaults = validateUserStoryData({
      title: "Valid User Story Title",
      description: "This is a valid description for a user story",
      acceptanceCriteria: "The feature should work correctly",
      points: 5,
      projectId: "project123",
      createdBy: "user123",
    });
    assertEquals(withDefaults.success, true);
    assertEquals(withDefaults.errors, {});
  });
});
