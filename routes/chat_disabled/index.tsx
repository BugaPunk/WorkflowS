import type { Handlers } from "$fresh/server.ts";
import ChatApp from "../../islands/Chat/ChatApp.tsx";
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

    return ctx.render({ session });
  },
};

interface ChatPageProps {
  data: {
    session: {
      userId: string;
      username: string;
      email: string;
      role: UserRole;
    };
  };
}

export default function ChatPage({ data }: ChatPageProps) {
  const { session } = data;

  return (
    <MainLayout title="Chat - WorkflowS" session={session}>
      {/* Chat ocupa toda la altura disponible sin padding */}
      <div class="h-[calc(100vh-4rem)] -m-6 bg-white">
        <ChatApp currentUserId={session.userId} />
      </div>
    </MainLayout>
  );
}
