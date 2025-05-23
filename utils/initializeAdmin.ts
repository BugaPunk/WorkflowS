import { getKv } from "./db.ts";
import { COLLECTIONS } from "./db.ts";
import { UserRole, createUser, getUserByEmail } from "../models/user.ts";

// Configuración del usuario administrador por defecto
const DEFAULT_ADMIN = {
  username: "Admin",
  email: "admin@admin.com",
  password: "admin123",
  role: UserRole.ADMIN,
};

/**
 * Verifica si existe un usuario administrador y, si no existe, crea uno por defecto.
 * Esta función debe ejecutarse al iniciar la aplicación.
 */
export async function initializeAdmin(): Promise<void> {
  try {
    console.log("Verificando si existe un usuario administrador...");
    
    // Verificar si existe un usuario con el rol de administrador
    const kv = getKv();
    let adminExists = false;
    
    // Buscar por el email del administrador por defecto
    const adminUser = await getUserByEmail(DEFAULT_ADMIN.email);
    if (adminUser) {
      console.log(`Usuario administrador encontrado: ${adminUser.username} (${adminUser.email})`);
      adminExists = true;
    } else {
      // Si no se encuentra por email, buscar entre todos los usuarios
      const usersIterator = kv.list({ prefix: COLLECTIONS.USERS });
      
      for await (const entry of usersIterator) {
        // Solo incluir entradas principales de usuarios (no índices)
        if (entry.key.length === 2 && entry.key[0] === COLLECTIONS.USERS[0]) {
          const user = entry.value as { role: UserRole };
          if (user.role === UserRole.ADMIN) {
            adminExists = true;
            console.log("Se encontró un usuario administrador existente.");
            break;
          }
        }
      }
    }
    
    // Si no existe un administrador, crear uno por defecto
    if (!adminExists) {
      console.log("No se encontró ningún usuario administrador. Creando uno por defecto...");
      
      try {
        const admin = await createUser(DEFAULT_ADMIN);
        console.log(`Usuario administrador creado exitosamente: ${admin.username} (${admin.email})`);
        console.log("Credenciales por defecto:");
        console.log(`- Email: ${DEFAULT_ADMIN.email}`);
        console.log(`- Contraseña: ${DEFAULT_ADMIN.password}`);
        console.log("IMPORTANTE: Por seguridad, cambie estas credenciales después de iniciar sesión.");
      } catch (error) {
        console.error("Error al crear el usuario administrador:", error);
      }
    }
  } catch (error) {
    console.error("Error al inicializar el usuario administrador:", error);
  }
}
