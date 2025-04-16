import { 
  createComment as createCommentModel,
  getTaskComments as getTaskCommentsModel,
  deleteComment as deleteCommentModel,
  updateComment as updateCommentModel,
  type Comment
} from "../models/comment.ts";
import { getUserById } from "../models/user.ts";

// Crear un nuevo comentario
export async function createComment(
  taskId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  try {
    // Obtener información del usuario
    const user = await getUserById(userId);
    if (!user) {
      return null;
    }

    // Crear el comentario
    const userName = `${user.firstName} ${user.lastName}`;
    return await createCommentModel(taskId, userId, userName, content);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return null;
  }
}

// Obtener todos los comentarios de una tarea
export async function getTaskComments(taskId: string): Promise<Comment[]> {
  try {
    return await getTaskCommentsModel(taskId);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
}

// Eliminar un comentario
export async function deleteComment(commentId: string, taskId: string, userId: string): Promise<boolean> {
  try {
    // Verificar que el comentario pertenezca al usuario (o implementar lógica de permisos)
    const comments = await getTaskCommentsModel(taskId);
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      return false;
    }
    
    // Solo el autor del comentario puede eliminarlo (o un administrador)
    if (comment.userId !== userId) {
      // Aquí se podría verificar si el usuario es administrador
      return false;
    }
    
    await deleteCommentModel(commentId, taskId);
    return true;
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return false;
  }
}

// Actualizar un comentario
export async function updateComment(
  commentId: string,
  taskId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  try {
    // Verificar que el comentario pertenezca al usuario
    const comments = await getTaskCommentsModel(taskId);
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      return null;
    }
    
    // Solo el autor del comentario puede actualizarlo
    if (comment.userId !== userId) {
      return null;
    }
    
    return await updateCommentModel(commentId, taskId, content);
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    return null;
  }
}
