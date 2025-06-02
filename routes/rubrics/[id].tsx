import type { FreshContext, PageProps } from "$fresh/server.ts";
import RubricDetailsPage from "../../islands/Rubrics/RubricDetailsPage.tsx";
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
  rubricId: string;
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

    const { id } = ctx.params;

    return ctx.render({ session, rubricId: id });
  },
};

export default function RubricPage({ data }: PageProps<Data>) {
  const { session, rubricId } = data;

  return (
    <MainLayout title="Detalles de Rúbrica - WorkflowS" session={session}>
      <div class="container mx-auto px-4 py-8">
        <RubricDetailsPage session={session} rubricId={rubricId} />
      </div>
    </MainLayout>
  );
}
