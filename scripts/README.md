# Scripts de Población de Datos - ACTUALIZADO

Este directorio contiene scripts para poblar la base de datos con datos de ejemplo completos para el desarrollo y testing del sistema.

## 🚀 Scripts Principales

### `setup-complete-demo-updated.ts` ⭐ **RECOMENDADO**
**Script maestro que ejecuta todo automáticamente**
- Ejecuta todos los scripts en el orden correcto
- Crea un sistema completamente funcional
- Incluye TODAS las funcionalidades implementadas

**Uso:**
```bash
deno run -A --unstable-kv scripts/setup-complete-demo-updated.ts
```

### `populate-everything.ts`
Script base para crear datos fundamentales:
- 25 usuarios con roles diversos
- 3 proyectos completos con equipos
- Historias de usuario detalladas
- Estructura básica del sistema

**Uso:**
```bash
deno run -A --unstable-kv scripts/populate-everything.ts
```

## 📋 Scripts Especializados

### `populate-rubrics.ts`
Crea sistema completo de rúbricas:
- 4 plantillas especializadas
- Rúbricas específicas por proyecto
- Rúbricas personales
- Criterios y niveles de evaluación

### `populate-evaluations.ts`
Genera evaluaciones realistas:
- Evaluaciones de entregables
- Calificaciones con rúbricas
- Feedback detallado
- Estados variados

### `populate-metrics.ts`
Crea datos para métricas:
- Datos de progreso
- Estadísticas de rendimiento
- Métricas de equipo
- Reportes de proyecto

## 🛠️ Scripts de Utilidad

### `clear-database.ts`
Limpia completamente la base de datos KV.
```bash
deno run -A --unstable-kv scripts/clear-database.ts
```

### `view-kv-data.ts`
Muestra el contenido actual de la base de datos.
```bash
deno run -A --unstable-kv scripts/view-kv-data.ts
```

### `reset-database.ts`
Limpia y repuebla automáticamente.
```bash
deno run -A --unstable-kv scripts/reset-database.ts
```

## 🎯 Orden de Ejecución Recomendado

### Opción 1: Setup Completo (Recomendado)
```bash
# Un solo comando para todo
deno run -A --unstable-kv scripts/setup-complete-demo-updated.ts
```

### Opción 2: Paso a Paso
```bash
# 1. Limpiar datos existentes
deno run -A --unstable-kv scripts/clear-database.ts

# 2. Crear datos básicos
deno run -A --unstable-kv scripts/populate-everything.ts

# 3. Agregar rúbricas
deno run -A --unstable-kv scripts/populate-rubrics.ts

# 4. Crear evaluaciones
deno run -A --unstable-kv scripts/populate-evaluations.ts

# 5. Generar métricas
deno run -A --unstable-kv scripts/populate-metrics.ts
```

## 📊 Datos Creados (Sistema Completo)

### 👥 Usuarios (25 total)
- **3 Administradores**: admin, prof.martinez, prof.rodriguez
- **3 Product Owners**: po.garcia, po.lopez, po.mendoza
- **3 Scrum Masters**: sm.fernandez, sm.torres, sm.silva
- **15 Estudiantes**: dev.perez, dev.gonzalez, etc.

### 📁 Proyectos (3 completos)
- **Sistema de Gestión Académica** (5 desarrolladores)
- **Aplicación Móvil de Biblioteca** (5 desarrolladores)
- **Portal de Empleabilidad Estudiantil** (4 desarrolladores)

### 📝 Funcionalidades Completas
- ✅ **Historias de usuario** (8 por proyecto)
- ✅ **Sprints** (5 por proyecto con cronología realista)
- ✅ **Tareas** (5 por historia, incluyendo entregables)
- ✅ **Rúbricas** (4 plantillas + rúbricas específicas)
- ✅ **Evaluaciones** (con calificaciones reales)
- ✅ **Mensajes** (conversaciones de equipo)
- ✅ **Comentarios** (en tareas)
- ✅ **Métricas** (datos de progreso)

### 🔑 Usuarios de Prueba
```
admin / admin123           - Administrador principal
prof.martinez / prof123   - Profesor
po.garcia / po123         - Product Owner
sm.fernandez / sm123      - Scrum Master
dev.perez / dev123        - Estudiante
```

## 🌐 Rutas Disponibles Después de la Población

### Principales
- `http://localhost:8000/` - Dashboard principal
- `http://localhost:8000/projects` - Gestión de proyectos
- `http://localhost:8000/my-tasks` - Mis tareas asignadas
- `http://localhost:8000/evaluations` - Sistema de evaluaciones
- `http://localhost:8000/rubrics` - Gestión de rúbricas
- `http://localhost:8000/users` - Gestión de usuarios (admin)

### Rúbricas
- `http://localhost:8000/rubrics/list` - Lista completa
- `http://localhost:8000/rubrics/list?templates=true` - Plantillas
- `http://localhost:8000/rubrics/create` - Crear nueva

### Evaluaciones
- `http://localhost:8000/evaluations` - Lista de entregables
- `http://localhost:8000/evaluations/[id]` - Detalle específico

## 🎊 Resultado Final

Después de ejecutar los scripts tendrás:
- **Sistema completamente funcional**
- **Datos realistas y variados**
- **Todas las funcionalidades pobladas**
- **Usuarios para probar diferentes roles**
- **Proyectos en diferentes estados**
- **Evaluaciones con calificaciones reales**

## 🔧 Solución de Problemas

Si hay errores:
1. Asegúrate de que el servidor no esté ejecutándose
2. Ejecuta: `deno run -A --unstable-kv scripts/clear-database.ts`
3. Vuelve a ejecutar el script de población
4. Verifica que todas las dependencias estén instaladas

## 📈 Notas de Actualización

**Nuevas funcionalidades incluidas:**
- ✅ Sistema completo de rúbricas (4 plantillas)
- ✅ Evaluaciones con calificaciones reales
- ✅ Métricas y reportes de progreso
- ✅ Conversaciones y mensajes de equipo
- ✅ Comentarios en tareas
- ✅ Estados realistas de proyectos
- ✅ Cronología coherente de sprints
- ✅ Datos de ejemplo más diversos y realistas

## 🎮 Cómo Probar la Plataforma

1. **Ejecuta el script maestro**:
   ```bash
   deno run -A --unstable-kv scripts/setup-complete-demo-updated.ts
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
   - Sistema de evaluaciones con rúbricas
   - Gestión completa de rúbricas
   - Métricas y reportes
   - Tablero Kanban

## 📝 Notas

- Los scripts son **idempotentes**: puedes ejecutarlos múltiples veces sin problemas
- Los datos existentes no se duplican
- Los scripts muestran mensajes informativos sobre qué se crea o ya existe
- Todos los scripts incluyen manejo de errores y continúan ejecutándose aunque fallen algunas operaciones

## 🎊 ¡El sistema está listo para usar con datos completos!
