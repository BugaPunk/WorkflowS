import { useState } from "preact/hooks";
import { Project } from "../models/project.ts";

export function useProjectActions(loadProjects: () => Promise<void>) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Función para manejar la creación exitosa de un proyecto
  const handleProjectCreated = () => {
    loadProjects();
    setShowCreateModal(false);
  };

  // Función para manejar la asignación exitosa de un proyecto
  const handleProjectAssigned = () => {
    loadProjects();
    setShowAssignModal(false);
    setSelectedProject(null);
  };

  // Función para manejar la edición exitosa de un proyecto
  const handleProjectEdited = () => {
    loadProjects();
    setShowEditModal(false);
    setSelectedProject(null);
  };

  // Función para abrir el modal de edición
  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  // Función para abrir el modal de asignación
  const openAssignModal = (project: Project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteConfirmModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteConfirmModal(true);
    setDeleteError(null);
  };

  // Función para eliminar un proyecto
  const deleteSelectedProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al eliminar el proyecto");
        } catch (_e) {
          throw new Error(`Error al eliminar el proyecto: ${response.statusText}`);
        }
      }

      // Actualizar la lista de proyectos
      loadProjects();
      setShowDeleteConfirmModal(false);
      setSelectedProject(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedProject,
    showCreateModal,
    showEditModal,
    showAssignModal,
    showDeleteConfirmModal,
    isDeleting,
    deleteError,
    setShowCreateModal,
    handleProjectCreated,
    handleProjectAssigned,
    handleProjectEdited,
    openEditModal,
    openAssignModal,
    openDeleteConfirmModal,
    deleteSelectedProject,
    setShowDeleteConfirmModal,
  };
}
