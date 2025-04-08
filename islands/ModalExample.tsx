import { useState } from "preact/hooks";
import Modal from "./Modal.tsx";
import { Button } from "../components/Button.tsx";

export default function ModalExample() {
  const [showModal, setShowModal] = useState(false);
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  
  return (
    <div>
      <Button onClick={openModal} class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Abrir Modal
      </Button>
      
      <Modal show={showModal} onClose={closeModal}>
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900">
            Título del Modal
          </h2>
          
          <div class="mt-4 text-sm text-gray-600">
            <p>Este es un ejemplo de un modal en Preact/Fresh adaptado del componente de Jetstream.</p>
            <p class="mt-2">Puedes personalizar este contenido según tus necesidades.</p>
          </div>
          
          <div class="mt-6 flex justify-end">
            <Button
              onClick={closeModal}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={closeModal}
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Aceptar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
