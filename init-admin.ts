import "$std/dotenv/load.ts";
import { createUser, getUserByEmail, getUserByUsername } from "./db/db.ts";
import { UserRole } from "./db/schema.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Configuración del usuario administrador por defecto
const DEFAULT_ADMIN = {
  firstName: "Admin",
  lastName: "System",
  username: "admin",
  email: "admin@workflow.com",
  password: "123456", // Esta contraseña se hasheará antes de guardarla
  role: UserRole.ADMINISTRATOR,
};

export async function initializeAdmin() {
  console.log("Verificando si existe un usuario administrador...");

  try {
    // Verificar si ya existe un usuario con el mismo email o username
    const existingUserByEmail = await getUserByEmail(DEFAULT_ADMIN.email);
    const existingUserByUsername = await getUserByUsername(DEFAULT_ADMIN.username);

    if (existingUserByEmail.length > 0 || existingUserByUsername.length > 0) {
      console.log("Ya existe un usuario administrador. No se creará uno nuevo.");
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password);

    // Crear el usuario administrador
    const newAdmin = await createUser({
      firstName: DEFAULT_ADMIN.firstName,
      lastName: DEFAULT_ADMIN.lastName,
      username: DEFAULT_ADMIN.username,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
    });

    console.log("Usuario administrador creado exitosamente:");
    console.log(`- Nombre: ${DEFAULT_ADMIN.firstName} ${DEFAULT_ADMIN.lastName}`);
    console.log(`- Usuario: ${DEFAULT_ADMIN.username}`);
    console.log(`- Email: ${DEFAULT_ADMIN.email}`);
    console.log(`- Contraseña: ${DEFAULT_ADMIN.password}`);
    console.log(`- Rol: ${DEFAULT_ADMIN.role}`);
    console.log("\n¡IMPORTANTE! Cambia la contraseña del administrador después de iniciar sesión por primera vez.");

  } catch (error) {
    console.error("Error al crear el usuario administrador:", error);
  }
}

// Si se ejecuta directamente, inicializar el administrador
if (import.meta.main) {
  await initializeAdmin();
}
