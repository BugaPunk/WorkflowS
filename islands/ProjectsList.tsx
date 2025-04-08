import { useState, useEffect } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Modal from "./Modal.tsx";
import { Project, ProjectStatus } from "../models/project.ts";
import CreateProjectForm from "./CreateProjectForm.tsx";
import EditProjectForm from "./EditProjectForm.tsx";
import AssignProjectForm from "./AssignProjectForm.tsx";

interface ProjectsListProps {
  initialProjects: Project[];
  isAdmin: boolean;
  currentUserId: string;
}

export default function ProjectsList({ initialProjects, isAdmin, currentUserId }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Función para cargar los proyectos desde el servidor
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Error al cargar los proyectos");
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError("Error al cargar los proyectos. Por favor, intenta de nuevo.");
      console.error("Error cargando proyectos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

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

  // Función para abrir el modal de asignación
  const openAssignModal = (project: Project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  // Función para abrir el modal de edición
  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteConfirmModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteConfirmModal(true);
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

  // Obtener el nombre de visualización del estado del proyecto
  const getStatusDisplay = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "Planificación";
      case ProjectStatus.IN_PROGRESS:
        return "En Progreso";
      case ProjectStatus.ON_HOLD:
        return "En Pausa";
      case ProjectStatus.COMPLETED:
        return "Completado";
      case ProjectStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  // Obtener la clase de color para el estado del proyecto
  const getStatusColorClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "bg-blue-100 text-blue-800";
      case ProjectStatus.IN_PROGRESS:
        return "bg-green-100 text-green-800";
      case ProjectStatus.ON_HOLD:
        return "bg-yellow-100 text-yellow-800";
      case ProjectStatus.COMPLETED:
        return "bg-purple-100 text-purple-800";
      case ProjectStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No definida";

    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Proyectos</h1>
        <div class="flex space-x-2">
          {isAdmin && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Crear Proyecto
            </Button>
          )}
          <a
            href="/welcome"
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">
            Proyectos ({projects.length})
          </h2>
          {isLoading && (
            <div class="flex items-center text-blue-600">
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <div class="p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-xl font-medium">No hay proyectos disponibles</p>
            {isAdmin ? (
              <p class="mt-2">Crea un nuevo proyecto para comenzar</p>
            ) : (
              <p class="mt-2">No tienes proyectos asignados</p>
            )}
          </div>
        ) : (
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  {/* Cabecera de la tarjeta */}
                  <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div class="flex justify-between items-start">
                      <h3 class="text-lg font-semibold text-gray-800 truncate">{project.name}</h3>
                      <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(project.status)}`}>
                        {getStatusDisplay(project.status)}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div class="p-4">
                    <div class="mb-4">
                      <p class="text-sm text-gray-600 line-clamp-2">
                        {project.description || "Sin descripción"}
                      </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p class="text-xs text-gray-500 font-medium">FECHA DE INICIO</p>
                        <p class="text-sm text-gray-700">{formatDate(project.startDate)}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 font-medium">MIEMBROS</p>
                        <p class="text-sm text-gray-700">{project.members.length} miembros</p>
                      </div>
                    </div>

                    {/* Fecha de finalización si existe */}
                    {project.endDate && (
                      <div class="mb-4">
                        <p class="text-xs text-gray-500 font-medium">FECHA DE FINALIZACIÓN</p>
                        <p class="text-sm text-gray-700">{formatDate(project.endDate)}</p>
                      </div>
                    )}
                  </div>

                  {/* Pie de la tarjeta con acciones */}
                  <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <a
                      href={`/projects/${project.id}`}
                      class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalles
                    </a>

                    {isAdmin && (
                      <div class="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => openAssignModal(project)}
                          class="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                          title="Asignar usuarios"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          class="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-800"
                          title="Editar proyecto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirmModal(project)}
                          class="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                          title="Eliminar proyecto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear proyecto */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Crear Nuevo Proyecto
          </h2>
          <CreateProjectForm
            onSuccess={handleProjectCreated}
            onCancel={() => setShowCreateModal(false)}
            currentUserId={currentUserId}
          />
        </div>
      </Modal>

      {/* Modal para asignar proyecto */}
      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        maxWidth="md"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Asignar Usuarios al Proyecto
          </h2>
          {selectedProject && (
            <AssignProjectForm
              project={selectedProject}
              onSuccess={handleProjectAssigned}
              onCancel={() => setShowAssignModal(false)}
            />
          )}
        </div>
      </Modal>

      {/* Modal para editar proyecto */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Editar Proyecto
          </h2>
          {selectedProject && (
            <EditProjectForm
              project={selectedProject}
              onSuccess={handleProjectEdited}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </div>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        show={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        maxWidth="sm"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Confirmar Eliminación
          </h2>
          <p class="mb-4 text-gray-600">
            ¿Estás seguro de que deseas eliminar el proyecto "{selectedProject?.name}"? Esta acción no se puede deshacer.
          </p>

          {deleteError && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{deleteError}</p>
            </div>
          )}

          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              onClick={() => setShowDeleteConfirmModal(false)}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={deleteSelectedProject}
              disabled={isDeleting}
              class={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
