import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Cargar variables de entorno
import "$std/dotenv/load.ts";

// Usar el driver de pg
const { Pool } = pg;

// Crear un pool de conexiones
const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
});

// Instanciar el cliente de Drizzle con el driver de pg
const db = drizzle(pool);

// Ejecutar las migraciones
console.log("Ejecutando migraciones...");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migraciones completadas");

// Cerrar la conexión
await pool.end();
