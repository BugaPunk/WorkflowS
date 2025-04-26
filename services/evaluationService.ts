import { getKv } from "../utils/db.ts";
import { createModel, type Model } from "../utils/db.ts";
import { Evaluation, EvaluationSchema, EvaluationStatus } from "../models/evaluation.ts";
import { getRubricById } from "./rubricService.ts";

// Colecciones para evaluaciones
export const EVALUATION_COLLECTIONS = {
  EVALUATIONS: ["evaluations"],
  EVALUATIONS_BY_DELIVERABLE: ["evaluations_by_deliverable"],
  EVALUATIONS_BY_STUDENT: ["evaluations_by_student"],
  EVALUATIONS_BY_EVALUATOR: ["evaluations_by_evaluator"],
} as const;

// Crear una nueva evaluación
export async function createEvaluation(data: Omit<Evaluation, keyof Model>): Promise<Evaluation> {
  const validatedData = EvaluationSchema.parse(data);
  const evaluation = createModel<typeof validatedData>(validatedData);
  
  const kv = getKv();
  await kv.set([...EVALUATION_COLLECTIONS.EVALUATIONS, evaluation.id], evaluation);
  
  // Crear referencias
  await kv.set([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_DELIVERABLE, data.deliverableId, evaluation.id], evaluation.id);
  await kv.set([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_STUDENT, data.studentId, evaluation.id], evaluation.id);
  await kv.set([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_EVALUATOR, data.evaluatorId, evaluation.id], evaluation.id);
  
  return evaluation;
}

// Obtener una evaluación por ID
export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  const kv = getKv();
  const result = await kv.get<Evaluation>([...EVALUATION_COLLECTIONS.EVALUATIONS, id]);
  return result.value;
}

// Obtener evaluaciones por entregable
export async function getEvaluationsByDeliverable(deliverableId: string): Promise<Evaluation[]> {
  const kv = getKv();
  const evaluations: Evaluation[] = [];
  
  // Listar todas las evaluaciones para este entregable
  const evaluationIds = await kv.list<string>({
    prefix: [...EVALUATION_COLLECTIONS.EVALUATIONS_BY_DELIVERABLE, deliverableId],
  });
  
  for await (const entry of evaluationIds) {
    if (entry.value) {
      const evaluation = await getEvaluationById(entry.value);
      if (evaluation) {
        evaluations.push(evaluation);
      }
    }
  }
  
  return evaluations;
}

// Obtener evaluaciones por estudiante
export async function getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
  const kv = getKv();
  const evaluations: Evaluation[] = [];
  
  // Listar todas las evaluaciones para este estudiante
  const evaluationIds = await kv.list<string>({
    prefix: [...EVALUATION_COLLECTIONS.EVALUATIONS_BY_STUDENT, studentId],
  });
  
  for await (const entry of evaluationIds) {
    if (entry.value) {
      const evaluation = await getEvaluationById(entry.value);
      if (evaluation) {
        evaluations.push(evaluation);
      }
    }
  }
  
  return evaluations;
}

// Obtener evaluaciones realizadas por un evaluador
export async function getEvaluationsByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
  const kv = getKv();
  const evaluations: Evaluation[] = [];
  
  // Listar todas las evaluaciones realizadas por este evaluador
  const evaluationIds = await kv.list<string>({
    prefix: [...EVALUATION_COLLECTIONS.EVALUATIONS_BY_EVALUATOR, evaluatorId],
  });
  
  for await (const entry of evaluationIds) {
    if (entry.value) {
      const evaluation = await getEvaluationById(entry.value);
      if (evaluation) {
        evaluations.push(evaluation);
      }
    }
  }
  
  return evaluations;
}

// Actualizar una evaluación
export async function updateEvaluation(id: string, updates: Partial<Omit<Evaluation, keyof Model>>): Promise<Evaluation | null> {
  const kv = getKv();
  const evaluation = await getEvaluationById(id);
  
  if (!evaluation) {
    return null;
  }
  
  const updatedEvaluation: Evaluation = {
    ...evaluation,
    ...updates,
    updatedAt: Date.now(),
  };
  
  // Si se está completando la evaluación, establecer la fecha
  if (updates.status === EvaluationStatus.COMPLETED && evaluation.status !== EvaluationStatus.COMPLETED) {
    updatedEvaluation.evaluatedAt = Date.now();
  }
  
  await kv.set([...EVALUATION_COLLECTIONS.EVALUATIONS, id], updatedEvaluation);
  
  return updatedEvaluation;
}

// Calcular puntuación total de una evaluación
export async function calculateEvaluationScore(evaluationId: string): Promise<{ totalScore: number; maxPossibleScore: number } | null> {
  const evaluation = await getEvaluationById(evaluationId);
  
  if (!evaluation) {
    return null;
  }
  
  const rubric = await getRubricById(evaluation.rubricId);
  
  if (!rubric) {
    return null;
  }
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Calcular puntuación total y máxima posible
  for (const criterionEval of evaluation.criteriaEvaluations) {
    const criterion = rubric.criteria.find(c => c.id === criterionEval.criterionId);
    
    if (criterion) {
      totalScore += criterionEval.score;
      maxPossibleScore += criterion.maxPoints;
    }
  }
  
  // Actualizar la evaluación con las puntuaciones calculadas
  await updateEvaluation(evaluationId, {
    totalScore,
    maxPossibleScore,
  });
  
  return { totalScore, maxPossibleScore };
}

// Finalizar una evaluación
export async function finalizeEvaluation(evaluationId: string): Promise<Evaluation | null> {
  const evaluation = await getEvaluationById(evaluationId);
  
  if (!evaluation) {
    return null;
  }
  
  // Calcular puntuación final
  const scores = await calculateEvaluationScore(evaluationId);
  
  if (!scores) {
    return null;
  }
  
  // Actualizar la evaluación como completada
  return updateEvaluation(evaluationId, {
    status: EvaluationStatus.COMPLETED,
    totalScore: scores.totalScore,
    maxPossibleScore: scores.maxPossibleScore,
    evaluatedAt: Date.now(),
  });
}

// Eliminar una evaluación
export async function deleteEvaluation(id: string): Promise<boolean> {
  const kv = getKv();
  const evaluation = await getEvaluationById(id);
  
  if (!evaluation) {
    return false;
  }
  
  // Eliminar la evaluación
  await kv.delete([...EVALUATION_COLLECTIONS.EVALUATIONS, id]);
  
  // Eliminar referencias
  await kv.delete([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_DELIVERABLE, evaluation.deliverableId, id]);
  await kv.delete([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_STUDENT, evaluation.studentId, id]);
  await kv.delete([...EVALUATION_COLLECTIONS.EVALUATIONS_BY_EVALUATOR, evaluation.evaluatorId, id]);
  
  return true;
}
