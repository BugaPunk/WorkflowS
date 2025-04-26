import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { UserRole } from "../../models/user.ts";
import EvaluationManager from "../../islands/Evaluations/EvaluationManager.tsx";

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
    
    // Obtener parámetros opcionales
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId") || undefined;
    
    return ctx.render({ session, projectId });
  },
};

interface EvaluationsPageProps {
  data: {
    session: {
      userId: string;
      username: string;
      email: string;
      role: UserRole;
    };
    projectId?: string;
  };
}

export default function EvaluationsPage({ data }: EvaluationsPageProps) {
  const { session, projectId } = data;
  
  return (
    <MainLayout title="Evaluaciones - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Evaluaciones</h1>
        
        <EvaluationManager 
          session={session} 
          projectId={projectId}
        />
      </div>
    </MainLayout>
  );
}
