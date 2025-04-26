import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../../utils/session.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import { UserRole } from "../../../models/user.ts";
import RubricEditPage from "../../../islands/Rubrics/RubricEditPage.tsx";

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
    
    // Solo los profesores pueden editar rúbricas
    if (session.role !== UserRole.ADMIN && 
        session.role !== UserRole.PRODUCT_OWNER && 
        session.role !== UserRole.SCRUM_MASTER) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }
    
    const { id } = ctx.params;
    
    return ctx.render({ session, rubricId: id });
  },
};

interface RubricEditPageProps {
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

export default function RubricEdit({ data }: RubricEditPageProps) {
  const { session, rubricId } = data;
  
  return (
    <MainLayout title="Editar Rúbrica - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Editar Rúbrica</h1>
        
        <RubricEditPage 
          session={session} 
          rubricId={rubricId} 
        />
      </div>
    </MainLayout>
  );
}
