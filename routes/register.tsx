import RegisterForm from "../islands/RegisterForm.tsx";
import { MainLayout } from "../layouts/MainLayout.tsx";

export default function Register() {
  return (
    <MainLayout title="Registro - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-md mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Crear una Cuenta</h1>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-semibold text-blue-800 mb-2">Elige tu Rol</h2>
            <p class="text-sm text-blue-700 mb-2">
              Selecciona el rol que mejor describe tu posición en el equipo:
            </p>
            <ul class="text-sm text-blue-700 list-disc pl-5">
              <li>
                <strong>Team Developer</strong> - Miembro del equipo de desarrollo
              </li>
              <li>
                <strong>Scrum Master</strong> - Facilitador para el equipo de desarrollo
              </li>
              <li>
                <strong>Product Owner</strong> - Representa a los interesados
              </li>
              <li>
                <strong>Administrator</strong> - Administrador del sistema con acceso completo
              </li>
            </ul>
          </div>

          <RegisterForm />

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" class="text-blue-600 hover:underline">
                Iniciar sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
