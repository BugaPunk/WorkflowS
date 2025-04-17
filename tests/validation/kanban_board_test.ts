// tests/validation/kanban_board_test.ts
import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";

// Definir enumeración para estado de la tarea
enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  BLOCKED = "blocked",
}

// Tipo para representar una tarea
type Task = {
  id: string;
  title: string;
  description?: string;
  userStoryId: string;
  status: TaskStatus;
  assignedTo?: string;
  estimatedHours?: number;
  spentHours?: number;
  createdBy: string;
};

// Tipo para representar un tablero Kanban
type KanbanBoard = {
  columns: {
    [key in TaskStatus]: Task[];
  };
  wipLimits: {
    [key in TaskStatus]?: number;
  };
};

// Función para verificar la consistencia del tablero Kanban
function verifyKanbanBoardConsistency(board: KanbanBoard) {
  const errors: string[] = [];
  
  // Verificar que todas las tareas estén en la columna correcta según su estado
  Object.entries(board.columns).forEach(([columnStatus, tasks]) => {
    tasks.forEach(task => {
      if (task.status !== columnStatus) {
        errors.push(`La tarea "${task.title}" tiene estado ${task.status} pero está en la columna ${columnStatus}.`);
      }
    });
  });
  
  // Verificar que se respeten los límites de WIP (Work In Progress)
  Object.entries(board.wipLimits).forEach(([columnStatus, limit]) => {
    if (limit !== undefined && limit > 0) {
      const columnTasks = board.columns[columnStatus as TaskStatus] || [];
      if (columnTasks.length > limit) {
        errors.push(`La columna ${columnStatus} tiene ${columnTasks.length} tareas, excediendo el límite de ${limit}.`);
      }
    }
  });
  
  // Verificar que no haya tareas duplicadas en el tablero
  const allTasks: Task[] = Object.values(board.columns).flat();
  const taskIds = allTasks.map(task => task.id);
  const uniqueTaskIds = new Set(taskIds);
  if (taskIds.length !== uniqueTaskIds.size) {
    errors.push("Hay tareas duplicadas en el tablero Kanban.");
  }
  
  return {
    isConsistent: errors.length === 0,
    errors
  };
}

// Función para simular el movimiento de una tarea entre columnas
function moveTask(board: KanbanBoard, taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus): { success: boolean; error?: string; board: KanbanBoard } {
  // Crear una copia profunda del tablero
  const newBoard: KanbanBoard = {
    columns: JSON.parse(JSON.stringify(board.columns)),
    wipLimits: { ...board.wipLimits }
  };
  
  // Buscar la tarea en la columna de origen
  const taskIndex = newBoard.columns[fromStatus].findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    return { 
      success: false, 
      error: `La tarea con ID ${taskId} no se encuentra en la columna ${fromStatus}.`,
      board: newBoard
    };
  }
  
  // Verificar el límite WIP de la columna de destino
  const wipLimit = newBoard.wipLimits[toStatus];
  if (wipLimit !== undefined && wipLimit > 0) {
    if (newBoard.columns[toStatus].length >= wipLimit) {
      return { 
        success: false, 
        error: `No se puede mover la tarea a la columna ${toStatus} porque excedería el límite de ${wipLimit} tareas.`,
        board: newBoard
      };
    }
  }
  
  // Obtener la tarea
  const task = { ...newBoard.columns[fromStatus][taskIndex] };
  
  // Actualizar el estado de la tarea
  task.status = toStatus;
  
  // Eliminar la tarea de la columna de origen
  newBoard.columns[fromStatus].splice(taskIndex, 1);
  
  // Añadir la tarea a la columna de destino
  newBoard.columns[toStatus].push(task);
  
  return { success: true, board: newBoard };
}

Deno.test("Kanban Board Consistency", async (t) => {
  await t.step("should detect tasks in wrong columns", async () => {
    const board: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [
          {
            id: "task1",
            title: "Task 1",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS, // Wrong status for this column
            createdBy: "user123"
          }
        ],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {}
    };
    
    const result = verifyKanbanBoardConsistency(board);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect WIP limit violations", async () => {
    const board: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [
          {
            id: "task1",
            title: "Task 1",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS,
            createdBy: "user123"
          },
          {
            id: "task2",
            title: "Task 2",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS,
            createdBy: "user123"
          },
          {
            id: "task3",
            title: "Task 3",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS,
            createdBy: "user123"
          }
        ],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {
        [TaskStatus.IN_PROGRESS]: 2 // Limit of 2, but there are 3 tasks
      }
    };
    
    const result = verifyKanbanBoardConsistency(board);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should detect duplicate tasks", async () => {
    const duplicateTask = {
      id: "task1", // Duplicate ID
      title: "Task 1",
      userStoryId: "us1",
      status: TaskStatus.TODO,
      createdBy: "user123"
    };
    
    const board: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [
          duplicateTask,
          duplicateTask // Same task object used twice
        ],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {}
    };
    
    const result = verifyKanbanBoardConsistency(board);
    assertEquals(result.isConsistent, false);
    assertNotEquals(result.errors.length, 0);
  });

  await t.step("should accept a consistent board", async () => {
    const board: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [
          {
            id: "task1",
            title: "Task 1",
            userStoryId: "us1",
            status: TaskStatus.TODO,
            createdBy: "user123"
          }
        ],
        [TaskStatus.IN_PROGRESS]: [
          {
            id: "task2",
            title: "Task 2",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS,
            assignedTo: "user456",
            createdBy: "user123"
          }
        ],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [
          {
            id: "task3",
            title: "Task 3",
            userStoryId: "us1",
            status: TaskStatus.DONE,
            assignedTo: "user456",
            createdBy: "user123"
          }
        ],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {
        [TaskStatus.IN_PROGRESS]: 3,
        [TaskStatus.REVIEW]: 2
      }
    };
    
    const result = verifyKanbanBoardConsistency(board);
    assertEquals(result.isConsistent, true);
    assertEquals(result.errors.length, 0);
  });

  await t.step("should move tasks between columns correctly", async () => {
    const initialBoard: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [
          {
            id: "task1",
            title: "Task 1",
            userStoryId: "us1",
            status: TaskStatus.TODO,
            createdBy: "user123"
          }
        ],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {
        [TaskStatus.IN_PROGRESS]: 2
      }
    };
    
    // Move task from TODO to IN_PROGRESS
    const moveResult = moveTask(
      initialBoard,
      "task1",
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS
    );
    
    assertEquals(moveResult.success, true);
    assertEquals(moveResult.board.columns[TaskStatus.TODO].length, 0);
    assertEquals(moveResult.board.columns[TaskStatus.IN_PROGRESS].length, 1);
    assertEquals(moveResult.board.columns[TaskStatus.IN_PROGRESS][0].status, TaskStatus.IN_PROGRESS);
    
    // Verify the new board is consistent
    const consistencyResult = verifyKanbanBoardConsistency(moveResult.board);
    assertEquals(consistencyResult.isConsistent, true);
  });

  await t.step("should respect WIP limits when moving tasks", async () => {
    const initialBoard: KanbanBoard = {
      columns: {
        [TaskStatus.TODO]: [
          {
            id: "task1",
            title: "Task 1",
            userStoryId: "us1",
            status: TaskStatus.TODO,
            createdBy: "user123"
          }
        ],
        [TaskStatus.IN_PROGRESS]: [
          {
            id: "task2",
            title: "Task 2",
            userStoryId: "us1",
            status: TaskStatus.IN_PROGRESS,
            createdBy: "user123"
          }
        ],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: []
      },
      wipLimits: {
        [TaskStatus.IN_PROGRESS]: 1 // Limit of 1, already reached
      }
    };
    
    // Try to move task from TODO to IN_PROGRESS (should fail due to WIP limit)
    const moveResult = moveTask(
      initialBoard,
      "task1",
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS
    );
    
    assertEquals(moveResult.success, false);
    assertNotEquals(moveResult.error, undefined);
    assertEquals(moveResult.board.columns[TaskStatus.TODO].length, 1);
    assertEquals(moveResult.board.columns[TaskStatus.IN_PROGRESS].length, 1);
  });
});
