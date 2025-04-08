import { MainLayout } from "../layouts/MainLayout.tsx";
import LoginForm from "../islands/LoginForm.tsx";

export default function Login() {
  return (
    <MainLayout title="Iniciar Sesión - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-md mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h1>

          <LoginForm />

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a href="/register" class="text-blue-600 hover:underline">
                Registrarse
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
