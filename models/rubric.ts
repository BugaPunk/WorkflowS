import { z } from "zod";
import { type Model, createModel } from "../utils/db.ts";

export enum RubricStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

// Esquema para los niveles de criterio (por ejemplo: Excelente, Bueno, Regular, Insuficiente)
export const RubricCriterionLevelSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "La descripción es requerida"),
  pointValue: z.number().min(0, "El valor debe ser mayor o igual a 0"),
});

export type RubricCriterionLevel = z.infer<typeof RubricCriterionLevelSchema>;

// Esquema para los criterios de evaluación
export const RubricCriterionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  maxPoints: z.number().min(1, "Los puntos máximos deben ser al menos 1"),
  levels: z.array(RubricCriterionLevelSchema).min(1, "Debe haber al menos un nivel"),
});

export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;

// Esquema principal para rúbricas
export const RubricSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  projectId: z.string().optional().nullable(),
  createdBy: z.string(),
  criteria: z.array(RubricCriterionSchema).min(1, "Debe haber al menos un criterio"),
  isTemplate: z.boolean().default(false),
  status: z.nativeEnum(RubricStatus).default(RubricStatus.DRAFT),
});

export type Rubric = Model & z.infer<typeof RubricSchema>;

// Función para crear una nueva rúbrica
export function createRubricWithDefaults(data: Partial<Omit<Rubric, keyof Model>>): Rubric {
  const defaultCriterion: RubricCriterion = {
    id: crypto.randomUUID(),
    name: "Criterio de ejemplo",
    description: "Descripción del criterio",
    maxPoints: 10,
    levels: [
      {
        id: crypto.randomUUID(),
        description: "Excelente",
        pointValue: 10,
      },
      {
        id: crypto.randomUUID(),
        description: "Bueno",
        pointValue: 7,
      },
      {
        id: crypto.randomUUID(),
        description: "Regular",
        pointValue: 4,
      },
      {
        id: crypto.randomUUID(),
        description: "Insuficiente",
        pointValue: 1,
      },
    ],
  };

  const defaultData: Omit<Rubric, keyof Model> = {
    name: "Nueva Rúbrica",
    description: "",
    projectId: undefined,
    createdBy: "",
    criteria: [defaultCriterion],
    isTemplate: false,
    status: RubricStatus.DRAFT,
  };

  return createModel<Omit<Rubric, keyof Model>>({
    ...defaultData,
    ...data,
  });
}
