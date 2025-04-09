import { useForm } from "../hooks/useForm.ts";
import { Project } from "../models/project.ts";
import { CreateUserStoryData, UserStoryPriority } from "../models/userStory.ts";
import FormField from "../components/form/FormField.tsx";
import FormSelect from "../components/form/FormSelect.tsx";
import FormTextarea from "../components/form/FormTextarea.tsx";
import FormError from "../components/form/FormError.tsx";
import FormActions from "../components/form/FormActions.tsx";

interface CreateUserStoryFormProps {
  projectId?: string;
  projects: Project[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateUserStoryForm({
  projectId,
  projects,
  onSuccess,
  onCancel,
}: CreateUserStoryFormProps) {
  const initialValues: CreateUserStoryData = {
    title: "",
    description: "",
    acceptanceCriteria: "",
    priority: UserStoryPriority.MEDIUM,
    projectId: projectId || "",
  };

  const validate = (values: CreateUserStoryData) => {
    const errors: Record<string, string> = {};

    if (!values.title.trim()) {
      errors.title = "El título es obligatorio";
    }

    if (!values.description.trim()) {
      errors.description = "La descripción es obligatoria";
    }

    if (!values.acceptanceCriteria.trim()) {
      errors.acceptanceCriteria = "Los criterios de aceptación son obligatorios";
    }

    if (!values.projectId) {
      errors.projectId = "Debes seleccionar un proyecto";
    }

    if (values.points !== undefined && (isNaN(values.points) || values.points < 0)) {
      errors.points = "Los puntos deben ser un número positivo";
    }

    return errors;
  };

  const handleSubmit = async (values: CreateUserStoryData) => {
    const response = await fetch("/api/user-stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al crear la historia de usuario");
    }

    onSuccess();
  };

  const {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit: onSubmit,
  } = useForm({
    initialValues,
    validate,
    onSubmit: handleSubmit,
  });

  const priorityOptions = [
    { value: UserStoryPriority.LOW, label: "Baja" },
    { value: UserStoryPriority.MEDIUM, label: "Media" },
    { value: UserStoryPriority.HIGH, label: "Alta" },
    { value: UserStoryPriority.CRITICAL, label: "Crítica" },
  ];

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  return (
    <form onSubmit={onSubmit}>
      <FormError error={submitError} />

      <FormField
        id="title"
        name="title"
        label="Título"
        value={values.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Como [usuario], quiero [acción] para [beneficio]"
      />

      <FormTextarea
        id="description"
        name="description"
        label="Descripción"
        value={values.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Describe la funcionalidad desde la perspectiva del usuario"
        rows={4}
      />

      <FormTextarea
        id="acceptanceCriteria"
        name="acceptanceCriteria"
        label="Criterios de Aceptación"
        value={values.acceptanceCriteria}
        onChange={handleChange}
        error={errors.acceptanceCriteria}
        required
        placeholder="Lista los criterios que deben cumplirse para considerar la historia como completada"
        rows={4}
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          id="priority"
          name="priority"
          label="Prioridad"
          value={values.priority}
          onChange={handleChange}
          options={priorityOptions}
          required
        />

        <FormField
          id="points"
          name="points"
          label="Puntos de Historia"
          type="number"
          value={values.points?.toString() || ""}
          onChange={handleChange}
          error={errors.points}
          placeholder="Estimación de complejidad (opcional)"
          min="0"
        />
      </div>

      {!projectId && (
        <FormSelect
          id="projectId"
          name="projectId"
          label="Proyecto"
          value={values.projectId}
          onChange={handleChange}
          options={projectOptions}
          error={errors.projectId}
          required
        />
      )}

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitText="Crear Historia de Usuario"
        submittingText="Creando..."
      />
    </form>
  );
}
