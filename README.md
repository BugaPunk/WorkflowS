# WorkflowS - Proyecto Fresh con PostgreSQL y Drizzle ORM

Este proyecto utiliza Fresh como framework web, PostgreSQL como base de datos y Drizzle ORM para la gestión de la base de datos.

## Requisitos previos

1. Instalar Deno: https://deno.land/manual/getting_started/installation
2. Instalar PostgreSQL: https://www.postgresql.org/download/
3. Crear una base de datos para el proyecto

## Configuración

1. Clonar el repositorio
2. Crear un archivo `.env` en la raíz del proyecto con la siguiente información:

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
```

Reemplaza `usuario`, `contraseña` y `nombre_db` con tus propios datos.

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

## Configuración rápida

Para configurar rápidamente el proyecto con la base de datos y un usuario administrador por defecto:

```
deno task setup
```

Este comando recreará la base de datos y creará un usuario administrador con las siguientes credenciales:

- **Usuario**: admin
- **Contraseña**: admin123
- **Email**: admin@workflow.com

**IMPORTANTE**: Cambia la contraseña del administrador después de iniciar sesión por primera vez.

## Iniciar el proyecto

Para iniciar el servidor de desarrollo:

```
deno task start
```

Esto iniciará el servidor en http://localhost:8000 y vigilará los cambios en el directorio del proyecto. Si es la primera vez que inicias el proyecto, se creará automáticamente un usuario administrador si no existe ninguno.

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
