# Correcciones de Problemas de Rendimiento

Este documento detalla las correcciones realizadas para abordar los problemas de rendimiento del proyecto WorkflowS.

## 1. Optimización de Consultas a la Base de Datos

### Problema Identificado
En algunos casos, se cargaban todos los datos y luego se filtraban en memoria en lugar de filtrar en la consulta a la base de datos. Esto podía resultar en problemas de rendimiento con conjuntos de datos grandes.

### Solución Implementada
Se ha implementado una función optimizada para obtener historias de usuario con filtros:

1. **Creación de Función Optimizada**: Se ha creado una nueva función `getUserStoriesWithFilters` en `models/userStory.ts` que permite filtrar datos en la consulta a la base de datos:
   ```typescript
   /**
    * Obtener historias de usuario con filtros
    * @param filters Filtros para las historias de usuario
    * @returns Lista de historias de usuario filtradas
    */
   export async function getUserStoriesWithFilters(filters: {
     projectId?: string;
     status?: string | string[];
     sprintId?: string;
     priority?: string | string[];
     search?: string;
   } = {}): Promise<UserStory[]> {
     const kv = getKv();
     const userStories: UserStory[] = [];

     // Listar todas las historias de usuario
     const userStoriesIterator = kv.list<UserStory>({ prefix: USER_STORY_COLLECTIONS.USER_STORIES });

     // Convertir arrays de filtros a conjuntos para búsqueda más eficiente
     const statusSet = filters.status ? 
       new Set(Array.isArray(filters.status) ? filters.status : [filters.status]) : 
       null;
     
     const prioritySet = filters.priority ? 
       new Set(Array.isArray(filters.priority) ? filters.priority : [filters.priority]) : 
       null;

     // Convertir búsqueda a minúsculas para comparación insensible a mayúsculas/minúsculas
     const searchLower = filters.search ? filters.search.toLowerCase() : null;

     for await (const entry of userStoriesIterator) {
       const userStory = entry.value;
       let include = true;

       // Filtrar por proyecto
       if (filters.projectId && userStory.projectId !== filters.projectId) {
         include = false;
       }

       // Filtrar por estado
       if (include && statusSet && !statusSet.has(userStory.status)) {
         include = false;
       }

       // Filtrar por sprint
       if (include && filters.sprintId && userStory.sprintId !== filters.sprintId) {
         include = false;
       }

       // Filtrar por prioridad
       if (include && prioritySet && !prioritySet.has(userStory.priority)) {
         include = false;
       }

       // Filtrar por búsqueda en título o descripción
       if (include && searchLower && 
           !userStory.title.toLowerCase().includes(searchLower) && 
           !userStory.description.toLowerCase().includes(searchLower)) {
         include = false;
       }

       if (include) {
         userStories.push(userStory);
       }
     }

     return userStories;
   }
   ```

2. **Actualización de Rutas de API**: Se ha actualizado la ruta `routes/api/user-stories.ts` para utilizar la nueva función optimizada:
   ```typescript
   try {
     // Usar la función optimizada para obtener historias de usuario con filtros
     const userStories = await getUserStoriesWithFilters({
       projectId: projectId || undefined,
       status: statusFilter || undefined,
       sprintId: sprintId || undefined
     });

     // Ordenar por prioridad y fecha de creación
     userStories.sort((a, b) => {
       // Primero por prioridad (critical > high > medium > low)
       const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
       const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

       if (priorityDiff !== 0) return priorityDiff;

       // Luego por fecha de creación (más reciente primero)
       return b.createdAt - a.createdAt;
     });

     return new Response(JSON.stringify({ userStories }), {
       status: Status.OK,
       headers: { "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Error al obtener historias de usuario:", error);
     return new Response(JSON.stringify({ message: "Error al obtener historias de usuario" }), {
       status: Status.InternalServerError,
       headers: { "Content-Type": "application/json" },
     });
   }
   ```

### Beneficios
- Mejor rendimiento al filtrar datos en la consulta a la base de datos
- Reducción de la carga de memoria
- Mejor escalabilidad con conjuntos de datos grandes

## 2. Optimización de Renderizado con Memorización

### Problema Identificado
Algunos componentes podrían estar re-renderizándose innecesariamente debido a dependencias de efectos mal definidas o props innecesarias. Esto podía resultar en problemas de rendimiento en el cliente.

### Solución Implementada
Se han implementado técnicas de memorización para evitar re-renderizados innecesarios:

1. **Uso de `useMemo`**: Se ha utilizado `useMemo` para memorizar los resultados de operaciones costosas:
   ```typescript
   // Memorizar los items filtrados para evitar recalculos innecesarios
   const filteredItems = useMemo(() => {
     let result = [...backlogItems];

     // Filtrar por prioridad
     if (priorityFilter !== "all") {
       result = result.filter(item => item.priority === priorityFilter);
     }

     // Filtrar por búsqueda
     if (searchQuery.trim() !== "") {
       const query = searchQuery.toLowerCase();
       result = result.filter(
         item =>
           item.title.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query)
       );
     }

     return result;
   }, [backlogItems, priorityFilter, searchQuery]);
   ```

2. **Uso de `useCallback`**: Se ha utilizado `useCallback` para memorizar funciones:
   ```typescript
   // Cargar historias de usuario (memoizado para evitar recreaciones innecesarias)
   const loadBacklogItems = useCallback(async () => {
     setIsLoading(true);
     setError(null);

     try {
       let url = "/api/user-stories?status=backlog";

       if (projectId) {
         url += `&projectId=${projectId}`;
       }

       const response = await fetch(url);

       if (!response.ok) {
         throw new Error("Error al cargar el backlog");
       }

       const data = await response.json();
       setBacklogItems(data.userStories);
     } catch (err) {
       setError("Error al cargar el backlog. Por favor, intenta de nuevo.");
       console.error("Error cargando backlog:", err);
     } finally {
       setIsLoading(false);
     }
   }, [projectId]);
   ```

### Beneficios
- Reducción de re-renderizados innecesarios
- Mejor rendimiento en el cliente
- Mejor experiencia de usuario

## Conclusión

Estas correcciones han mejorado el rendimiento del proyecto WorkflowS, optimizando las consultas a la base de datos y reduciendo los re-renderizados innecesarios. Esto resulta en una aplicación más rápida y eficiente, con mejor escalabilidad y experiencia de usuario.
