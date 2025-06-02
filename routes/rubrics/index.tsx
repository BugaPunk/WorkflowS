import type { FreshContext, PageProps } from "$fresh/server.ts";
import RubricsManager from "../../islands/Rubrics/RubricsManager.tsx";
import { MainLayout } from "../../layouts/MainLayout.tsx";
import { UserRole } from "../../models/user.ts";
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

    // Solo los profesores pueden acceder a la gestión de rúbricas
    if (
      session.role !== UserRole.ADMIN &&
      session.role !== UserRole.PRODUCT_OWNER &&
      session.role !== UserRole.SCRUM_MASTER
    ) {
      return new Response("", {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }

    return ctx.render({ session });
  },
};

export default function RubricsPage({ data }: PageProps<Data>) {
  const { session } = data;

  return (
    <MainLayout title="Gestión de Rúbricas - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Gestión de Rúbricas</h1>

        <RubricsManager session={session} />
      </div>
    </MainLayout>
  );
}
