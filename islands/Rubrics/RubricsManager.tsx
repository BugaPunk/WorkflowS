import { useState } from "preact/hooks";
import { Rubric } from "../../models/rubric.ts";
import { UserRole } from "../../models/user.ts";
import RubricsList from "./RubricsList.tsx";
import RubricDetails from "./RubricDetails.tsx";
import DeleteRubricModal from "./DeleteRubricModal.tsx";
import DuplicateRubricForm from "./DuplicateRubricForm.tsx";

interface RubricsManagerProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projectId?: string;
}

export default function RubricsManager({ session, projectId }: RubricsManagerProps) {
  const [view, setView] = useState<"list" | "details" | "duplicate" | "delete">("list");
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Determinar si el usuario puede editar rúbricas
  const canEditRubrics = session.role === UserRole.ADMIN || 
                         session.role === UserRole.PRODUCT_OWNER || 
                         session.role === UserRole.SCRUM_MASTER;

  // Manejar la selección de una rúbrica
  const handleSelectRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("details");
  };

  // Manejar la creación de una nueva rúbrica
  const handleCreateRubric = () => {
    window.location.href = `/rubrics/create${projectId ? `?projectId=${projectId}` : ''}${showTemplates ? '&template=true' : ''}`;
  };

  // Manejar la edición de una rúbrica
  const handleEditRubric = (rubric: Rubric) => {
    window.location.href = `/rubrics/${rubric.id}/edit`;
  };

  // Manejar la duplicación de una rúbrica
  const handleDuplicateRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("duplicate");
  };

  // Manejar la eliminación de una rúbrica
  const handleDeleteRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("delete");
  };

  // Manejar la finalización de la duplicación
  const handleDuplicateComplete = (newRubric: Rubric) => {
    // Redirigir a la página de detalles de la nueva rúbrica
    window.location.href = `/rubrics/${newRubric.id}`;
  };

  // Manejar la finalización de la eliminación
  const handleDeleteComplete = () => {
    setView("list");
    setSelectedRubric(null);
    // Recargar la página para actualizar la lista
    window.location.reload();
  };

  // Renderizar la vista actual
  const renderView = () => {
    switch (view) {
      case "details":
        if (!selectedRubric) return null;
        return (
          <RubricDetails 
            rubricId={selectedRubric.id} 
            onEdit={() => handleEditRubric(selectedRubric)}
            onBack={() => setView("list")}
          />
        );
      
      case "duplicate":
        if (!selectedRubric) return null;
        return (
          <DuplicateRubricForm 
            rubric={selectedRubric}
            projectId={projectId}
            onDuplicate={handleDuplicateComplete}
            onCancel={() => setView("list")}
          />
        );
      
      case "delete":
        if (!selectedRubric) return null;
        return (
          <DeleteRubricModal 
            rubric={selectedRubric}
            onDelete={handleDeleteComplete}
            onCancel={() => setView("list")}
          />
        );
      
      case "list":
      default:
        return (
          <div>
            <div class="mb-6">
              <div class="flex items-center space-x-4">
                <button
                  onClick={() => setShowTemplates(false)}
                  class={`px-4 py-2 rounded-md ${!showTemplates ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Mis Rúbricas
                </button>
                <button
                  onClick={() => setShowTemplates(true)}
                  class={`px-4 py-2 rounded-md ${showTemplates ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Plantillas
                </button>
              </div>
            </div>
            
            <RubricsList 
              projectId={projectId}
              templatesOnly={showTemplates}
              onSelectRubric={handleSelectRubric}
              onCreateRubric={canEditRubrics ? handleCreateRubric : undefined}
              onEditRubric={canEditRubrics ? handleEditRubric : undefined}
              onDeleteRubric={canEditRubrics ? handleDeleteRubric : undefined}
              onDuplicateRubric={canEditRubrics ? handleDuplicateRubric : undefined}
            />
          </div>
        );
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
}
