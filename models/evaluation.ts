import { z } from "zod";
import { type Model, createModel } from "../utils/db.ts";

export enum EvaluationStatus {
  DRAFT = "draft",
  COMPLETED = "completed",
}

// Esquema para la evaluación de un criterio específico
export const CriterionEvaluationSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0, "La puntuación debe ser mayor o igual a 0"),
  feedback: z.string().optional(),
});

export type CriterionEvaluation = z.infer<typeof CriterionEvaluationSchema>;

// Esquema principal para evaluaciones
export const EvaluationSchema = z.object({
  deliverableId: z.string(),
  evaluatorId: z.string(),
  studentId: z.string(),
  rubricId: z.string(),
  criteriaEvaluations: z.array(CriterionEvaluationSchema),
  overallFeedback: z.string().optional(),
  totalScore: z.number().min(0, "La puntuación total debe ser mayor o igual a 0"),
  maxPossibleScore: z.number().min(0, "La puntuación máxima posible debe ser mayor o igual a 0"),
  status: z.nativeEnum(EvaluationStatus).default(EvaluationStatus.DRAFT),
  evaluatedAt: z.number().optional(), // Timestamp de cuando se completó la evaluación
});

export type Evaluation = Model & z.infer<typeof EvaluationSchema>;

// Función para crear una nueva evaluación
export function createEvaluationWithDefaults(
  data: Partial<Omit<Evaluation, keyof Model>>
): Evaluation {
  const defaultData: Omit<Evaluation, keyof Model> = {
    deliverableId: "",
    evaluatorId: "",
    studentId: "",
    rubricId: "",
    criteriaEvaluations: [],
    overallFeedback: "",
    totalScore: 0,
    maxPossibleScore: 0,
    status: EvaluationStatus.DRAFT,
  };

  return createModel<Omit<Evaluation, keyof Model>>({
    ...defaultData,
    ...data,
  });
}
