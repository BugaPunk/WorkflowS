import { assertEquals, assertExists, assertNotEquals, assertRejects } from "https://deno.land/std/testing/asserts.ts";
import { 
  createUser, 
  getUserById, 
  updateUserRole, 
  deleteUser, 
  UserRole 
} from "../../../models/user.ts";

// Configuración para pruebas
let testUserId = "";

// Limpiar después de las pruebas
Deno.test({
  name: "cleanup",
  fn: async () => {
    if (testUserId) {
      try {
        await deleteUser(testUserId);
      } catch (e) {
        // Ignorar errores durante la limpieza
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
  sanitizeExit: false,
});

// U1.1: Crear usuario con datos válidos
Deno.test("U1.1: createUser should create a user with valid data", async () => {
  // Arrange
  const userData = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    role: UserRole.TEAM_DEVELOPER,
  };

  // Act
  const user = await createUser(userData);
  testUserId = user.id; // Guardar ID para limpieza

  // Assert
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

// U1.2: Crear usuario con email inválido
Deno.test("U1.2: createUser should reject invalid email", async () => {
  // Arrange
  const userData = {
    username: "testuser2",
    email: "invalid-email",
    password: "password123",
    role: UserRole.TEAM_DEVELOPER,
  };

  // Act & Assert
  await assertRejects(
    async () => {
      await createUser(userData);
    },
    Error,
    "Invalid email"
  );
});

// U1.3: Crear usuario con contraseña corta
Deno.test("U1.3: createUser should reject short password", async () => {
  // Arrange
  const userData = {
    username: "testuser3",
    email: "test3@example.com",
    password: "short",
    role: UserRole.TEAM_DEVELOPER,
  };

  // Act & Assert
  await assertRejects(
    async () => {
      await createUser(userData);
    },
    Error,
    "Password too short"
  );
});

// U1.4: Obtener usuario por ID
Deno.test("U1.4: getUserById should return correct user", async () => {
  // Arrange - Asumimos que testUserId está establecido desde la prueba U1.1
  
  // Act
  const user = await getUserById(testUserId);
  
  // Assert
  assertExists(user);
  assertEquals(user?.id, testUserId);
  assertEquals(user?.username, "testuser");
  assertEquals(user?.email, "test@example.com");
});

// U1.5: Obtener usuario por ID inexistente
Deno.test("U1.5: getUserById should return null for non-existent ID", async () => {
  // Arrange
  const nonExistentId = "non-existent-id";
  
  // Act
  const user = await getUserById(nonExistentId);
  
  // Assert
  assertEquals(user, null);
});

// U1.6: Actualizar rol de usuario
Deno.test("U1.6: updateUserRole should update user role", async () => {
  // Arrange - Asumimos que testUserId está establecido desde la prueba U1.1
  
  // Act
  const updatedUser = await updateUserRole(testUserId, UserRole.SCRUM_MASTER);
  
  // Assert
  assertExists(updatedUser);
  assertEquals(updatedUser?.role, UserRole.SCRUM_MASTER);
  
  // Verificar que el cambio persiste
  const retrievedUser = await getUserById(testUserId);
  assertEquals(retrievedUser?.role, UserRole.SCRUM_MASTER);
});

// U1.7: Eliminar usuario
Deno.test("U1.7: deleteUser should delete user correctly", async () => {
  // Arrange - Asumimos que testUserId está establecido desde la prueba U1.1
  
  // Act
  const result = await deleteUser(testUserId);
  
  // Assert
  assertEquals(result, true);
  
  // Verificar que el usuario ya no existe
  const deletedUser = await getUserById(testUserId);
  assertEquals(deletedUser, null);
  
  // Limpiar testUserId ya que el usuario ha sido eliminado
  testUserId = "";
});
