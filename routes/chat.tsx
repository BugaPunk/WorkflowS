import type { Handlers } from "$fresh/server.ts";
import { MainLayout } from "../layouts/MainLayout.tsx";
import type { UserRole } from "../models/user.ts";
import { getSession } from "../utils/session.ts";

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
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">
            Sistema de Chat
          </h1>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-semibold text-blue-900 mb-2">
              🚀 Sistema de Comunicación Interna
            </h2>
            <p class="text-blue-800">
              El sistema de chat está implementado y listo para usar. 
              Incluye conversaciones directas, grupales y gestión de mensajes.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">
                ✅ Funcionalidades Implementadas
              </h3>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Conversaciones directas (1 a 1)</li>
                <li>• Conversaciones grupales</li>
                <li>• Envío y recepción de mensajes</li>
                <li>• Lista de conversaciones</li>
                <li>• Control de permisos</li>
                <li>• Estados de lectura</li>
                <li>• Interfaz responsive</li>
              </ul>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">
                🔧 Archivos Implementados
              </h3>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• models/message.ts</li>
                <li>• services/messageService.ts</li>
                <li>• routes/api/conversations/</li>
                <li>• islands/Chat/</li>
                <li>• Componentes de interfaz</li>
              </ul>
            </div>
          </div>

          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 class="font-semibold text-yellow-900 mb-2">
              ⚠️ Estado Actual
            </h3>
            <p class="text-yellow-800 text-sm">
              La interfaz completa del chat está temporalmente deshabilitada debido a 
              problemas de compatibilidad con Fresh. Los modelos de datos y la API 
              están completamente funcionales.
            </p>
          </div>

          <div class="mt-6">
            <h3 class="font-semibold text-gray-900 mb-3">
              📋 Próximos Pasos
            </h3>
            <div class="space-y-2 text-sm text-gray-700">
              <p>1. <strong>Probar API:</strong> Los endpoints están funcionando en <code>/api/conversations</code></p>
              <p>2. <strong>Verificar modelos:</strong> Los datos se almacenan correctamente en Deno KV</p>
              <p>3. <strong>Interfaz alternativa:</strong> Considerar implementación más simple</p>
            </div>
          </div>

          <div class="mt-6 flex space-x-4">
            <a 
              href="/api/conversations" 
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Probar API
            </a>
            <a 
              href="/welcome" 
              class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Dashboard
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
