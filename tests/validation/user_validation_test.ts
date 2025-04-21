// tests/validation/user_validation_test.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Definir enumeración para roles de usuario
enum UserRole {
  ADMIN = "admin",
  SCRUM_MASTER = "scrum_master",
  PRODUCT_OWNER = "product_owner",
  TEAM_DEVELOPER = "team_developer",
}

// Definir el esquema del usuario para validación
const UserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.TEAM_DEVELOPER),
});

// Función de validación para simular la validación del formulario
function validateUserData(data: unknown) {
  const result = UserSchema.safeParse(data);
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

Deno.test("User Form Validation", async (t) => {
  await t.step("should validate username length", async () => {
    // Test invalid username (too short)
    const invalidUsername = validateUserData({
      username: "ab",
      email: "test@example.com",
      password: "password123",
      role: UserRole.TEAM_DEVELOPER,
    });
    assertEquals(invalidUsername.success, false);
    assertEquals(typeof invalidUsername.errors.username, "string");
  });

  await t.step("should validate email format", async () => {
    // Test invalid email
    const invalidEmail = validateUserData({
      username: "validuser",
      email: "invalid-email",
      password: "password123",
      role: UserRole.TEAM_DEVELOPER,
    });
    assertEquals(invalidEmail.success, false);
    assertEquals(typeof invalidEmail.errors.email, "string");
  });

  await t.step("should validate password length", async () => {
    // Test invalid password (too short)
    const invalidPassword = validateUserData({
      username: "validuser",
      email: "test@example.com",
      password: "12345",
      role: UserRole.TEAM_DEVELOPER,
    });
    assertEquals(invalidPassword.success, false);
    assertEquals(typeof invalidPassword.errors.password, "string");
  });

  await t.step("should validate role", async () => {
    // Test invalid role
    const invalidRole = validateUserData({
      username: "validuser",
      email: "test@example.com",
      password: "password123",
      role: "invalid_role",
    });
    assertEquals(invalidRole.success, false);
    assertEquals(typeof invalidRole.errors.role, "string");
  });

  await t.step("should accept valid data", async () => {
    // Test valid data
    const validData = validateUserData({
      username: "validuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.TEAM_DEVELOPER,
    });
    assertEquals(validData.success, true);
    assertEquals(validData.errors, {});
  });

  await t.step("should use default role", async () => {
    // Test with missing role
    const withDefaultRole = validateUserData({
      username: "validuser",
      email: "test@example.com",
      password: "password123",
    });
    assertEquals(withDefaultRole.success, true);
    assertEquals(withDefaultRole.errors, {});
  });

  await t.step("should accept optional fields", async () => {
    // Test with missing optional fields
    const withoutOptionalFields = validateUserData({
      username: "validuser",
      email: "test@example.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    assertEquals(withoutOptionalFields.success, true);
    assertEquals(withoutOptionalFields.errors, {});
  });
});
