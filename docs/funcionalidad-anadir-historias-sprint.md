# Funcionalidad: Añadir Historias de Usuario a un Sprint

## Descripción

Esta funcionalidad permite a los Scrum Masters y Administradores añadir historias de usuario existentes a un sprint. Esto es fundamental para la planificación de sprints y la gestión del trabajo del equipo.

## Implementación

Se ha implementado una nueva vista que permite seleccionar y añadir múltiples historias de usuario a un sprint de manera eficiente.

### Archivos Creados

1. **`routes/sprints/[id]/add-user-stories.tsx`**
   - Ruta que maneja la vista para añadir historias de usuario a un sprint específico
   - Verifica permisos (solo Scrum Masters y Administradores)
   - Obtiene las historias de usuario disponibles (en estado Backlog o Planificado)
   - Filtra las historias que ya están asignadas al sprint

2. **`islands/Sprints/AddUserStoriesToSprint.tsx`**
   - Componente interactivo que permite seleccionar múltiples historias de usuario
   - Proporciona opciones para seleccionar/deseleccionar todas las historias
   - Muestra información relevante de cada historia (título, descripción, prioridad, puntos)
   - Maneja la lógica para añadir las historias seleccionadas al sprint

### Flujo de Usuario

1. El usuario navega a la vista de detalle de un sprint
2. Si no hay historias de usuario asignadas, se muestra un mensaje y un botón "Añadir historias de usuario"
3. Al hacer clic en el botón, el usuario es dirigido a la nueva vista `/sprints/[id]/add-user-stories`
4. El usuario puede seleccionar una o más historias de usuario disponibles
5. Al hacer clic en "Añadir historias al sprint", las historias seleccionadas se añaden al sprint
6. Después de una confirmación exitosa, el usuario es redirigido de vuelta a la vista de detalle del sprint

### Permisos

- Solo los usuarios con rol de Scrum Master o Administrador pueden acceder a esta funcionalidad
- Si un usuario sin los permisos adecuados intenta acceder, será redirigido a la página de "No autorizado"

### Filtrado Inteligente

- Solo se muestran historias de usuario que:
  - Pertenecen al mismo proyecto que el sprint
  - Están en estado Backlog o Planificado
  - No están ya asignadas al sprint actual

## Beneficios

1. **Mejora de la Experiencia de Usuario**: Interfaz intuitiva para seleccionar múltiples historias
2. **Eficiencia**: Permite añadir varias historias en una sola operación
3. **Claridad**: Muestra información relevante para tomar decisiones informadas
4. **Seguridad**: Implementa verificación de permisos adecuada

## Relación con el Objetivo 3

Esta funcionalidad contribuye directamente al Objetivo 3 del proyecto:

> Desarrollar módulos para el seguimiento de iteraciones y tareas, proporcionando herramientas para la planificación y monitoreo del progreso de los proyectos.

Al permitir la asignación de historias de usuario a sprints, se facilita la planificación de iteraciones y se establece la base para el seguimiento del progreso del proyecto.
