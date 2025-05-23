import type { FreshContext } from "$fresh/server.ts";
import WelcomeScreen from "../islands/welcome/WelcomeScreen.tsx";
import { MainLayout } from "../layouts/MainLayout.tsx";
import type { UserRole } from "../models/user.ts";
import { getSession } from "../utils/session.ts";

export const handler = {
  async GET(req: Request, ctx: FreshContext) {
    const session = await getSession(req);

    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/login",
        },
      });
    }

    return ctx.render({ session });
  },
};

interface WelcomeProps {
  session: {
    username: string;
    email: string;
    role: UserRole;
  };
}

export default function Welcome({ data }: { data: WelcomeProps }) {
  const { session } = data;

  return (
    <MainLayout title="Bienvenido - WorkflowS" session={session}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <WelcomeScreen session={session} />
        </div>
      </div>
    </MainLayout>
  );
}
