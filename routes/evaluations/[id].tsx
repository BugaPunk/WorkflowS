import type { Handlers } from "$fresh/server.ts";
import EvaluationManager from "../../islands/Evaluations/EvaluationManager.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import type { UserRole } from "../../models/user.ts";
import { getSession } from "../../utils/session.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const session = await getSession(req);

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/login?redirect=${encodeURIComponent(req.url)}`,
        },
      });
    }

    const { id } = ctx.params;

    return ctx.render({ session, evaluationId: id });
  },
};

interface EvaluationPageProps {
  data: {
    session: {
      userId: string;
      username: string;
      email: string;
      role: UserRole;
    };
    evaluationId: string;
  };
}

export default function EvaluationPage({ data }: EvaluationPageProps) {
  const { session, evaluationId } = data;

  return (
    <MainLayout title="Detalles de Evaluación - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Detalles de Evaluación</h1>

        <EvaluationManager session={session} evaluationId={evaluationId} />
      </div>
    </MainLayout>
  );
}
