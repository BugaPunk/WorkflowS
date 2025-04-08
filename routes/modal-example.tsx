import { MainLayout } from "../layouts/MainLayout.tsx";
import ModalExample from "../islands/ModalExample.tsx";

export default function ModalExamplePage() {
  return (
    <MainLayout title="Ejemplo de Modal - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <h1 class="text-3xl font-bold mb-6">Ejemplo de Modal</h1>
          
          <div class="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Componente Modal en Preact/Fresh</h2>
            <p class="mb-4">
              Este es un ejemplo de cómo usar el componente Modal adaptado de Jetstream/Vue a Preact/Fresh.
              El modal incluye animaciones de entrada y salida, cierre con la tecla Escape, y diferentes tamaños.
            </p>
            
            <div class="mt-6">
              <ModalExample />
            </div>
          </div>
          
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Cómo usar el componente Modal</h2>
            <p class="mb-4">
              Para usar el componente Modal en tu proyecto, sigue estos pasos:
            </p>
            
            <div class="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre class="text-sm">
{`import { useState } from "preact/hooks";
import Modal from "../islands/Modal.tsx";

export default function TuComponente() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Abrir Modal
      </button>
      
      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="lg"
      >
        <div class="p-6">
          {/* Contenido del modal */}
          <h2>Título del Modal</h2>
          <p>Contenido del modal...</p>
          <button onClick={() => setShowModal(false)}>
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}`}
              </pre>
            </div>
            
            <h3 class="text-lg font-semibold mt-6 mb-2">Propiedades del Modal</h3>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>show</strong>: Booleano que controla si el modal está visible.</li>
              <li><strong>onClose</strong>: Función que se llama cuando se cierra el modal.</li>
              <li><strong>maxWidth</strong>: Tamaño máximo del modal (sm, md, lg, xl, 2xl).</li>
              <li><strong>closeable</strong>: Booleano que indica si el modal se puede cerrar haciendo clic fuera o con Escape.</li>
              <li><strong>children</strong>: Contenido del modal.</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
