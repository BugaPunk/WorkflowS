# WorkflowS - Proyecto Fresh con PostgreSQL y Drizzle ORM

Este proyecto utiliza Fresh como framework web, PostgreSQL como base de datos y Drizzle ORM para la gestión de la base de datos.

## Requisitos previos

1. Instalar Deno: https://deno.land/manual/getting_started/installation
2. Instalar PostgreSQL: https://www.postgresql.org/download/

## Guía de instalación rápida

Sigue estos pasos para configurar y ejecutar el proyecto desde cero:

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/WorkflowS.git
cd WorkflowS
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente información:

```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/workflow_db
```

Reemplaza `postgres` y `123456` con tu usuario y contraseña de PostgreSQL si son diferentes.

### 3. Configurar la base de datos y el usuario administrador

```bash
deno task setup
```

Este comando:
- Crea automáticamente la base de datos `workflow_db` en PostgreSQL
- Configura todas las tablas necesarias
- Crea un usuario administrador por defecto

### 4. Iniciar el servidor

```bash
deno task start
```

### 5. Acceder a la aplicación

Abre tu navegador y ve a http://localhost:8000

### 6. Iniciar sesión como administrador

Usa las siguientes credenciales:
- **Usuario**: admin
- **Contraseña**: admin123

> **IMPORTANTE**: Debes ejecutar `deno task setup` antes de `deno task start` en una instalación nueva. En ejecuciones posteriores, puedes usar directamente `deno task start`.

## Base de datos

### Generar migraciones

Para generar las migraciones basadas en el esquema definido:

```
deno task db:generate
```

### Aplicar migraciones

Para aplicar las migraciones a la base de datos:

```
deno run -A db/migrate.ts
```

## Comandos útiles

### Inicializar usuario administrador manualmente

Si necesitas crear el usuario administrador sin recrear la base de datos:

```
deno task init:admin
```

### Reiniciar la base de datos

Si necesitas reiniciar completamente la base de datos (borrando todos los datos):

```
deno task setup
```

**ADVERTENCIA**: Este comando eliminará todos los datos existentes y recreará la base de datos desde cero.

### Desarrollo

Durante el desarrollo, puedes usar:

```
deno task start
```

Esto iniciará el servidor en http://localhost:8000 y vigilará los cambios en el directorio del proyecto.

## API Endpoints

El proyecto incluye los siguientes endpoints de API:

### Usuarios
- `GET /api/users?id=1` - Obtener un usuario por ID
- `GET /api/users?email=ejemplo@email.com` - Obtener un usuario por email
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users` - Actualizar un usuario existente
- `DELETE /api/users?id=1` - Eliminar un usuario

### Proyectos
- `GET /api/projects?id=1` - Obtener un proyecto por ID
- `GET /api/projects?userId=1` - Obtener todos los proyectos de un usuario
- `POST /api/projects` - Crear un nuevo proyecto
- `PUT /api/projects` - Actualizar un proyecto existente
- `DELETE /api/projects?id=1` - Eliminar un proyecto

### Tareas
- `GET /api/tasks?id=1` - Obtener una tarea por ID
- `GET /api/tasks?projectId=1` - Obtener todas las tareas de un proyecto
- `GET /api/tasks?assignedTo=1` - Obtener todas las tareas asignadas a un usuario
- `POST /api/tasks` - Crear una nueva tarea
- `PUT /api/tasks` - Actualizar una tarea existente
- `DELETE /api/tasks?id=1` - Eliminar una tarea
