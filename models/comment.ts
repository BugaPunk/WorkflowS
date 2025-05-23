import { createModel, getKv } from "../utils/db.ts";

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string; // Almacenamos el nombre para evitar consultas adicionales
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Crear un nuevo comentario
export async function createComment(
  taskId: string,
  userId: string,
  userName: string,
  content: string
): Promise<Comment> {
  // Crear el modelo del comentario con los campos necesarios
  const comment = createModel({
    taskId,
    userId,
    userName,
    content,
  });

  // Guardar en la base de datos
  const kv = getKv();
  await kv.set(["comments", comment.id], comment);
  // También guardamos una referencia por tarea para facilitar la búsqueda
  await kv.set(["tasks", taskId, "comments", comment.id], comment);

  return comment;
}

// Obtener todos los comentarios de una tarea
export async function getTaskComments(taskId: string): Promise<Comment[]> {
  const kv = getKv();
  const commentsIterator = kv.list<Comment>({ prefix: ["tasks", taskId, "comments"] });
  const comments: Comment[] = [];

  for await (const entry of commentsIterator) {
    comments.push(entry.value);
  }

  // Ordenar por fecha de creación (más recientes primero)
  return comments.sort((a, b) => b.createdAt - a.createdAt);
}

// Eliminar un comentario
export async function deleteComment(commentId: string, taskId: string): Promise<void> {
  const kv = getKv();
  await kv.delete(["comments", commentId]);
  await kv.delete(["tasks", taskId, "comments", commentId]);
}

// Actualizar un comentario
export async function updateComment(
  commentId: string,
  taskId: string,
  content: string
): Promise<Comment | null> {
  // Obtener el comentario actual
  const kv = getKv();
  const commentEntry = await kv.get<Comment>(["comments", commentId]);
  if (!commentEntry.value) {
    return null;
  }

  // Actualizar el contenido
  const updatedComment: Comment = {
    ...commentEntry.value,
    content,
    updatedAt: Date.now(),
  };

  // Guardar en la base de datos
  await kv.set(["comments", commentId], updatedComment);
  await kv.set(["tasks", taskId, "comments", commentId], updatedComment);

  return updatedComment;
}
