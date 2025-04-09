import { useState, useEffect } from "preact/hooks";
import { UserStory, UserStoryStatus } from "../models/userStory.ts";
import { UserRole } from "../models/user.ts";
import { Button } from "../components/Button.tsx";
import Modal from "./Modal.tsx";
import UserStoryCard from "./UserStoryCard.tsx";
import CreateUserStoryForm from "./CreateUserStoryForm.tsx";
import EditUserStoryForm from "./EditUserStoryForm.tsx";
import { Project } from "../models/project.ts";

interface UserStoriesListProps {
  initialUserStories: UserStory[];
  projects: Project[];
  userRole: UserRole;
  projectId?: string;
}

export default function UserStoriesList({
  initialUserStories,
  projects,
  userRole,
  projectId,
}: UserStoriesListProps) {
  const [userStories, setUserStories] = useState<UserStory[]>(initialUserStories);
  const [filteredUserStories, setFilteredUserStories] = useState<UserStory[]>(initialUserStories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStoryStatus | "all">("all");

  const isProductOwner = userRole === UserRole.PRODUCT_OWNER || userRole === UserRole.ADMIN;
  const isScrumMaster = userRole === UserRole.SCRUM_MASTER || userRole === UserRole.ADMIN;

  // Función para cargar las historias de usuario desde el servidor
  const loadUserStories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = "/api/user-stories";
      const params = new URLSearchParams();

      if (projectId) {
        params.append("projectId", projectId);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al cargar las historias de usuario");
      }

      const data = await response.json();
      setUserStories(data.userStories);
      setFilteredUserStories(data.userStories);
    } catch (err) {
      setError("Error al cargar las historias de usuario. Por favor, intenta de nuevo.");
      console.error("Error cargando historias de usuario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar historias de usuario al montar el componente o cuando cambia el filtro
  useEffect(() => {
    loadUserStories();
  }, [projectId, statusFilter]);

  // Función para manejar la creación exitosa de una historia de usuario
  const handleUserStoryCreated = () => {
    loadUserStories();
    setShowCreateModal(false);
  };

  // Función para manejar la edición exitosa de una historia de usuario
  const handleUserStoryEdited = () => {
    loadUserStories();
    setShowEditModal(false);
    setSelectedUserStory(null);
  };

  // Función para abrir el modal de edición
  const openEditModal = (userStory: UserStory) => {
    setSelectedUserStory(userStory);
    setShowEditModal(true);
  };

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteConfirmModal = (userStory: UserStory) => {
    setSelectedUserStory(userStory);
    setShowDeleteConfirmModal(true);
    setDeleteError(null);
  };

  // Función para eliminar una historia de usuario
  const deleteSelectedUserStory = async () => {
    if (!selectedUserStory) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/user-stories?id=${selectedUserStory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar la historia de usuario");
        } catch (_e) {
          throw new Error(`Error al eliminar la historia de usuario: ${response.statusText}`);
        }
      }

      // Actualizar la lista de historias de usuario
      loadUserStories();
      setShowDeleteConfirmModal(false);
      setSelectedUserStory(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsDeleting(false);
    }
  };

  // Opciones de filtro de estado
  const statusFilterOptions = [
    { value: "all", label: "Todos los estados" },
    { value: UserStoryStatus.BACKLOG, label: "Backlog" },
    { value: UserStoryStatus.PLANNED, label: "Planificada" },
    { value: UserStoryStatus.IN_PROGRESS, label: "En Progreso" },
    { value: UserStoryStatus.TESTING, label: "En Pruebas" },
    { value: UserStoryStatus.DONE, label: "Completada" },
  ];

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Historias de Usuario</h1>
        <div class="flex space-x-2">
          {isProductOwner && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Crear Historia
            </Button>
          )}
          <a
            href={projectId ? `/projects/${projectId}` : "/projects"}
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Volver a Proyectos
          </a>
        </div>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="mb-4 md:mb-0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value as UserStoryStatus | "all")}
            class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div class="flex items-center">
          {isLoading ? (
            <div class="flex items-center text-blue-600">
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </div>
          ) : (
            <span class="text-gray-600 font-medium">
              {filteredUserStories.length} {filteredUserStories.length === 1 ? "historia" : "historias"} encontradas
            </span>
          )}
        </div>
      </div>

      {userStories.length === 0 ? (
        <div class="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-xl font-medium">No hay historias de usuario disponibles</p>
          {isProductOwner ? (
            <p class="mt-2">Crea una nueva historia de usuario para comenzar</p>
          ) : (
            <p class="mt-2">No hay historias de usuario para mostrar</p>
          )}
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUserStories.map((userStory) => (
            <UserStoryCard
              key={userStory.id}
              userStory={userStory}
              onEdit={openEditModal}
              onDelete={openDeleteConfirmModal}
              isProductOwner={isProductOwner}
              isScrumMaster={isScrumMaster}
            />
          ))}
        </div>
      )}

      {/* Modal para crear historia de usuario */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            {projectId ? "Crear Historia de Usuario para el Proyecto Actual" : "Crear Nueva Historia de Usuario"}
          </h2>
          <CreateUserStoryForm
            projectId={projectId}
            projects={projects}
            onSuccess={handleUserStoryCreated}
            onCancel={() => setShowCreateModal(false)}
          />
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
            ¿Estás seguro de que deseas eliminar la historia de usuario "{selectedUserStory?.title}"? Esta acción no se puede deshacer.
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
              onClick={deleteSelectedUserStory}
              disabled={isDeleting}
              class={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para editar historia de usuario */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Editar Historia de Usuario
          </h2>
          {selectedUserStory && (
            <EditUserStoryForm
              userStory={selectedUserStory}
              onSuccess={handleUserStoryEdited}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
