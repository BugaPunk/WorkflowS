// tests/validation/task_validation_test.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Definir enumeración para estado de la tarea
enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  BLOCKED = "blocked",
}

// Definir el esquema de la tarea para validación
const TaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  userStoryId: z.string().min(1),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assignedTo: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  spentHours: z.number().min(0).optional(),
  createdBy: z.string().min(1),
});

// Función de validación para simular la validación del formulario
function validateTaskData(data: unknown) {
  const result = TaskSchema.safeParse(data);
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

Deno.test("Task Form Validation", async (t) => {
  await t.step("should validate task title length", async () => {
    // Test invalid title (too short)
    const invalidTitle = validateTaskData({
      title: "ab",
      description: "Valid description",
      userStoryId: "userstory123",
      status: TaskStatus.TODO,
      createdBy: "user123",
    });
    assertEquals(invalidTitle.success, false);
    assertEquals(typeof invalidTitle.errors.title, "string");
  });

  await t.step("should validate required userStoryId field", async () => {
    // Test missing userStoryId
    const missingUserStoryId = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "",
      status: TaskStatus.TODO,
      createdBy: "user123",
    });
    assertEquals(missingUserStoryId.success, false);
    assertEquals(typeof missingUserStoryId.errors.userStoryId, "string");
  });

  await t.step("should validate task status", async () => {
    // Test invalid status
    const invalidStatus = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      status: "invalid_status",
      createdBy: "user123",
    });
    assertEquals(invalidStatus.success, false);
    assertEquals(typeof invalidStatus.errors.status, "string");
  });

  await t.step("should validate estimated hours", async () => {
    // Test negative estimated hours
    const negativeHours = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      status: TaskStatus.TODO,
      estimatedHours: -5, // Negative hours
      createdBy: "user123",
    });
    assertEquals(negativeHours.success, false);
    assertEquals(typeof negativeHours.errors.estimatedHours, "string");
  });

  await t.step("should validate spent hours", async () => {
    // Test negative spent hours
    const negativeSpentHours = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      status: TaskStatus.TODO,
      spentHours: -2, // Negative hours
      createdBy: "user123",
    });
    assertEquals(negativeSpentHours.success, false);
    assertEquals(typeof negativeSpentHours.errors.spentHours, "string");
  });

  await t.step("should accept valid data", async () => {
    // Test valid data
    const validData = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      status: TaskStatus.TODO,
      assignedTo: "user456",
      estimatedHours: 8,
      spentHours: 4,
      createdBy: "user123",
    });
    assertEquals(validData.success, true);
    assertEquals(validData.errors, {});
  });

  await t.step("should use default status", async () => {
    // Test with missing status
    const withDefaultStatus = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      createdBy: "user123",
    });
    assertEquals(withDefaultStatus.success, true);
    assertEquals(withDefaultStatus.errors, {});
  });

  await t.step("should accept optional fields", async () => {
    // Test with missing optional fields
    const withoutOptionalFields = validateTaskData({
      title: "Valid Task Title",
      userStoryId: "userstory123",
      createdBy: "user123",
    });
    assertEquals(withoutOptionalFields.success, true);
    assertEquals(withoutOptionalFields.errors, {});
  });

  await t.step("should validate task assignment", async () => {
    // Test valid assignment
    const validAssignment = validateTaskData({
      title: "Valid Task Title",
      description: "Valid description",
      userStoryId: "userstory123",
      status: TaskStatus.TODO,
      assignedTo: "user456", // Valid user ID
      createdBy: "user123",
    });
    assertEquals(validAssignment.success, true);
    assertEquals(validAssignment.errors, {});
  });
});
