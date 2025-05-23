import type { Rubric } from "../../models/rubric.ts";
import type { UserRole } from "../../models/user.ts";
import RubricForm from "./RubricForm.tsx";

interface RubricCreatePageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projectId?: string;
  isTemplate?: boolean;
}

export default function RubricCreatePage({
  session,
  projectId,
  isTemplate,
}: RubricCreatePageProps) {
  // Manejar la finalización de la creación
  const handleSave = (rubric: Rubric) => {
    // Redirigir a la página de detalles
    window.location.href = `/rubrics/${rubric.id}`;
  };

  // Manejar la cancelación
  const handleCancel = () => {
    // Redirigir a la lista de rúbricas
    window.location.href = "/rubrics";
  };

  return (
    <RubricForm
      projectId={projectId}
      isTemplate={isTemplate}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
