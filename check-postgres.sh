#!/bin/bash

# Conectar a PostgreSQL y ejecutar consultas
PGPASSWORD=123456 psql -U postgres -d workflow_db -c "
-- Mostrar todas las tablas
\\dt;

-- Consultar usuarios
SELECT * FROM users;

-- Consultar proyectos
SELECT * FROM projects;

-- Consultar tareas
SELECT * FROM tasks;
"
