import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pg from "pg";
import * as schema from "./schema.ts";

// Usar el driver de pg
const { Pool } = pg;

// Crear un pool de conexiones
const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
});

// Instanciar el cliente de Drizzle con el driver de pg y el esquema
export const db = drizzle(pool, { schema });

// Funciones para usuarios
export async function createUser(data: Omit<typeof schema.users.$inferInsert, "id" | "createdAt">) {
  return await db.insert(schema.users).values(data).returning();
}

export async function getUserById(id: number) {
  return await db.select().from(schema.users).where(eq(schema.users.id, id));
}

export async function getUserByEmail(email: string) {
  return await db.select().from(schema.users).where(eq(schema.users.email, email));
}

export async function getUserByUsername(username: string) {
  return await db.select().from(schema.users).where(eq(schema.users.username, username));
}

export async function updateUser(id: number, data: Partial<Omit<typeof schema.users.$inferInsert, "id" | "createdAt">>) {
  return await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
}

export async function deleteUser(id: number) {
  return await db.delete(schema.users).where(eq(schema.users.id, id));
}

// Funciones para proyectos
export async function createProject(data: Omit<typeof schema.projects.$inferInsert, "id" | "createdAt">) {
  return await db.insert(schema.projects).values(data).returning();
}

export async function getProjectById(id: number) {
  return await db.select().from(schema.projects).where(eq(schema.projects.id, id));
}

export async function getProjectsByUserId(userId: number) {
  return await db.select().from(schema.projects).where(eq(schema.projects.userId, userId));
}

export async function updateProject(id: number, data: Partial<Omit<typeof schema.projects.$inferInsert, "id" | "createdAt">>) {
  return await db.update(schema.projects).set(data).where(eq(schema.projects.id, id)).returning();
}

export async function deleteProject(id: number) {
  return await db.delete(schema.projects).where(eq(schema.projects.id, id));
}

// Funciones para tareas
export async function createTask(data: Omit<typeof schema.tasks.$inferInsert, "id" | "createdAt">) {
  return await db.insert(schema.tasks).values(data).returning();
}

export async function getTaskById(id: number) {
  return await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
}

export async function getTasksByProjectId(projectId: number) {
  return await db.select().from(schema.tasks).where(eq(schema.tasks.projectId, projectId));
}

export async function getTasksByAssignedTo(userId: number) {
  return await db.select().from(schema.tasks).where(eq(schema.tasks.assignedTo, userId));
}

export async function updateTask(id: number, data: Partial<Omit<typeof schema.tasks.$inferInsert, "id" | "createdAt">>) {
  return await db.update(schema.tasks).set(data).where(eq(schema.tasks.id, id)).returning();
}

export async function deleteTask(id: number) {
  return await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
}

// Función para cerrar la conexión a la base de datos
export async function closeConnection() {
  await pool.end();
}
