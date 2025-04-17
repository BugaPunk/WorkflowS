// tests/unit/user_model_test.ts
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { createUser, getUserById, UserRole } from "../../models/user.ts";
import { setupTestDatabase, teardownTestDatabase } from "../setup.ts";

let kv: Deno.Kv;

Deno.test("User Model Tests", async (t) => {
  // Setup
  kv = await setupTestDatabase();

  // Tests
  await t.step("createUser should create a user with correct data", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.TEAM_DEVELOPER,
    };

    const user = await createUser(userData);

    assertEquals(user.username, userData.username);
    assertEquals(user.email, userData.email);
    assertEquals(user.firstName, userData.firstName);
    assertEquals(user.lastName, userData.lastName);
    assertEquals(user.role, userData.role);
    assertNotEquals(user.passwordHash, userData.password); // Password should be hashed
    assertExists(user.id);
    assertExists(user.createdAt);
    assertExists(user.updatedAt);
  });

  await t.step("getUserById should return the correct user", async () => {
    const userData = {
      username: "testuser2",
      email: "test2@example.com",
      password: "password123",
      role: UserRole.TEAM_DEVELOPER,
    };

    const createdUser = await createUser(userData);
    const retrievedUser = await getUserById(createdUser.id);

    assertExists(retrievedUser);
    assertEquals(retrievedUser?.id, createdUser.id);
    assertEquals(retrievedUser?.username, userData.username);
    assertEquals(retrievedUser?.email, userData.email);
  });

  // Teardown
  await teardownTestDatabase(kv);
});
