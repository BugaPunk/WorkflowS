import { useState } from "preact/hooks";
import { UserRole } from "../../models/user.ts";
import DeleteRubricModal from "./DeleteRubricModal.tsx";
import RubricDetails from "./RubricDetails.tsx";

interface RubricDetailsPageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  rubricId: string;
}

export default function RubricDetailsPage({ session, rubricId }: RubricDetailsPageProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Determinar si el usuario puede editar rúbricas
  const canEditRubrics =
    session.role === UserRole.ADMIN ||
    session.role === UserRole.PRODUCT_OWNER ||
    session.role === UserRole.SCRUM_MASTER;

  // Manejar la edición de la rúbrica
  const handleEdit = () => {
    window.location.href = `/rubrics/${rubricId}/edit`;
  };

  // Manejar la eliminación de la rúbrica
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Manejar la finalización de la eliminación
  const handleDeleteComplete = () => {
    // Redirigir a la lista de rúbricas
    window.location.href = "/rubrics";
  };

  // Manejar el botón de volver
  const handleBack = () => {
    window.location.href = "/rubrics";
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Detalles de Rúbrica</h1>

        {canEditRubrics && (
          <div class="flex space-x-4">
            <button
              onClick={handleEdit}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      <RubricDetails
        rubricId={rubricId}
        onEdit={canEditRubrics ? handleEdit : undefined}
        onBack={handleBack}
      />

      {showDeleteModal && (
        <DeleteRubricModal
          rubric={{ id: rubricId } as any} // Solo necesitamos el ID para eliminar
          onDelete={handleDeleteComplete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
