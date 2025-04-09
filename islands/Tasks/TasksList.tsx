import { useState, useEffect } from "preact/hooks";
import { Task, TaskStatus } from "../../models/task.ts";
import { Button } from "../../components/Button.tsx";
import Modal from "../Modal.tsx";
import CreateTaskForm from "./CreateTaskForm.tsx";
import TaskCard from "./TaskCard.tsx";
import { getUserStoryTasks } from "../../models/task.ts";

interface TasksListProps {
  userStoryId: string;
  initialTasks: Task[];
  canManageTasks: boolean;
}

export default function TasksList({
  userStoryId,
  initialTasks,
  canManageTasks,
}: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar tareas
  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tasksData = await getUserStoryTasks(userStoryId);
      setTasks(tasksData);
    } catch (err) {
      setError("Error al cargar las tareas. Por favor, intenta de nuevo.");
      console.error("Error cargando tareas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [userStoryId]);

  // Función para manejar la creación exitosa de una tarea
  const handleTaskCreated = () => {
    loadTasks();
    setShowCreateModal(false);
  };

  // Agrupar tareas por estado
  const todoTasks = tasks.filter(task => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const reviewTasks = tasks.filter(task => task.status === TaskStatus.REVIEW);
  const doneTasks = tasks.filter(task => task.status === TaskStatus.DONE);
  const blockedTasks = tasks.filter(task => task.status === TaskStatus.BLOCKED);

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Tareas</h2>
        {canManageTasks && (
          <Button
            onClick={() => setShowCreateModal(true)}
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Crear Tarea
          </Button>
        )}
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-600">No hay tareas para esta historia de usuario.</p>
          {canManageTasks && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear la primera tarea
            </Button>
          )}
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna: Por hacer */}
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Por hacer ({todoTasks.length})</h3>
            <div class="space-y-3">
              {todoTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={loadTasks}
                  canManage={canManageTasks}
                />
              ))}
            </div>
          </div>

          {/* Columna: En progreso */}
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">En progreso ({inProgressTasks.length})</h3>
            <div class="space-y-3">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={loadTasks}
                  canManage={canManageTasks}
                />
              ))}
            </div>
          </div>

          {/* Columna: Completadas */}
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Completadas ({doneTasks.length})</h3>
            <div class="space-y-3">
              {doneTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={loadTasks}
                  canManage={canManageTasks}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sección para tareas en revisión */}
      {reviewTasks.length > 0 && (
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">En revisión ({reviewTasks.length})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={loadTasks}
                canManage={canManageTasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección para tareas bloqueadas */}
      {blockedTasks.length > 0 && (
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Bloqueadas ({blockedTasks.length})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={loadTasks}
                canManage={canManageTasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal para crear tarea */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Crear Tarea</h2>
          <CreateTaskForm
            userStoryId={userStoryId}
            onSuccess={handleTaskCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
