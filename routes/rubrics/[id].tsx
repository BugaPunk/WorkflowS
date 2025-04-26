import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { UserRole } from "../../models/user.ts";
import RubricDetailsPage from "../../islands/Rubrics/RubricDetailsPage.tsx";

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
    
    return ctx.render({ session, rubricId: id });
  },
};

interface RubricPageProps {
  data: {
    session: {
      userId: string;
      username: string;
      email: string;
      role: UserRole;
    };
    rubricId: string;
  };
}

export default function RubricPage({ data }: RubricPageProps) {
  const { session, rubricId } = data;
  
  return (
    <MainLayout title="Detalles de Rúbrica - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <RubricDetailsPage 
          session={session} 
          rubricId={rubricId} 
        />
      </div>
    </MainLayout>
  );
}
