# Correcciones de Problemas de Seguridad

Este documento detalla las correcciones realizadas para abordar los problemas de seguridad del proyecto WorkflowS.

## 1. Centralización de la Verificación de Permisos

### Problema Identificado
Diferentes enfoques para verificar permisos en diferentes partes de la aplicación. Esto podía resultar en posibles brechas de seguridad donde los usuarios podían acceder a funcionalidades para las que no tenían permisos.

### Solución Implementada
Se ha creado un servicio centralizado para la verificación de permisos:

1. **Creación del Servicio**: Se ha creado un nuevo archivo `utils/permissions.ts` que implementa funciones para verificar diferentes tipos de permisos:
   ```typescript
   import { UserRole } from "../models/user.ts";
   import { ProjectRole } from "../models/project.ts";
   import type { Session } from "./session.ts";

   /**
    * Verifica si un usuario tiene un rol específico
    * @param session Sesión del usuario
    * @param roles Roles permitidos
    * @returns true si el usuario tiene alguno de los roles especificados
    */
   export function hasRole(session: Session, roles: UserRole | UserRole[]): boolean {
     const allowedRoles = Array.isArray(roles) ? roles : [roles];
     return allowedRoles.includes(session.role);
   }

   /**
    * Verifica si un usuario es administrador
    * @param session Sesión del usuario
    * @returns true si el usuario es administrador
    */
   export function isAdmin(session: Session): boolean {
     return session.role === UserRole.ADMIN;
   }

   // ... otras funciones de verificación de roles ...

   /**
    * Verifica si un usuario puede gestionar proyectos
    * @param session Sesión del usuario
    * @returns true si el usuario puede gestionar proyectos
    */
   export function canManageProjects(session: Session): boolean {
     return isAdmin(session);
   }

   // ... otras funciones de verificación de permisos ...

   /**
    * Verifica si un usuario puede actualizar una tarea específica
    * @param session Sesión del usuario
    * @param task Tarea a actualizar
    * @returns true si el usuario puede actualizar la tarea
    */
   export function canUpdateTask(session: Session, task: { assignedTo?: string; createdBy: string }): boolean {
     const isAssignedToUser = task.assignedTo === session.userId;
     const isCreator = task.createdBy === session.userId;
     
     return isAdmin(session) || isScrumMaster(session) || isAssignedToUser || isCreator;
   }

   // ... otras funciones específicas de verificación de permisos ...
   ```

2. **Actualización de Rutas de API**: Se han actualizado las rutas de API para utilizar el nuevo servicio:
   ```typescript
   // Antes
   const isAdmin = session.role === UserRole.ADMIN;
   const isScrumMaster = session.role === UserRole.SCRUM_MASTER;
   const isAssignedToUser = task.assignedTo === session.userId;
   const isCreator = task.createdBy === session.userId;

   if (!isAdmin && !isScrumMaster && !isAssignedToUser && !isCreator) {
     return errorResponse("No tienes permisos para actualizar esta tarea", Status.Forbidden);
   }

   // Después
   if (!canUpdateTask(session, task)) {
     return errorResponse("No tienes permisos para actualizar esta tarea", Status.Forbidden);
   }
   ```

### Beneficios
- Verificación de permisos consistente en toda la aplicación
- Mejor mantenibilidad y legibilidad del código
- Reducción de duplicación de código
- Mejor seguridad al centralizar la lógica de permisos

## 2. Prevención de Exposición de Datos Sensibles

### Problema Identificado
En algunos lugares, se podrían estar exponiendo datos sensibles en respuestas de API o logs. Esto podía resultar en vulnerabilidades de seguridad y privacidad.

### Solución Implementada
Se han implementado medidas para prevenir la exposición de datos sensibles:

1. **Eliminación de Datos Sensibles en Respuestas**: Se ha asegurado que los datos sensibles como contraseñas no se incluyan en las respuestas de API:
   ```typescript
   // Eliminar la contraseña del objeto de usuario antes de devolverlo
   const { passwordHash: _, ...userWithoutPassword } = user;
   
   return successResponse({ user: userWithoutPassword });
   ```

2. **Mejora de la Gestión de Sesiones**: Se ha mejorado la gestión de sesiones para evitar la exposición de datos sensibles:
   ```typescript
   // Almacenar solo la información necesaria en la sesión
   const sessionData = {
     userId: user.id,
     username: user.username,
     email: user.email,
     role: user.role,
     createdAt: new Date().getTime(),
     expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000), // 7 days
   };
   ```

3. **Mejora de la Gestión de Errores**: Se ha mejorado la gestión de errores para evitar la exposición de información sensible:
   ```typescript
   try {
     // ... código que puede generar errores ...
   } catch (error) {
     console.error("Error al procesar la solicitud:", error);
     return errorResponse("Error al procesar la solicitud", Status.BadRequest);
   }
   ```

### Beneficios
- Mejor protección de datos sensibles
- Reducción de vulnerabilidades de seguridad
- Mejor cumplimiento de normativas de privacidad

## Conclusión

Estas correcciones han mejorado la seguridad del proyecto WorkflowS, centralizando la verificación de permisos y previniendo la exposición de datos sensibles. Esto resulta en una aplicación más segura y robusta, con menos vulnerabilidades y mejor protección de datos sensibles.
