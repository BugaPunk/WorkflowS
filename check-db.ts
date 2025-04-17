import "$std/dotenv/load.ts";
import pg from "pg";

const { Pool } = pg;

async function checkDatabase() {
  console.log("Conectando a PostgreSQL...");
  
  const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  });
  
  try {
    // Consultar usuarios
    console.log("\n=== USUARIOS ===");
    const usersResult = await pool.query("SELECT * FROM users");
    console.table(usersResult.rows);
    
    // Consultar proyectos
    console.log("\n=== PROYECTOS ===");
    const projectsResult = await pool.query("SELECT * FROM projects");
    console.table(projectsResult.rows);
    
    // Consultar tareas
    console.log("\n=== TAREAS ===");
    const tasksResult = await pool.query("SELECT * FROM tasks");
    console.table(tasksResult.rows);
    
    // Consulta con JOIN para mostrar tareas con información de proyecto y usuario
    console.log("\n=== TAREAS CON DETALLES ===");
    const detailedTasksResult = await pool.query(`
      SELECT 
        t.id as task_id, 
        t.title as task_title, 
        t.status, 
        p.name as project_name, 
        u.name as assigned_to
      FROM 
        tasks t
      JOIN 
        projects p ON t.project_id = p.id
      LEFT JOIN 
        users u ON t.assigned_to = u.id
    `);
    console.table(detailedTasksResult.rows);
    
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
  } finally {
    await pool.end();
    console.log("Conexión cerrada");
  }
}

await checkDatabase();
