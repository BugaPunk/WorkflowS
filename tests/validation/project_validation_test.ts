// tests/validation/project_validation_test.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Definir el esquema del proyecto para validación
const ProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  createdBy: z.string().min(1),
});

// Función de validación para simular la validación del formulario
function validateProjectData(data: unknown) {
  const result = ProjectSchema.safeParse(data);
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

Deno.test("Project Form Validation", async (t) => {
  await t.step("should validate project name length", async () => {
    // Test invalid name (too short)
    const invalidName = validateProjectData({
      name: "ab",
      description: "Valid description",
      createdBy: "user123",
    });
    assertEquals(invalidName.success, false);
    assertEquals(typeof invalidName.errors.name, "string");
  });

  await t.step("should validate required createdBy field", async () => {
    // Test missing createdBy
    const missingCreatedBy = validateProjectData({
      name: "Valid Project Name",
      description: "Valid description",
      createdBy: "",
    });
    assertEquals(missingCreatedBy.success, false);
    assertEquals(typeof missingCreatedBy.errors.createdBy, "string");
  });

  await t.step("should accept valid data", async () => {
    // Test valid data
    const validData = validateProjectData({
      name: "Valid Project Name",
      description: "Valid description",
      createdBy: "user123",
    });
    assertEquals(validData.success, true);
    assertEquals(validData.errors, {});
  });
});
