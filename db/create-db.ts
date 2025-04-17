import pg from "pg";
import "$std/dotenv/load.ts";

const { Client } = pg;

// Conexión a la base de datos postgres por defecto para crear nuestra base de datos
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

  // Verificar si la base de datos workflow_db existe
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    ["workflow_db"]
  );

  if (result.rowCount === 0) {
    // La base de datos no existe, vamos a crearla
    console.log("Creando base de datos workflow_db...");
    await client.query("CREATE DATABASE workflow_db");
    console.log("Base de datos workflow_db creada exitosamente");
  } else {
    console.log("La base de datos workflow_db ya existe");
  }
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
  console.log("Conexión cerrada");
}
