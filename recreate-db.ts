import "$std/dotenv/load.ts";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema.ts";

const { Pool, Client } = pg;

async function recreateDatabase() {
  console.log("Recreando la base de datos...");
  
  // Conectar a la base de datos postgres por defecto
  const client = new Client({
    user: "postgres",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "postgres",
  });
  
  try {
    await client.connect();
    console.log("Conectado a PostgreSQL");
    
    // Eliminar conexiones a la base de datos workflow_db
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'workflow_db'
      AND pid <> pg_backend_pid();
    `);
    
    // Eliminar la base de datos si existe
    await client.query("DROP DATABASE IF EXISTS workflow_db");
    console.log("Base de datos eliminada (si existía)");
    
    // Crear la base de datos
    await client.query("CREATE DATABASE workflow_db");
    console.log("Base de datos creada");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
  
  // Conectar a la base de datos workflow_db
  const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  });
  
  try {
    // Crear las tablas
    const db = drizzle(pool);
    
    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'administrator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabla de usuarios creada");
    
    // Crear tabla de proyectos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("Tabla de proyectos creada");
    
    // Crear tabla de tareas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        project_id INTEGER NOT NULL,
        assigned_to INTEGER,
        is_complete BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);
    console.log("Tabla de tareas creada");
    
    console.log("Base de datos recreada exitosamente");
  } catch (error) {
    console.error("Error al crear las tablas:", error);
  } finally {
    await pool.end();
  }
}

await recreateDatabase();
