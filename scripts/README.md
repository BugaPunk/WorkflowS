# Scripts de Población de Datos

Este directorio contiene scripts para poblar tu base de datos Deno KV con datos de ejemplo para probar la plataforma de gestión de proyectos académicos.

## 🚀 Uso Rápido

### Para Sistema COMPLETO (RECOMENDADO):
```bash
deno run --unstable-kv -A scripts/setup-complete-demo.ts
```
**Crea un ejemplo completo con TODAS las funcionalidades**

### Para Sistema Básico:
```bash
deno run --unstable-kv -A scripts/setup-demo-data.ts
```
**Crea solo las funcionalidades principales**

## 📁 Scripts Disponibles

### 1. `setup-complete-demo.ts` (NUEVO - RECOMENDADO)
**Script maestro para sistema COMPLETO con TODAS las funcionalidades**

```bash
deno run --unstable-kv -A scripts/setup-complete-demo.ts
```

**Qué hace:**
- Limpia la base de datos completamente
- Crea 16+ usuarios con roles diversos
- Crea 3 proyectos diferentes con equipos
- Crea 90+ tareas con estados realistas
- Crea métricas y datos para dashboards
- Sistema completo listo para demostración

### 2. `setup-demo-data.ts` (BÁSICO)
**Script maestro para funcionalidades principales**

```bash
deno run --unstable-kv -A scripts/setup-demo-data.ts
```

**Qué hace:**
- Ejecuta scripts básicos en orden correcto
- Crea usuarios, proyectos, tareas y rúbricas
- Muestra un resumen completo al final
- Proporciona credenciales de acceso

### 3. `reset-database.ts` (RESET COMPLETO)
**Limpia la base de datos y opcionalmente la puebla de nuevo**

```bash
deno run --unstable-kv -A scripts/reset-database.ts
```

**Qué hace:**
- Limpia completamente la base de datos
- Pregunta si quieres poblar con datos de ejemplo
- Proceso guiado paso a paso

### 4. `clear-database.ts` (SOLO LIMPIAR)
**Solo limpia la base de datos sin poblar**

```bash
# Con confirmación
deno run --unstable-kv -A scripts/clear-database.ts

# Sin confirmación (forzado)
deno run --unstable-kv -A scripts/clear-database.ts --force
```

**Qué hace:**
- Elimina TODOS los datos de la base de datos
- Muestra estadísticas de lo que se elimina
- Requiere confirmación (excepto con --force)

### 5. `populate-complete-system.ts` (SISTEMA BASE COMPLETO)
**Crea sistema base con datos detallados**

```bash
deno run --unstable-kv -A scripts/populate-complete-system.ts
```

**Qué hace:**
- Crea 16+ usuarios con roles diversos
- Crea 3 proyectos con equipos asignados
- Crea historias de usuario detalladas
- Crea sprints con cronología realista
- Crea 90+ tareas asignadas

### 6. `populate-metrics.ts` (MÉTRICAS Y DATOS ADICIONALES)
**Agrega métricas y datos adicionales para dashboards**

```bash
deno run --unstable-kv -A scripts/populate-metrics.ts
```

**Qué hace:**
- Crea métricas de ejemplo para dashboards
- Crea datos de actividad reciente
- Crea índices de búsqueda
- Crea datos de rendimiento histórico
- Mejora la experiencia del usuario

### 7. `populate-sample-data-simple.ts`
**Crea datos básicos del sistema**

```bash
deno run --unstable-kv -A scripts/populate-sample-data-simple.ts
```

**Qué crea:**
- 👥 **Usuarios**: Admin, profesores, Product Owners, Scrum Masters, estudiantes
- 📁 **Proyecto**: "Sistema de Gestión Académica"
- 📝 **Historias de usuario**: Registro, autenticación, dashboard
- 🏃 **Sprint**: Sprint activo con tareas
- ✅ **Tareas**: Asignadas a diferentes estudiantes

### 8. `populate-rubrics.ts`
**Crea rúbricas de evaluación**

```bash
deno run --unstable-kv -A scripts/populate-rubrics.ts
```

**Qué crea:**
- 📋 **Rúbrica General**: Para evaluar desarrollo de software (100 puntos)
- 📋 **Rúbrica de Presentación**: Para evaluar presentaciones orales (100 puntos)

## 👥 Credenciales de Acceso

Después de ejecutar los scripts, puedes usar estas credenciales:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Admin** | admin@admin.com | admin123 | Usuario administrador principal |
| **Profesor** | martinez@universidad.edu | prof123 | Profesor con permisos de admin |
| **Product Owner** | garcia@universidad.edu | po123 | Gestiona historias de usuario |
| **Scrum Master** | lopez@universidad.edu | sm123 | Gestiona sprints y equipos |
| **Estudiante** | perez@estudiante.edu | dev123 | Desarrollador del equipo |
| **Estudiante** | gonzalez@estudiante.edu | dev123 | Desarrollador del equipo |
| **Estudiante** | sanchez@estudiante.edu | dev123 | Desarrollador del equipo |

## 🎯 Datos Creados

### Usuarios
- **1 Admin principal** (ya existe por defecto)
- **1 Profesor adicional** con permisos de admin
- **1 Product Owner** para gestionar el backlog
- **1 Scrum Master** para gestionar sprints
- **6 Estudiantes** como desarrolladores

### Proyecto: "Sistema de Gestión Académica"
- **Descripción**: Sistema web para gestionar estudiantes, cursos y calificaciones
- **Estado**: Activo
- **Equipo**: Product Owner, Scrum Master, 3 estudiantes asignados
- **Duración**: 3 meses (iniciado hace 1 mes)

### Historias de Usuario
1. **Registro de usuarios** (8 puntos, Alta prioridad)
2. **Autenticación de usuarios** (5 puntos, Alta prioridad)  
3. **Dashboard principal** (13 puntos, Media prioridad)

### Sprint Activo
- **Nombre**: "Sprint 1 - Fundamentos"
- **Objetivo**: Implementar funcionalidades básicas de autenticación y registro
- **Estado**: Activo
- **Duración**: 2 semanas

### Tareas
- **Tareas de diseño**: Completadas
- **Tareas de implementación**: En progreso
- **Asignación**: Distribuidas entre los estudiantes del equipo

### Rúbricas
1. **Rúbrica General de Desarrollo de Software**
   - Funcionalidad (25 pts)
   - Calidad del Código (20 pts)
   - Interfaz de Usuario (20 pts)
   - Pruebas y Validación (15 pts)
   - Documentación (20 pts)

2. **Rúbrica de Presentación de Proyecto**
   - Contenido (30 pts)
   - Claridad de Comunicación (25 pts)
   - Uso del Tiempo (15 pts)
   - Manejo de Preguntas (20 pts)
   - Material Visual (10 pts)

## 🔧 Solución de Problemas

### Error: "Usuario ya existe"
**Normal** - Los scripts detectan usuarios existentes y continúan sin problemas.

### Error: "Permission denied"
Asegúrate de ejecutar con los permisos correctos:
```bash
deno run --unstable-kv -A scripts/setup-demo-data.ts
```

### Error: "Module not found"
Ejecuta desde la raíz del proyecto:
```bash
cd /ruta/a/tu/proyecto
deno run --unstable-kv -A scripts/setup-demo-data.ts
```

### Base de datos vacía después de ejecutar
1. Verifica que Deno KV esté funcionando
2. Revisa los logs del script para errores
3. Intenta ejecutar scripts individuales

## 🎮 Cómo Probar la Plataforma

1. **Ejecuta los scripts**:
   ```bash
   deno run --unstable-kv -A scripts/setup-demo-data.ts
   ```

2. **Inicia el servidor**:
   ```bash
   deno task start
   ```

3. **Accede a la plataforma**:
   - Ve a http://localhost:8000
   - Inicia sesión con cualquier credencial

4. **Explora por rol**:
   - **Admin**: Gestiona usuarios y proyectos
   - **Product Owner**: Crea historias de usuario
   - **Scrum Master**: Gestiona sprints y tareas
   - **Estudiante**: Trabaja en tareas asignadas

5. **Prueba funcionalidades**:
   - Dashboard personalizado
   - Tablero Kanban
   - Sistema de evaluaciones
   - Métricas y reportes

## 📝 Notas

- Los scripts son **idempotentes**: puedes ejecutarlos múltiples veces sin problemas
- Los datos existentes no se duplican
- Los scripts muestran mensajes informativos sobre qué se crea o ya existe
- Todos los scripts incluyen manejo de errores y continúan ejecutándose aunque fallen algunas operaciones
