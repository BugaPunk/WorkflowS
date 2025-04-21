// tests/unit/user_model_mock_test.ts
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { stub } from "https://deno.land/std/testing/mock.ts";
import * as db from "../../utils/db.ts";
import { createUser, getUserById, UserRole } from "../../models/user.ts";

// Mock de Deno.Kv para pruebas
class MockKv implements Deno.Kv {
  private store = new Map<string, unknown>();

  async get<T>(key: Deno.KvKey): Promise<Deno.KvEntryMaybe<T>> {
    const stringKey = JSON.stringify(key);
    const value = this.store.get(stringKey) as T;
    return { key, value, versionstamp: value ? "1" : null };
  }

  async set(key: Deno.KvKey, value: unknown): Promise<Deno.KvCommitResult> {
    const stringKey = JSON.stringify(key);
    this.store.set(stringKey, value);
    return { ok: true, versionstamp: "1" };
  }

  async delete(key: Deno.KvKey): Promise<void> {
    const stringKey = JSON.stringify(key);
    this.store.delete(stringKey);
  }

  list<T>(options?: Deno.KvListOptions): Deno.KvListIterator<T> {
    throw new Error("Method not implemented.");
  }

  close(): void {
    this.store.clear();
  }
}

Deno.test("User Model Tests with Mocks", async (t) => {
  // Crear un mock de KV
  const mockKv = new MockKv();
  
  // Stub para la función getKv
  const getKvStub = stub(db, "getKv", () => mockKv as Deno.Kv);

  try {
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
  } finally {
    // Restaurar el stub
    getKvStub.restore();
    // Cerrar el mock de KV
    mockKv.close();
  }
});
