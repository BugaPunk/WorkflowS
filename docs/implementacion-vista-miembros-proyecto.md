# Implementación de la Vista de Miembros del Proyecto

Este documento detalla la implementación de la vista de miembros del proyecto en la plataforma WorkflowS.

## 1. Descripción General

La vista de miembros del proyecto permite a los usuarios ver todos los miembros asignados a un proyecto específico, incluyendo sus roles y fechas de asignación. Los administradores también tienen la capacidad de eliminar miembros del proyecto.

## 2. Componentes Implementados

### 2.1. Ruta del Servidor (`routes/projects/[id]/members.tsx`)

Esta ruta maneja las solicitudes GET para mostrar la página de miembros del proyecto. Sus principales funcionalidades son:

- Verificar si el usuario está autenticado
- Obtener el proyecto por su ID
- Verificar si el usuario tiene permisos para ver los miembros del proyecto
- Obtener información completa de los miembros del proyecto
- Renderizar la página con la lista de miembros

```typescript
export const handler: Handlers<ProjectMembersPageData | null> = {
  async GET(req, ctx) {
    const session = await getSession(req);
    if (!session) {
      return new Response("", {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    const { id } = ctx.params;
    const project = await getProjectById(id);

    if (!project) {
      return ctx.render(null);
    }

    // Verificar si el usuario actual es miembro del proyecto
    const isMember = project.members.some(member => member.userId === session.userId);

    // Verificar si el usuario actual es Product Owner o Scrum Master del proyecto
    const isProductOwner = project.members.some(
      member => member.userId === session.userId && member.role === ProjectRole.PRODUCT_OWNER
    );
    const isScrumMaster = project.members.some(
      member => member.userId === session.userId && member.role === ProjectRole.SCRUM_MASTER
    );

    // Verificar si el usuario es admin
    const isAdmin = session.role === UserRole.ADMIN;

    // Verificar si el usuario tiene permisos para ver el proyecto
    const hasPermission = isAdmin || isMember;

    if (!hasPermission) {
      return new Response("", {
        status: 302,
        headers: { Location: "/projects" },
      });
    }

    // Obtener información completa de los miembros
    for (const member of project.members) {
      if (!member.username || !member.email) {
        const user = await getUserById(member.userId);
        if (user) {
          member.username = user.username;
          member.email = user.email;
        }
      }
    }

    return ctx.render({
      project,
      isAdmin,
      isProductOwner,
      isScrumMaster,
    });
  },
};
```

### 2.2. Componente Island (`islands/Projects/ProjectMembersList.tsx`)

Este componente island maneja la visualización y gestión de la lista de miembros del proyecto. Sus principales funcionalidades son:

- Mostrar la lista de miembros con sus roles y fechas de asignación
- Permitir la búsqueda de miembros
- Permitir a los administradores eliminar miembros del proyecto

```typescript
export default function ProjectMembersList({
  members: initialMembers,
  projectId: _projectId,
  isAdmin,
}: ProjectMembersListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [_isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar miembros por búsqueda
  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      member.username?.toLowerCase().includes(query) || 
      member.email?.toLowerCase().includes(query)
    );
  });

  // ... Resto del componente ...
}
```

### 2.3. API para Eliminar Miembros (`routes/api/projects/members/[id].ts`)

Esta API maneja las solicitudes DELETE para eliminar miembros del proyecto. Sus principales funcionalidades son:

- Verificar si el usuario está autenticado y tiene permisos de administrador
- Eliminar el miembro del proyecto de la base de datos
- Eliminar los índices relacionados
- Actualizar la lista de miembros del proyecto

```typescript
export const handler = async (req: Request, ctx: FreshContext): Promise<Response> => {
  // Verificar si el usuario está autenticado
  const session = await getSession(req);

  if (!session) {
    return errorResponse("No autenticado", Status.Unauthorized);
  }

  // Solo los administradores pueden eliminar miembros de proyectos
  if (session.role !== UserRole.ADMIN) {
    return errorResponse("No autorizado", Status.Forbidden);
  }

  const { id } = ctx.params; // ID del miembro del proyecto

  // Manejar solicitudes DELETE (eliminar miembro del proyecto)
  if (req.method === "DELETE") {
    try {
      // Obtener la instancia de KV
      const kv = getKv();

      // Obtener el miembro del proyecto
      const memberKey = [...PROJECT_COLLECTIONS.PROJECT_MEMBERS, id];
      const memberResult = await kv.get(memberKey);
      
      if (!memberResult.value) {
        return errorResponse("Miembro no encontrado", Status.NotFound);
      }

      const member = memberResult.value as {
        userId: string;
        projectId: string;
      };

      // Eliminar el miembro del proyecto
      await kv.delete(memberKey);

      // Eliminar los índices
      await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_user", member.userId, member.projectId]);
      await kv.delete([...PROJECT_COLLECTIONS.PROJECT_MEMBERS, "by_project", member.projectId, member.userId]);

      // Actualizar la lista de miembros del proyecto
      const project = await getProjectById(member.projectId);
      if (project) {
        const updatedProject = {
          ...project,
          members: project.members.filter(m => m.id !== id),
        };

        const projectKey = [...PROJECT_COLLECTIONS.PROJECTS, project.id];
        await kv.set(projectKey, updatedProject);
      }

      return successResponse({}, "Miembro eliminado exitosamente del proyecto");
    } catch (error) {
      console.error("Error al eliminar miembro del proyecto:", error);
      return handleApiError(error);
    }
  }

  // Método no permitido
  return errorResponse("Método no permitido", Status.MethodNotAllowed);
};
```

## 3. Flujo de Trabajo

1. El usuario navega a la página de detalles del proyecto y hace clic en "Ver Miembros"
2. El servidor verifica si el usuario tiene permisos para ver los miembros del proyecto
3. Si tiene permisos, el servidor obtiene la información de los miembros y renderiza la página
4. El componente island `ProjectMembersList` muestra la lista de miembros
5. El usuario puede buscar miembros utilizando el campo de búsqueda
6. Si el usuario es administrador, puede eliminar miembros del proyecto haciendo clic en el botón "Eliminar"
7. Al eliminar un miembro, el componente island envía una solicitud DELETE a la API
8. La API elimina el miembro del proyecto y actualiza la lista de miembros
9. El componente island actualiza la interfaz de usuario para reflejar los cambios

## 4. Consideraciones de Seguridad

- Solo los usuarios autenticados pueden ver los miembros del proyecto
- Solo los miembros del proyecto y los administradores pueden ver los miembros del proyecto
- Solo los administradores pueden eliminar miembros del proyecto
- Se verifican los permisos tanto en el cliente como en el servidor

## 5. Mejoras Futuras

- Implementar la funcionalidad para añadir nuevos miembros al proyecto
- Permitir cambiar el rol de los miembros del proyecto
- Añadir filtros adicionales (por rol, fecha de asignación, etc.)
- Implementar paginación para proyectos con muchos miembros
- Añadir estadísticas sobre la participación de los miembros en el proyecto
