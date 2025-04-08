export default function AdminWelcomeOptions() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 class="font-bold text-lg mb-2">Administrar Usuarios</h3>
        <p class="text-gray-600 mb-3">Visualiza y gestiona todos los usuarios registrados en el sistema.</p>
        <a href="/admin/users" class="text-purple-600 hover:underline">Ir a administración →</a>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 class="font-bold text-lg mb-2">Gestionar Proyectos</h3>
        <p class="text-gray-600 mb-3">Crea y asigna proyectos a los miembros del equipo.</p>
        <a href="/projects" class="text-blue-600 hover:underline">Ir a proyectos →</a>
      </div>

      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 class="font-bold text-lg mb-2">Reportes y Estadísticas</h3>
        <p class="text-gray-600 mb-3">Visualiza métricas y reportes sobre el progreso de los proyectos.</p>
        <a href="#" class="text-green-600 hover:underline">Ver reportes →</a>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 class="font-bold text-lg mb-2">Configuración del Sistema</h3>
        <p class="text-gray-600 mb-3">Personaliza la configuración general del sistema.</p>
        <a href="#" class="text-blue-600 hover:underline">Ir a configuración →</a>
      </div>
    </div>
  );
}
