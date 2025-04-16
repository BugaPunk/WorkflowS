import { useState, useEffect } from "preact/hooks";
import type { Task, TaskComment, TaskHistoryEntry } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";
import type { Project } from "../../models/project.ts";
import type { User } from "../../models/user.ts";
import { Button } from "../../components/Button.tsx";
import { updateTask } from "../../services/taskService.ts";
import {
  getTaskComments,
  addTaskComment,
  getTaskHistory,
  logTaskTime,
} from "../../services/taskDetailService.ts";
import { getUserById } from "../../services/userService.ts";
import Modal from "../Modal.tsx";
import EditTaskForm from "./EditTaskForm.tsx";

interface TaskDetailViewProps {
  task: Task;
  userStory: UserStory;
  project: Project;
  assignedUser: User | null;
  createdByUser: User | null;
  canManageTask: boolean;
}

export default function TaskDetailView({
  task,
  userStory,
  project,
  assignedUser,
  createdByUser,
  canManageTask,
}: TaskDetailViewProps) {
  // Estados para la tarea
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para comentarios
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({});

  // Estados para historial
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyUsers, setHistoryUsers] = useState<Record<string, User>>({});

  // Estados para registro de tiempo
  const [timeToLog, setTimeToLog] = useState("");
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  // Estado general
  const [error, setError] = useState<string | null>(null);

  // Cargar comentarios
  useEffect(() => {
    const loadComments = async () => {
      setIsLoadingComments(true);
      try {
        const taskComments = await getTaskComments(task.id);
        setComments(taskComments);

        // Cargar información de usuarios para los comentarios
        const userIds = new Set(taskComments.map((comment) => comment.userId));
        const users: Record<string, User> = {};

        for (const userId of userIds) {
          try {
            const user = await getUserById(userId);
            if (user) {
              users[userId] = user;
            }
          } catch (error) {
            console.error(`Error al cargar usuario ${userId}:`, error);
          }
        }

        setCommentUsers(users);
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [task.id]);

  // Cargar historial
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const taskHistory = await getTaskHistory(task.id);
        setHistory(taskHistory);

        // Cargar información de usuarios para el historial
        const userIds = new Set(taskHistory.map((entry) => entry.userId));
        const users: Record<string, User> = {};

        for (const userId of userIds) {
          try {
            const user = await getUserById(userId);
            if (user) {
              users[userId] = user;
            }
          } catch (error) {
            console.error(`Error al cargar usuario ${userId}:`, error);
          }
        }

        setHistoryUsers(users);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [task.id]);

  // Función para cambiar el estado de la tarea
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    setError(null);

    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el estado de la tarea");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Función para añadir un comentario
  const handleAddComment = async (e: Event) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsAddingComment(true);
    setError(null);

    try {
      const comment = await addTaskComment(task.id, newComment);

      // Actualizar la lista de comentarios
      setComments([...comments, comment]);
      setNewComment("");

      // Actualizar la información del usuario si es necesario
      if (!commentUsers[comment.userId]) {
        try {
          const user = await getUserById(comment.userId);
          if (user) {
            setCommentUsers((prev) => ({
              ...prev,
              [comment.userId]: user,
            }));
          }
        } catch (error) {
          console.error(`Error al cargar usuario ${comment.userId}:`, error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir comentario");
    } finally {
      setIsAddingComment(false);
    }
  };

  // Función para registrar tiempo
  const handleLogTime = async (e: Event) => {
    e.preventDefault();

    const hours = Number.parseFloat(timeToLog);
    if (Number.isNaN(hours) || hours <= 0) {
      setError("Por favor, ingresa un número válido de horas");
      return;
    }

    setIsLoggingTime(true);
    setError(null);

    try {
      const updatedTask = await logTaskTime(task.id, hours);
      if (updatedTask) {
        setCurrentTask(updatedTask);
        setTimeToLog("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar tiempo");
    } finally {
      setIsLoggingTime(false);
    }
  };

  // Función para actualizar la tarea después de editar
  const handleTaskUpdated = (updatedTask?: Task) => {
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
    setShowEditModal(false);
  };

  // Obtener texto del estado
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "Por hacer";
      case TaskStatus.IN_PROGRESS:
        return "En progreso";
      case TaskStatus.REVIEW:
        return "En revisión";
      case TaskStatus.DONE:
        return "Completada";
      case TaskStatus.BLOCKED:
        return "Bloqueada";
      default:
        return status;
    }
  };

  // Obtener color según el estado
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800";
      case TaskStatus.BLOCKED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener nombre de usuario
  const getUserName = (userId: string, userMap: Record<string, User> = {}) => {
    const user = userMap[userId] || historyUsers[userId] || commentUsers[userId];
    if (!user) return userId;

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.username;
  };

  // Obtener nombre legible del campo
  const getFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      title: "Título",
      description: "Descripción",
      status: "Estado",
      assignedTo: "Asignado a",
      estimatedHours: "Horas estimadas",
      spentHours: "Horas dedicadas",
    };

    return fieldNames[field] || field;
  };

  // Obtener valor legible
  const getReadableValue = (field: string, value: string) => {
    if (field === "status") {
      return getStatusText(value as TaskStatus);
    }

    if (field === "assignedTo") {
      // Aquí podríamos buscar el nombre del usuario, pero por simplicidad
      // dejamos el ID por ahora
      return value || "No asignado";
    }

    return value || "-";
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Contenido principal (3/4 del ancho) */}
      <div class="lg:col-span-3">
        {/* Encabezado */}
        <div class="mb-6">
          <div class="flex items-center mb-2">
            <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
              {project.name}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a href={`/user-stories/${userStory.id}`} class="text-blue-600 hover:text-blue-800">
              {userStory.title}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a
              href={`/user-stories/${userStory.id}/tasks`}
              class="text-blue-600 hover:text-blue-800"
            >
              Tareas
            </a>
          </div>

          <div class="flex justify-between items-start">
            <h1 class="text-3xl font-bold text-gray-800">{currentTask.title}</h1>
            {canManageTask && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                class="text-blue-600 hover:text-blue-800"
                title="Editar Tarea"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          <div class="mt-2">
            <span
              class={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(currentTask.status)}`}
            >
              {getStatusText(currentTask.status)}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Descripción</h2>
            {currentTask.description ? (
              <p class="text-gray-700 whitespace-pre-line">{currentTask.description}</p>
            ) : (
              <p class="text-gray-500 italic">Sin descripción</p>
            )}
          </div>
        </div>

        {/* Información de tiempo */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Información de tiempo</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Tiempo estimado</h3>
                <p class="text-lg font-semibold">
                  {currentTask.estimatedHours !== undefined
                    ? `${currentTask.estimatedHours} horas`
                    : "No estimado"}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Tiempo dedicado</h3>
                <p class="text-lg font-semibold">
                  {currentTask.spentHours !== undefined
                    ? `${currentTask.spentHours} horas`
                    : "0 horas"}
                </p>
              </div>
            </div>

            {canManageTask && (
              <div>
                <h3 class="text-md font-semibold text-gray-700 mb-2">Registrar tiempo</h3>
                <form onSubmit={handleLogTime} class="flex items-end space-x-2">
                  <div class="flex-grow">
                    <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="timeToLog">
                      Horas dedicadas
                    </label>
                    <input
                      type="number"
                      id="timeToLog"
                      name="timeToLog"
                      min="0.1"
                      step="0.1"
                      value={timeToLog}
                      onChange={(e) => setTimeToLog((e.target as HTMLInputElement).value)}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 2.5"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoggingTime}
                    class="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoggingTime ? "Registrando..." : "Registrar"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Historial de cambios */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Historial de cambios</h2>

            {isLoadingHistory ? (
              <div class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : history.length > 0 ? (
              <div class="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} class="border-b border-gray-200 pb-3 last:border-0">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="font-medium">{getUserName(entry.userId, historyUsers)}</span>
                        <span class="text-gray-600"> cambió </span>
                        <span class="font-medium">{getFieldName(entry.field)}</span>
                      </div>
                      <span class="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                    </div>
                    <div class="mt-1 text-sm">
                      <span class="text-gray-600">De: </span>
                      <span class="font-medium">
                        {getReadableValue(entry.field, entry.oldValue)}
                      </span>
                      <span class="text-gray-600"> a: </span>
                      <span class="font-medium">
                        {getReadableValue(entry.field, entry.newValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p class="text-gray-500 italic">No hay cambios registrados</p>
            )}
          </div>
        </div>

        {/* Comentarios */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Comentarios</h2>

            {/* Lista de comentarios */}
            {isLoadingComments ? (
              <div class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : comments.length > 0 ? (
              <div class="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                      <span class="font-medium">{getUserName(comment.userId, commentUsers)}</span>
                      <span class="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p class="mt-2 text-gray-700 whitespace-pre-line">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p class="text-gray-500 italic mb-6">No hay comentarios</p>
            )}

            {/* Formulario para añadir comentario */}
            <form onSubmit={handleAddComment}>
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="newComment">
                  Añadir comentario
                </label>
                <textarea
                  id="newComment"
                  name="newComment"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment((e.target as HTMLTextAreaElement).value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escribe tu comentario aquí..."
                  required
                />
              </div>
              <div class="flex justify-end">
                <Button
                  type="submit"
                  disabled={isAddingComment || !newComment.trim()}
                  class="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAddingComment ? "Enviando..." : "Enviar comentario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Panel lateral (1/4 del ancho) */}
      <div class="lg:col-span-1">
        {/* Información de la tarea */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Detalles</h2>

            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Asignado a</h3>
                <p class="text-gray-800">
                  {assignedUser ? (
                    assignedUser.firstName && assignedUser.lastName ? (
                      `${assignedUser.firstName} ${assignedUser.lastName}`
                    ) : (
                      assignedUser.username
                    )
                  ) : (
                    <span class="text-gray-500 italic">No asignado</span>
                  )}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Creado por</h3>
                <p class="text-gray-800">
                  {createdByUser ? (
                    createdByUser.firstName && createdByUser.lastName ? (
                      `${createdByUser.firstName} ${createdByUser.lastName}`
                    ) : (
                      createdByUser.username
                    )
                  ) : (
                    <span class="text-gray-500 italic">Desconocido</span>
                  )}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Creado el</h3>
                <p class="text-gray-800">{formatDate(currentTask.createdAt)}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Última actualización</h3>
                <p class="text-gray-800">{formatDate(currentTask.updatedAt)}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Historia de usuario</h3>
                <p class="text-gray-800">
                  <a
                    href={`/user-stories/${userStory.id}`}
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {userStory.title}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {canManageTask && !isUpdatingStatus && (
          <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
            <div class="p-4">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Acciones</h2>

              <div class="space-y-2">
                {currentTask.status !== TaskStatus.TODO && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.TODO)}
                    class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
                  >
                    Mover a Por hacer
                  </button>
                )}

                {currentTask.status !== TaskStatus.IN_PROGRESS && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                    class="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                  >
                    Mover a En progreso
                  </button>
                )}

                {currentTask.status !== TaskStatus.REVIEW && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.REVIEW)}
                    class="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm font-medium"
                  >
                    Mover a Revisión
                  </button>
                )}

                {currentTask.status !== TaskStatus.DONE && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.DONE)}
                    class="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm font-medium"
                  >
                    Marcar como Completada
                  </button>
                )}

                {currentTask.status !== TaskStatus.BLOCKED && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                    class="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
                  >
                    Marcar como Bloqueada
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  class="w-full px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded text-sm font-medium"
                >
                  Editar tarea
                </button>
              </div>
            </div>
          </div>
        )}

        {isUpdatingStatus && (
          <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 p-4 mb-6">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
            <p class="text-center mt-2 text-gray-600">Actualizando estado...</p>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Modal para editar tarea */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Editar Tarea</h2>
          <EditTaskForm
            task={currentTask}
            onSuccess={handleTaskUpdated}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
