# Storybook para WorkflowS

Este proyecto utiliza Storybook para generar mockups mediante código. Storybook es una herramienta que permite desarrollar, documentar y probar componentes de UI de forma aislada.

## Opciones para visualizar mockups

### Opción 1: Storybook con Deno

Para iniciar Storybook con Deno, ejecuta:

```bash
deno run -A storybook.ts
```

Para construir una versión estática de Storybook:

```bash
deno run -A storybook.ts build
```

Esto abrirá Storybook en tu navegador en la dirección http://localhost:6006.

### Opción 2: Servidor de mockups simple

Si tienes problemas con Storybook, puedes usar nuestro servidor de mockups simple:

```bash
deno run -A mockups.ts
```

Esto iniciará un servidor en http://localhost:8000/mockups/index.html que muestra los mockups de los componentes.

## Estructura de archivos

Los archivos de Storybook están organizados de la siguiente manera:

- `.storybook/`: Configuración de Storybook
  - `main.ts`: Configuración principal
  - `preview.ts`: Configuración de la vista previa
- `stories/`: Historias de los componentes
  - `Evaluations/`: Historias relacionadas con evaluaciones
    - `EvaluationCard.stories.tsx`: Mockups para tarjetas de evaluación
    - `EvaluationForm.stories.tsx`: Mockups para formularios de evaluación
    - `EvaluationView.stories.tsx`: Mockups para vistas de evaluación
    - `EvaluationStats.stories.tsx`: Mockups para estadísticas de evaluación
    - `TaskEvaluation.stories.tsx`: Mockups para evaluaciones en tareas

## Creación de nuevos mockups

Para crear un nuevo mockup, sigue estos pasos:

1. Crea un archivo `.stories.tsx` en el directorio correspondiente
2. Define los metadatos y las historias para el componente
3. Ejecuta Storybook para ver el resultado

Ejemplo:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import MiComponente from '../../islands/MiComponente';

const meta: Meta<typeof MiComponente> = {
  title: 'Categoria/MiComponente',
  component: MiComponente,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MiComponente>;

export const Default: Story = {
  args: {
    // Propiedades del componente
  },
};
```

## Exportación de mockups

Puedes exportar los mockups como imágenes o como una aplicación web estática:

- Para exportar como imágenes, usa la herramienta de captura de pantalla de tu navegador
- Para exportar como una aplicación web estática, ejecuta `npm run build-storybook`

## Beneficios de usar Storybook para mockups

- **Código real**: Los mockups utilizan los componentes reales de la aplicación
- **Interactividad**: Los mockups son interactivos, permitiendo probar diferentes estados
- **Documentación**: Storybook genera automáticamente documentación para los componentes
- **Pruebas**: Puedes realizar pruebas de accesibilidad y visuales directamente en Storybook
- **Colaboración**: Los mockups pueden ser compartidos con el equipo y los stakeholders
