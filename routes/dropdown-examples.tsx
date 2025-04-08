import { MainLayout } from "../layouts/MainLayout.tsx";
import DropdownMenuExamples from "../islands/DropdownMenuExamples.tsx";

export default function DropdownExamplesPage() {
  return (
    <MainLayout title="Ejemplos de Menú Desplegable - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          <h1 class="text-3xl font-bold mb-6">Componente de Menú Desplegable</h1>
          
          <div class="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Ejemplos de uso del componente DropdownMenu</h2>
            <p class="mb-6 text-gray-700">
              Este componente de menú desplegable es altamente personalizable y puede ser utilizado en diferentes contextos
              dentro de la aplicación. A continuación se muestran varios ejemplos de cómo implementarlo.
            </p>
            
            <DropdownMenuExamples />
          </div>
          
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Cómo usar el componente DropdownMenu</h2>
            <p class="mb-4 text-gray-700">
              Para usar el componente DropdownMenu en tu proyecto, sigue estos pasos:
            </p>
            
            <div class="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre class="text-sm">
{`import DropdownMenu, { DropdownMenuSection } from "../islands/DropdownMenu.tsx";

// Define las secciones y elementos del menú
const menuSections: DropdownMenuSection[] = [
  {
    items: [
      { label: "Opción 1", href: "#opcion1" },
      { label: "Opción 2", onClick: () => console.log("Opción 2 seleccionada") },
    ],
  },
  {
    items: [
      { 
        label: "Opción peligrosa", 
        isDanger: true, 
        onClick: () => console.log("Acción peligrosa") 
      },
    ],
  },
];

// Usa el componente en tu JSX
<DropdownMenu 
  buttonText="Mi Menú" 
  sections={menuSections} 
  align="right" // o "left"
/>
`}
              </pre>
            </div>
            
            <h3 class="text-lg font-semibold mt-6 mb-2">Propiedades</h3>
            <ul class="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>buttonText</strong>: Texto que se muestra en el botón principal</li>
              <li><strong>sections</strong>: Array de secciones del menú, cada una con sus propios elementos</li>
              <li><strong>buttonIcon</strong> (opcional): Icono personalizado para el botón desplegable</li>
              <li><strong>align</strong> (opcional): Alineación del menú desplegable ("right" o "left", por defecto "right")</li>
              <li><strong>className</strong> (opcional): Clases CSS adicionales para el contenedor principal</li>
            </ul>
            
            <h3 class="text-lg font-semibold mt-6 mb-2">Elementos del menú</h3>
            <ul class="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li><strong>label</strong>: Texto que se muestra en el elemento del menú</li>
              <li><strong>href</strong> (opcional): URL a la que se navegará al hacer clic (convierte el elemento en un enlace)</li>
              <li><strong>onClick</strong> (opcional): Función que se ejecutará al hacer clic</li>
              <li><strong>isDanger</strong> (opcional): Si es true, el elemento se mostrará en color rojo</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
