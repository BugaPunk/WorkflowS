# Guía de Instalación de WorkflowS

Esta guía detalla el proceso de instalación y configuración del proyecto WorkflowS desde cero.

## Requisitos previos

1. **Deno**: Asegúrate de tener Deno instalado. [Instrucciones de instalación](https://deno.land/manual/getting_started/installation)
2. **PostgreSQL**: Debes tener PostgreSQL instalado y en ejecución. [Descargar PostgreSQL](https://www.postgresql.org/download/)

## Proceso de instalación paso a paso

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

Este comando realiza las siguientes acciones:
- Crea automáticamente la base de datos `workflow_db` en PostgreSQL (no necesitas crearla manualmente)
- Configura todas las tablas necesarias para la aplicación
- Crea un usuario administrador por defecto

> **IMPORTANTE**: Este paso es obligatorio en una instalación nueva. El comando `setup` se encarga de toda la configuración de la base de datos.

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
- **Email**: admin@workflow.com

Por seguridad, cambia la contraseña del administrador después de iniciar sesión por primera vez.

## Ejecuciones posteriores

En ejecuciones posteriores, después de la instalación inicial, solo necesitas ejecutar:

```bash
deno task start
```

No es necesario ejecutar `deno task setup` nuevamente a menos que quieras reiniciar completamente la base de datos.

## Solución de problemas

### Error de conexión a la base de datos

Si encuentras errores de conexión a la base de datos, verifica:
1. Que PostgreSQL esté en ejecución
2. Que las credenciales en el archivo `.env` sean correctas
3. Que el usuario de PostgreSQL tenga permisos para crear bases de datos

### Error al crear el usuario administrador

Si el script no puede crear el usuario administrador, puedes ejecutar manualmente:

```bash
deno task init:admin
```

### Reiniciar completamente la aplicación

Si necesitas reiniciar completamente la aplicación y la base de datos:

```bash
deno task setup
```

**ADVERTENCIA**: Este comando eliminará todos los datos existentes y recreará la base de datos desde cero.
