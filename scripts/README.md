# Scripts de Datos de Prueba - WorkflowS

Este directorio contiene scripts para poblar la base de datos con datos de prueba completos que permiten probar todas las funcionalidades del sistema WorkflowS.

## 📁 Archivos Disponibles

### Scripts Principales

1. **`setup-complete-test-data.ts`** - Script maestro que ejecuta todo
2. **`populate-extended-test-data.ts`** - Datos básicos (usuarios, proyectos, sprints, tareas)
3. **`populate-rubrics-evaluations.ts`** - Rúbricas, evaluaciones y reportes
4. **`populate-test-data.ts`** - Script original básico

### Archivos de Documentación

- **`README.md`** - Este archivo con instrucciones

## 🚀 Uso Rápido

### Opción 1: Configuración Completa (Recomendado)

```bash
# Ejecutar el script maestro que configura todo
deno run --unstable-kv -A scripts/setup-complete-test-data.ts
```

Este script:
- Limpia la base de datos existente
- Crea todos los datos de prueba
- Muestra un resumen completo
- Proporciona instrucciones de uso

### Opción 2: Scripts Individuales

```bash
# 1. Datos básicos
deno run --unstable-kv -A scripts/populate-extended-test-data.ts

# 2. Rúbricas y evaluaciones
deno run --unstable-kv -A scripts/populate-rubrics-evaluations.ts
```

## 👥 Usuarios Creados

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | Administrador | Acceso completo al sistema |
| `maria.garcia` | `maria123` | Product Owner | Gestión de backlog y evaluaciones |
| `carlos.lopez` | `carlos123` | Scrum Master | Gestión de sprints y equipos |
| `ana.martinez` | `dev123` | Developer | Desarrollo y tareas |
| `luis.rodriguez` | `dev123` | Developer | Desarrollo y tareas |
| `sofia.hernandez` | `dev123` | Developer | Desarrollo y tareas |
| `diego.morales` | `dev123` | Developer | Desarrollo y tareas |
| `laura.jimenez` | `dev123` | Developer | Desarrollo y tareas |

## 📊 Datos Creados

### Proyectos
- **Sistema de Gestión Académica** (En progreso)
- **E-commerce Mobile App** (Planificación)

### Sprints
- **Sprint 1**: Autenticación y Usuarios (Completado)
- **Sprint 2**: Gestión de Cursos (Activo)
- **Sprint 3**: Sistema de Calificaciones (Planificado)

### Historias de Usuario
- 5 historias distribuidas en los sprints
- Diferentes estados: DONE, IN_PROGRESS, TODO
- Puntos de historia asignados

### Tareas
- 8 tareas con diferentes estados
- Asignadas a diferentes desarrolladores
- Incluye registro de tiempo trabajado

### Entregables
- **Documentación de API de Usuarios** (Enviado)
- **Prototipo de Interfaz de Login** (Evaluado)
- **Código Fuente - Gestión de Cursos** (En revisión)

### Rúbricas
- **Evaluación de Documentación** (4 criterios)
- **Evaluación de Código** (4 criterios)
- **Evaluación de Prototipos** (4 criterios)

### Evaluaciones
- 2 evaluaciones completadas con puntuaciones
- 1 evaluación en progreso
- Retroalimentación detallada por criterio

### Reportes
- Reporte de progreso de sprint
- Reporte de evaluaciones del mes

## 🔍 Funcionalidades para Probar

### Como Administrador (`admin`)
- Gestión completa de usuarios
- Configuración del sistema
- Acceso a todos los reportes
- Gestión de proyectos

### Como Product Owner (`maria.garcia`)
- Gestión del backlog
- Creación de historias de usuario
- Evaluación de entregables
- Reportes de progreso

### Como Scrum Master (`carlos.lopez`)
- Gestión de sprints
- Asignación de tareas
- Facilitación del equipo
- Métricas de sprint

### Como Developer (cualquier dev)
- Ver tareas asignadas
- Registrar tiempo trabajado
- Actualizar estado de tareas
- Ver evaluaciones recibidas

## 🌐 Acceso al Sistema

1. **Iniciar el servidor**:
   ```bash
   deno task start
   ```

2. **Abrir navegador**:
   ```
   http://localhost:8000
   ```

3. **Iniciar sesión** con cualquiera de los usuarios listados arriba

## 🧪 Escenarios de Prueba Sugeridos

### Flujo Completo de Desarrollo
1. Inicia como Product Owner
2. Crea una nueva historia de usuario
3. Cambia a Scrum Master
4. Asigna la historia a un sprint
5. Crea tareas para la historia
6. Cambia a Developer
7. Trabaja en las tareas y registra tiempo
8. Cambia el estado de las tareas en el Kanban

### Flujo de Evaluación
1. Inicia como Developer
2. Sube un entregable
3. Cambia a Product Owner/Scrum Master
4. Evalúa el entregable usando una rúbrica
5. Proporciona retroalimentación
6. Cambia a Developer para ver la evaluación

### Análisis de Métricas
1. Inicia como Scrum Master
2. Revisa el progreso del sprint actual
3. Analiza las métricas de carga de trabajo
4. Genera reportes de progreso
5. Revisa el burndown chart

## 🔧 Solución de Problemas

### Error: "Permission denied"
```bash
# Asegúrate de tener permisos de ejecución
chmod +x scripts/*.ts
```

### Error: "Module not found"
```bash
# Recarga las dependencias
deno cache --reload deps.ts
```

### Error: "Database locked"
```bash
# Detén el servidor antes de ejecutar los scripts
# Ctrl+C en la terminal del servidor
```

### Base de datos corrupta
```bash
# Elimina la base de datos y vuelve a crear
rm -rf .deno_kv_store
deno run --unstable-kv -A scripts/setup-complete-test-data.ts
```

## 📝 Personalización

### Agregar más usuarios
Edita `populate-extended-test-data.ts` y agrega usuarios al array `developerData`.

### Crear más proyectos
Agrega nuevos proyectos en la sección "CREAR PROYECTOS" del script.

### Modificar rúbricas
Edita `populate-rubrics-evaluations.ts` para cambiar criterios o agregar nuevas rúbricas.

### Datos específicos
Crea tu propio script basado en los existentes para datos específicos de tu caso de uso.

## 🤝 Contribución

Para agregar nuevos datos de prueba:

1. Crea un nuevo script en este directorio
2. Sigue el patrón de los scripts existentes
3. Agrega documentación en este README
4. Actualiza el script maestro si es necesario

## 📞 Soporte

Si encuentras problemas con los scripts:

1. Revisa los logs de error detalladamente
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que el servidor no esté ejecutándose
4. Consulta la documentación del proyecto principal
