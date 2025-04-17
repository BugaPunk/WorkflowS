import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Definición de roles de usuario
export enum UserRole {
  TEAM_DEVELOPER = "team_developer",
  SCRUM_MASTER = "scrum_master",
  PRODUCT_OWNER = "product_owner",
  ADMINISTRATOR = "administrator",
}

// Tabla de usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default(UserRole.ADMINISTRATOR),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabla de proyectos
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").notNull(),
}, (table) => {
  return {
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_user_id_fk",
    }),
  };
});

// Tabla de tareas
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pendiente"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  projectId: integer("project_id").notNull(),
  assignedTo: integer("assigned_to"),
  isComplete: boolean("is_complete").default(false),
}, (table) => {
  return {
    projectIdFk: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "tasks_project_id_fk",
    }),
    assignedToFk: foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [users.id],
      name: "tasks_assigned_to_fk",
    }),
  };
});
