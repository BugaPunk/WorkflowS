import { getKv } from "../utils/db.ts";
import { createModel, type Model } from "../utils/db.ts";
import { Rubric, RubricSchema, RubricStatus } from "../models/rubric.ts";

// Colecciones para rúbricas
export const RUBRIC_COLLECTIONS = {
  RUBRICS: ["rubrics"],
  RUBRIC_TEMPLATES: ["rubric_templates"],
  RUBRICS_BY_PROJECT: ["rubrics_by_project"],
  RUBRICS_BY_USER: ["rubrics_by_user"],
} as const;

// Crear una nueva rúbrica
export async function createRubric(data: Omit<Rubric, keyof Model>): Promise<Rubric> {
  const validatedData = RubricSchema.parse(data);
  const rubric = createModel<typeof validatedData>(validatedData);
  
  const kv = getKv();
  await kv.set([...RUBRIC_COLLECTIONS.RUBRICS, rubric.id], rubric);
  
  // Si está asociada a un proyecto, crear referencia
  if (rubric.projectId && typeof rubric.projectId === 'string') {
    await kv.set([...RUBRIC_COLLECTIONS.RUBRICS_BY_PROJECT, rubric.projectId, rubric.id], rubric.id);
  }
  
  // Crear referencia por usuario creador
  await kv.set([...RUBRIC_COLLECTIONS.RUBRICS_BY_USER, rubric.createdBy, rubric.id], rubric.id);
  
  // Si es una plantilla, añadir a la lista de plantillas
  if (rubric.isTemplate) {
    await kv.set([...RUBRIC_COLLECTIONS.RUBRIC_TEMPLATES, rubric.id], rubric.id);
  }
  
  return rubric;
}

// Obtener una rúbrica por ID
export async function getRubricById(id: string): Promise<Rubric | null> {
  const kv = getKv();
  const result = await kv.get<Rubric>([...RUBRIC_COLLECTIONS.RUBRICS, id]);
  return result.value;
}

// Obtener rúbricas por proyecto
export async function getRubricsByProject(projectId: string): Promise<Rubric[]> {
  const kv = getKv();
  const rubrics: Rubric[] = [];
  
  // Listar todas las rúbricas para este proyecto
  const rubricIds = await kv.list<string>({
    prefix: [...RUBRIC_COLLECTIONS.RUBRICS_BY_PROJECT, projectId],
  });
  
  for await (const entry of rubricIds) {
    if (entry.value) {
      const rubric = await getRubricById(entry.value);
      if (rubric) {
        rubrics.push(rubric);
      }
    }
  }
  
  return rubrics;
}

// Obtener rúbricas creadas por un usuario
export async function getRubricsByUser(userId: string): Promise<Rubric[]> {
  const kv = getKv();
  const rubrics: Rubric[] = [];
  
  // Listar todas las rúbricas creadas por este usuario
  const rubricIds = await kv.list<string>({
    prefix: [...RUBRIC_COLLECTIONS.RUBRICS_BY_USER, userId],
  });
  
  for await (const entry of rubricIds) {
    if (entry.value) {
      const rubric = await getRubricById(entry.value);
      if (rubric) {
        rubrics.push(rubric);
      }
    }
  }
  
  return rubrics;
}

// Obtener plantillas de rúbricas
export async function getRubricTemplates(): Promise<Rubric[]> {
  const kv = getKv();
  const templates: Rubric[] = [];
  
  // Listar todas las plantillas
  const templateIds = await kv.list<string>({
    prefix: RUBRIC_COLLECTIONS.RUBRIC_TEMPLATES,
  });
  
  for await (const entry of templateIds) {
    if (entry.value) {
      const template = await getRubricById(entry.value);
      if (template) {
        templates.push(template);
      }
    }
  }
  
  return templates;
}

// Actualizar una rúbrica
export async function updateRubric(id: string, updates: Partial<Omit<Rubric, keyof Model>>): Promise<Rubric | null> {
  const kv = getKv();
  const rubric = await getRubricById(id);
  
  if (!rubric) {
    return null;
  }
  
  const updatedRubric: Rubric = {
    ...rubric,
    ...updates,
    updatedAt: Date.now(),
  };
  
  await kv.set([...RUBRIC_COLLECTIONS.RUBRICS, id], updatedRubric);
  
  // Si cambió el estado de plantilla, actualizar referencias
  if (updates.isTemplate !== undefined && updates.isTemplate !== rubric.isTemplate) {
    if (updates.isTemplate) {
      await kv.set([...RUBRIC_COLLECTIONS.RUBRIC_TEMPLATES, id], id);
    } else {
      await kv.delete([...RUBRIC_COLLECTIONS.RUBRIC_TEMPLATES, id]);
    }
  }
  
  return updatedRubric;
}

// Duplicar una rúbrica (útil para crear a partir de plantillas)
export async function duplicateRubric(id: string, newData: {
  name: string;
  projectId?: string;
  createdBy: string;
  isTemplate?: boolean;
}): Promise<Rubric | null> {
  const sourceRubric = await getRubricById(id);
  
  if (!sourceRubric) {
    return null;
  }
  
  // Crear nueva rúbrica con datos de la original
  const newRubric: Omit<Rubric, keyof Model> = {
    name: newData.name,
    description: sourceRubric.description,
    projectId: newData.projectId,
    createdBy: newData.createdBy,
    criteria: JSON.parse(JSON.stringify(sourceRubric.criteria)), // Copia profunda
    isTemplate: newData.isTemplate ?? false,
    status: RubricStatus.DRAFT,
  };
  
  return createRubric(newRubric);
}

// Eliminar una rúbrica
export async function deleteRubric(id: string): Promise<boolean> {
  const kv = getKv();
  const rubric = await getRubricById(id);
  
  if (!rubric) {
    return false;
  }
  
  // Eliminar la rúbrica
  await kv.delete([...RUBRIC_COLLECTIONS.RUBRICS, id]);
  
  // Eliminar referencias
  if (rubric.projectId && typeof rubric.projectId === 'string') {
    await kv.delete([...RUBRIC_COLLECTIONS.RUBRICS_BY_PROJECT, rubric.projectId, id]);
  }
  
  await kv.delete([...RUBRIC_COLLECTIONS.RUBRICS_BY_USER, rubric.createdBy, id]);
  
  if (rubric.isTemplate) {
    await kv.delete([...RUBRIC_COLLECTIONS.RUBRIC_TEMPLATES, id]);
  }
  
  return true;
}
