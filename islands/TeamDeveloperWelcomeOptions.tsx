export default function TeamDeveloperWelcomeOptions() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 class="font-bold text-lg mb-2">Mis Proyectos</h3>
        <p class="text-gray-600 mb-3">Visualiza los proyectos en los que participas como desarrollador.</p>
        <a href="/projects" class="text-blue-600 hover:underline">Ver proyectos →</a>
      </div>

      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 class="font-bold text-lg mb-2">Mis Tareas</h3>
        <p class="text-gray-600 mb-3">Gestiona tus tareas asignadas y actualiza su progreso.</p>
        <a href="#" class="text-green-600 hover:underline">Ver tareas →</a>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 class="font-bold text-lg mb-2">Reportar Impedimentos</h3>
        <p class="text-gray-600 mb-3">Informa sobre obstáculos que afectan tu trabajo.</p>
        <a href="#" class="text-purple-600 hover:underline">Reportar →</a>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 class="font-bold text-lg mb-2">Completar mi perfil</h3>
        <p class="text-gray-600 mb-3">Añade más información a tu perfil para mejorar tu experiencia.</p>
        <a href="#" class="text-blue-600 hover:underline">Editar perfil →</a>
      </div>
    </div>
  );
}
