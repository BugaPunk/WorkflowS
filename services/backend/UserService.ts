import { getKv, COLLECTIONS } from "@/utils/db.ts";
import {
  User,
  UserData,
  UserRole,
  createUser as createUserModel,
  getUserById as getUserByIdModel,
  getUserByEmail as getUserByEmailModel,
  getUserByUsername as getUserByUsernameModel,
  updateUser as updateUserModel,
  deleteUser as deleteUserModel,
  getAllUsers as getAllUsersModel,
  verifyPassword as validatePassword,
  hashPassword,
} from "@/models/user.ts";
import { getUserProjects } from "@/models/project.ts";
import { getUserTasks } from "@/models/task.ts";

/**
 * Servicio para gestionar usuarios en el backend
 */
export class UserService {
  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario
   * @returns Usuario creado
   */
  static async createUser(userData: UserData): Promise<User> {
    // Verificar que el email no está en uso
    const existingUserByEmail = await getUserByEmailModel(userData.email);
    if (existingUserByEmail) {
      throw new Error("El email ya está en uso");
    }

    // Verificar que el username no está en uso
    const existingUserByUsername = await getUserByUsernameModel(userData.username);
    if (existingUserByUsername) {
      throw new Error("El nombre de usuario ya está en uso");
    }

    // Crear el usuario
    return await createUserModel(userData);
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario o null si no existe
   */
  static async getUserById(id: string): Promise<User | null> {
    return await getUserByIdModel(id);
  }

  /**
   * Obtiene un usuario por su email
   * @param email Email del usuario
   * @returns Usuario o null si no existe
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await getUserByEmailModel(email);
  }

  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username Nombre de usuario
   * @returns Usuario o null si no existe
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    return await getUserByUsernameModel(username);
  }

  /**
   * Obtiene un usuario por su ID con información relacionada
   * @param id ID del usuario
   * @returns Usuario con información relacionada o null si no existe
   */
  static async getUserWithRelations(id: string): Promise<{
    user: User;
    projects: Awaited<ReturnType<typeof getUserProjects>>;
    tasks: Awaited<ReturnType<typeof getUserTasks>>;
  } | null> {
    const user = await getUserByIdModel(id);
    if (!user) {
      return null;
    }

    // Obtener proyectos del usuario
    const projects = await getUserProjects(id);

    // Obtener tareas asignadas al usuario
    const tasks = await getUserTasks(id);

    return {
      user,
      projects,
      tasks,
    };
  }

  /**
   * Actualiza un usuario
   * @param id ID del usuario
   * @param updateData Datos a actualizar
   * @returns Usuario actualizado o null si no existe
   */
  static async updateUser(id: string, updateData: Partial<UserData>): Promise<User | null> {
    // Verificar que el usuario existe
    const user = await getUserByIdModel(id);
    if (!user) {
      return null;
    }

    // Si se está actualizando el email, verificar que no está en uso
    if (updateData.email && updateData.email !== user.email) {
      const existingUserByEmail = await getUserByEmailModel(updateData.email);
      if (existingUserByEmail) {
        throw new Error("El email ya está en uso");
      }
    }

    // Si se está actualizando el username, verificar que no está en uso
    if (updateData.username && updateData.username !== user.username) {
      const existingUserByUsername = await getUserByUsernameModel(updateData.username);
      if (existingUserByUsername) {
        throw new Error("El nombre de usuario ya está en uso");
      }
    }

    // Si se está actualizando la contraseña, hashearla
    let passwordHash: string | undefined;
    if (updateData.password) {
      passwordHash = await hashPassword(updateData.password);
    }

    // Actualizar el usuario
    return await updateUserModel(id, {
      ...updateData,
      passwordHash,
    });
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  static async deleteUser(id: string): Promise<boolean> {
    return await deleteUserModel(id);
  }

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  static async getAllUsers(): Promise<User[]> {
    return await getAllUsersModel();
  }

  /**
   * Autentica un usuario
   * @param usernameOrEmail Nombre de usuario o email
   * @param password Contraseña
   * @returns Usuario autenticado o null si las credenciales son inválidas
   */
  static async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    // Determinar si es un email o un nombre de usuario
    const isEmail = usernameOrEmail.includes("@");

    // Obtener el usuario
    const user = isEmail
      ? await getUserByEmailModel(usernameOrEmail)
      : await getUserByUsernameModel(usernameOrEmail);

    if (!user) {
      return null;
    }

    // Verificar la contraseña
    const isValid = await validatePassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Actualiza el rol de un usuario
   * @param id ID del usuario
   * @param role Nuevo rol
   * @returns Usuario actualizado o null si no existe
   */
  static async updateUserRole(id: string, role: UserRole): Promise<User | null> {
    // Verificar que el usuario existe
    const user = await getUserByIdModel(id);
    if (!user) {
      return null;
    }

    // Actualizar el rol
    return await updateUserModel(id, { role });
  }

  /**
   * Obtiene usuarios con filtros avanzados
   * @param filters Filtros para los usuarios
   * @returns Lista de usuarios filtrados
   */
  static async getUsersWithFilters(
    filters: {
      role?: UserRole | UserRole[];
      search?: string;
    } = {}
  ): Promise<User[]> {
    const kv = getKv();
    const users: User[] = [];

    // Listar todos los usuarios
    const usersIterator = kv.list<User>({ prefix: COLLECTIONS.USERS });

    // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
    const roleSet = filters.role
      ? new Set(Array.isArray(filters.role) ? filters.role : [filters.role])
      : null;

    // Filtrar usuarios
    for await (const entry of usersIterator) {
      // Solo incluir entradas principales de usuarios
      if (entry.key.length === 2 && entry.key[0] === COLLECTIONS.USERS[0]) {
        const user = entry.value;
        let include = true;

        // Filtrar por rol
        if (roleSet && !roleSet.has(user.role)) {
          include = false;
        }

        // Filtrar por búsqueda de texto
        if (
          filters.search &&
          !user.username.toLowerCase().includes(filters.search.toLowerCase()) &&
          !user.email.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(
            user.firstName && user.firstName.toLowerCase().includes(filters.search.toLowerCase())
          ) &&
          !(user.lastName && user.lastName.toLowerCase().includes(filters.search.toLowerCase()))
        ) {
          include = false;
        }

        if (include) {
          users.push(user);
        }
      }
    }

    return users;
  }
}
