import { Handlers } from "$fresh/server.ts";
import { getSession } from "../../utils/session.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { UserRole } from "../../models/user.ts";
import RubricCreatePage from "../../islands/Rubrics/RubricCreatePage.tsx";

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
    
    // Solo los profesores pueden crear rúbricas
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
    
    // Obtener parámetros opcionales
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const isTemplate = url.searchParams.get("template") === "true";
    
    return ctx.render({ session, projectId, isTemplate });
  },
};

interface RubricCreatePageProps {
  data: {
    session: {
      userId: string;
      username: string;
      email: string;
      role: UserRole;
    };
    projectId?: string;
    isTemplate?: boolean;
  };
}

export default function RubricCreate({ data }: RubricCreatePageProps) {
  const { session, projectId, isTemplate } = data;
  
  return (
    <MainLayout title="Crear Rúbrica - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Crear Nueva Rúbrica</h1>
        
        <RubricCreatePage 
          session={session} 
          projectId={projectId} 
          isTemplate={isTemplate} 
        />
      </div>
    </MainLayout>
  );
}
