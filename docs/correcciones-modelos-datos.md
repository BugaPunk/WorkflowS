# Correcciones de Inconsistencias en Modelos de Datos

Este documento detalla las correcciones realizadas para abordar las inconsistencias en los modelos de datos del proyecto WorkflowS.

## 1. Estandarización del Modelo UserStory

### Problema Identificado
El modelo `UserStory` utilizaba interfaces TypeScript simples sin validación Zod, mientras que otros modelos como `User`, `Project` y `Sprint` utilizaban esquemas Zod para validación.

### Solución Implementada
Se ha actualizado el modelo `UserStory` para utilizar esquemas Zod para validación, siguiendo el mismo patrón que los otros modelos del proyecto:

1. Se crearon esquemas Zod para validación:
   - `UserStorySchema`: Esquema principal para validar historias de usuario
   - `CreateUserStorySchema`: Esquema para validar datos al crear historias de usuario
   - `UpdateUserStorySchema`: Esquema para validar datos al actualizar historias de usuario

2. Se definieron tipos TypeScript basados en los esquemas Zod:
   - `UserStoryData`: Tipo para los datos de una historia de usuario
   - `CreateUserStoryData`: Tipo para los datos al crear una historia de usuario
   - `UpdateUserStoryData`: Tipo para los datos al actualizar una historia de usuario

3. Se actualizó la interfaz `UserStory` para extender `Model` y `UserStoryData`, siguiendo el patrón de otros modelos.

### Beneficios
- Validación consistente de datos en todos los modelos
- Mejor detección de errores en tiempo de compilación
- Código más mantenible y predecible

## 2. Estandarización de Funciones CRUD

### Problema Identificado
Las funciones para operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en historias de usuario no seguían el mismo patrón que las de otros modelos.

### Solución Implementada
Se han actualizado las funciones CRUD para historias de usuario:

1. `createUserStory`: Nueva función que utiliza `createModel` para crear historias de usuario con un formato consistente
2. `getUserStoryById`: Actualizada para usar la colección constante `USER_STORY_COLLECTIONS`
3. `getProjectUserStories`: Nueva función para obtener todas las historias de usuario de un proyecto
4. `updateUserStory`: Nueva función para actualizar historias de usuario
5. `deleteUserStory`: Nueva función para eliminar historias de usuario

### Beneficios
- Operaciones CRUD consistentes en todos los modelos
- Mejor manejo de errores
- Código más mantenible y predecible

## 3. Actualización de Endpoints de API

### Problema Identificado
Los endpoints de API para historias de usuario no utilizaban los nuevos esquemas Zod para validación.

### Solución Implementada
Se han actualizado los endpoints de API para historias de usuario:

1. `/api/user-stories`:
   - Método GET: Actualizado para usar la función `getProjectUserStories`
   - Método POST: Actualizado para usar el esquema `CreateUserStorySchema` para validación y la función `createUserStory`

2. `/api/user-stories/[id]`:
   - Se mantuvieron las funciones existentes ya que funcionaban correctamente con el nuevo modelo

### Beneficios
- Validación consistente de datos en todos los endpoints
- Mejor manejo de errores
- Código más mantenible y predecible

## 4. Creación de Servicio para Historias de Usuario

### Problema Identificado
No existía un servicio para interactuar con la API de historias de usuario desde el cliente, similar a los otros servicios del proyecto.

### Solución Implementada
Se ha creado un servicio para historias de usuario (`services/userStoryService.ts`) con las siguientes funciones:

1. `getUserStoryById`: Obtiene una historia de usuario por su ID
2. `getUserStories`: Obtiene todas las historias de usuario según los filtros proporcionados
3. `createUserStory`: Crea una nueva historia de usuario
4. `updateUserStory`: Actualiza una historia de usuario existente
5. `deleteUserStory`: Elimina una historia de usuario
6. `assignUserStoryToSprint`: Asigna una historia de usuario a un sprint
7. `removeUserStoryFromSprint`: Elimina una historia de usuario de un sprint

### Beneficios
- Interacción consistente con la API desde el cliente
- Mejor manejo de errores
- Código más mantenible y predecible

## Conclusión

Estas correcciones han estandarizado la definición y validación de modelos en el proyecto WorkflowS, siguiendo las mejores prácticas de TypeScript y Zod. Ahora todos los modelos utilizan esquemas Zod para validación, lo que mejora la seguridad de tipos y la detección de errores en tiempo de compilación.

Además, se han estandarizado las funciones CRUD y los endpoints de API, lo que hace que el código sea más mantenible y predecible. Estas mejoras facilitarán el desarrollo futuro del proyecto y reducirán la probabilidad de errores.
