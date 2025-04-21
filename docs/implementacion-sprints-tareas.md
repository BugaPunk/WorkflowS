# Implementación de Gestión de Sprints y Tareas en WorkflowS

## Resumen de Implementaciones

Hemos implementado con éxito el Objetivo 3 del proyecto de grado, que consiste en "Desarrollar módulos para el seguimiento de iteraciones y tareas, proporcionando herramientas para la planificación y monitoreo del progreso de los proyectos". A continuación, se presenta un resumen detallado de todas las nuevas implementaciones realizadas.

## 1. API para Gestión de Tareas

### Endpoint para Tareas Individuales (`/api/tasks/[id].ts`)

Implementamos un endpoint completo para la gestión de tareas individuales con las siguientes operaciones:

- **GET**: Obtener información detallada de una tarea específica
- **PUT**: Actualizar una tarea existente con validación de permisos según el rol del usuario
- **DELETE**: Eliminar una tarea con validación de permisos (solo Admin, Scrum Master o creador)

Este endpoint incluye manejo de errores y validación de permisos basada en roles, asegurando que solo los usuarios autorizados puedan modificar o eliminar tareas.

## 2. Componentes de Interfaz para Sprints

### SprintsList.tsx

Un componente isla que muestra todos los sprints de un proyecto, agrupados por estado:
- Sprints activos
- Sprints planificados
- Sprints completados

Incluye funcionalidades para:
- Cargar sprints desde la API
- Crear nuevos sprints mediante un modal
- Visualizar el estado de cada sprint con indicadores de color

### SprintCard.tsx

Componente para mostrar la información de un sprint individual:
- Nombre y objetivo del sprint
- Fechas de inicio y fin
- Estado actual con indicador visual
- Número de historias de usuario asignadas
- Botones para editar y eliminar (con confirmación)
- Enlace para ver detalles completos

### CreateSprintForm.tsx

Formulario para la creación de nuevos sprints con:
- Campos para nombre, objetivo, estado, fechas de inicio y fin
- Validación de datos (fechas, campos requeridos)
- Manejo de errores y estado de carga

### EditSprintForm.tsx

Formulario para editar sprints existentes con:
- Carga de datos actuales del sprint
- Campos para modificar nombre, objetivo, estado, fechas
- Validación de datos y manejo de errores

## 3. Componentes de Interfaz para Tareas

### TasksList.tsx

Componente isla que muestra todas las tareas de una historia de usuario, organizadas en un tablero Kanban con columnas:
- Por hacer
- En progreso
- Completadas
- En revisión (sección adicional)
- Bloqueadas (sección adicional)

Incluye funcionalidades para:
- Cargar tareas desde la API
- Crear nuevas tareas mediante un modal
- Visualizar el estado de cada tarea con indicadores de color

### TaskCard.tsx

Componente para mostrar la información de una tarea individual:
- Título y descripción de la tarea
- Estado actual con indicador visual
- Usuario asignado
- Horas estimadas y dedicadas
- Botones para cambiar rápidamente el estado
- Botones para editar y eliminar (con confirmación)

### CreateTaskForm.tsx

Formulario para la creación de nuevas tareas con:
- Campos para título, descripción, estado, usuario asignado, horas estimadas y dedicadas
- Validación de datos
- Manejo de errores y estado de carga

### EditTaskForm.tsx

Formulario para editar tareas existentes con:
- Carga de datos actuales de la tarea
- Campos para modificar título, descripción, estado, usuario asignado, horas
- Validación de datos y manejo de errores

## 4. Páginas para Visualización y Gestión

### Página de Sprints del Proyecto (`/projects/[id]/sprints.tsx`)

Página que muestra todos los sprints de un proyecto específico:
- Encabezado con información del proyecto
- Lista de sprints organizada por estado
- Permisos basados en roles (solo Admin y Scrum Master pueden gestionar sprints)

### Página de Detalles del Sprint (`/sprints/[id].tsx`)

Página detallada para un sprint específico:
- Información completa del sprint (nombre, objetivo, fechas, estado)
- Lista de historias de usuario asignadas al sprint
- Vista previa de las tareas de cada historia de usuario
- Métricas del sprint (historias de usuario, tareas totales, tareas completadas)
- Placeholder para Burndown Chart (para implementación futura)

### Página de Tareas de Historia de Usuario (`/user-stories/[id]/tasks.tsx`)

Página que muestra todas las tareas de una historia de usuario específica:
- Información de la historia de usuario (título, descripción, criterios de aceptación)
- Tablero Kanban con las tareas organizadas por estado
- Funcionalidades para crear, editar y eliminar tareas
- Permisos basados en roles

## 5. Integración con la Página de Detalles del Proyecto

Actualizamos la página de detalles del proyecto (`/projects/[id].tsx`) para incluir:
- Sección de "Sprints y Tareas" con enlaces a la gestión de sprints y historias de usuario
- Botón "Gestionar Sprints" en la barra de navegación (solo visible para Admin y Scrum Master)
- Acceso rápido a sprints en la sección de "Acciones Rápidas"

## 6. Modelos de Datos y Servicios

### Modelo de Sprint

Implementamos un modelo completo para los sprints con:
- Propiedades: id, nombre, objetivo, fechas, estado, historias de usuario asignadas
- Funciones para crear, obtener, actualizar y eliminar sprints
- Función para obtener todos los sprints de un proyecto

### Modelo de Tarea

Implementamos un modelo completo para las tareas con:
- Propiedades: id, título, descripción, estado, usuario asignado, horas estimadas y dedicadas
- Funciones para crear, obtener, actualizar y eliminar tareas
- Función para obtener todas las tareas de una historia de usuario

### Servicios para Interacción con la API

Implementamos servicios para interactuar con la API:
- `sprintService.ts`: Para operaciones CRUD en sprints
- `taskService.ts`: Para operaciones CRUD en tareas

## 7. Correcciones y Mejoras

Durante la implementación, realizamos varias correcciones y mejoras:
- Corregimos errores de tipo en TypeScript
- Mejoramos la estructura de los componentes para usar `MainLayout` de manera consistente
- Eliminamos variables y funciones no utilizadas
- Añadimos atributos `type="button"` a los botones para evitar comportamientos no deseados
- Corregimos la estructura de los modales para usar la propiedad `show` correctamente

## Conclusión

Con estas implementaciones, hemos logrado cumplir con el Objetivo 3 del proyecto de grado, proporcionando herramientas completas para la planificación y seguimiento de sprints y tareas en la plataforma WorkflowS. Los usuarios ahora pueden:

1. Crear y gestionar sprints para organizar el trabajo en iteraciones
2. Asignar historias de usuario a sprints específicos
3. Crear y gestionar tareas asociadas a historias de usuario
4. Visualizar el progreso del proyecto mediante tableros Kanban y métricas
5. Colaborar efectivamente con diferentes roles y permisos

Estas funcionalidades permiten una implementación efectiva de la metodología Scrum en el entorno académico, facilitando tanto la labor docente como el aprendizaje de los estudiantes.
