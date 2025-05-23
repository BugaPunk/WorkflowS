import type { Handlers, PageProps } from "$fresh/server.ts";
import { MainLayout } from "../../../layouts/MainLayout.tsx";
import { UserRole } from "../../../models/user.ts";
import { getUserStoryById } from "../../../models/userStory.ts";
import { getSession } from "../../../utils/session.ts";
import EditUserStoryForm from "../../../islands/UserStories/EditUserStoryForm.tsx";

interface EditUserStoryPageData {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  userStory: Awaited<ReturnType<typeof getUserStoryById>>;
}

export const handler: Handlers<EditUserStoryPageData | null> = {
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

    // Solo admin y product owner pueden editar historias de usuario
    if (session.role !== UserRole.ADMIN && session.role !== UserRole.PRODUCT_OWNER) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/unauthorized",
        },
      });
    }

    const { id } = ctx.params;
    const userStory = await getUserStoryById(id);

    if (!userStory) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/user-stories",
        },
      });
    }

    // Asegurarnos de que la sesión tenga el formato correcto para MainLayout
    const sessionData = {
      userId: session.userId,
      username: session.username,
      email: session.email,
      role: session.role as UserRole,
    };

    return ctx.render({ session: sessionData, userStory });
  },
};

export default function EditUserStoryPage({ data }: PageProps<EditUserStoryPageData | null>) {
  if (!data) {
    return (
      <MainLayout title="Error - WorkflowS">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>No se encontraron datos. Por favor, inténtalo de nuevo.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { session, userStory } = data;

  const handleSuccess = () => {
    // Redirigir a la página de detalles de la historia de usuario
    if (userStory) {
      globalThis.location.href = `/user-stories/${userStory.id}`;
    } else {
      globalThis.location.href = "/user-stories";
    }
  };

  const handleCancel = () => {
    // Volver a la página anterior
    globalThis.history.back();
  };

  // Si userStory es null, no debería llegar aquí debido a la redirección en el handler
  // pero TypeScript necesita esta verificación
  if (!userStory) {
    return (
      <MainLayout title="Historia de Usuario no encontrada - WorkflowS" session={session}>
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-screen-lg mx-auto">
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>No se encontró la historia de usuario. Por favor, vuelve al listado.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Editar Historia de Usuario: ${userStory.title} - WorkflowS`}
      session={session}
    >
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-lg mx-auto">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Editar Historia de Usuario</h1>
            <p class="text-gray-600">
              Modifica los detalles de la historia de usuario según sea necesario.
            </p>
          </div>

          <div class="bg-white shadow-md rounded-lg overflow-hidden p-6">
            <EditUserStoryForm
              userStory={userStory}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
