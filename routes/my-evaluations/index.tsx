import type { FreshContext, PageProps } from "$fresh/server.ts";
import EvaluationHistory from "../../islands/Evaluations/EvaluationHistory.tsx";
import StudentEvaluationsList from "../../islands/Evaluations/StudentEvaluationsList.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import type { UserRole } from "../../models/user.ts";
import { getSession } from "../../utils/session.ts";

interface Data {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response("", {
        status: 302,
        headers: {
          Location: `/login?redirect=${encodeURIComponent(req.url)}`,
        },
      });
    }

    return ctx.render({ session });
  },
};

export default function MyEvaluationsPage({ data }: PageProps<Data>) {
  const { session } = data;

  const handleSelectEvaluation = (evaluationId: string) => {
    globalThis.location.href = `/evaluations/${evaluationId}`;
  };

  return (
    <MainLayout title="Mis Evaluaciones - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis Evaluaciones</h1>

        <div class="space-y-8">
          <StudentEvaluationsList
            studentId={session.userId}
            onSelectEvaluation={(evaluation) => handleSelectEvaluation(evaluation.id)}
          />

          <EvaluationHistory
            studentId={session.userId}
            onSelectEvaluation={(evaluation) => handleSelectEvaluation(evaluation.id)}
          />
        </div>
      </div>
    </MainLayout>
  );
}
