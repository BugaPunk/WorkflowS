export default function ProductOwnerWelcomeOptions() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <h3 class="font-bold text-lg mb-2">Mis Proyectos</h3>
        <p class="text-gray-600 mb-3">Visualiza y gestiona los proyectos donde eres Product Owner.</p>
        <a href="/projects" class="text-indigo-600 hover:underline">Ver proyectos →</a>
      </div>

      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 class="font-bold text-lg mb-2">Gestionar Historias de Usuario</h3>
        <p class="text-gray-600 mb-3">Crea y prioriza historias de usuario para tus proyectos.</p>
        <a href="#" class="text-green-600 hover:underline">Gestionar historias →</a>
      </div>

      <div class="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 class="font-bold text-lg mb-2">Backlog del Producto</h3>
        <p class="text-gray-600 mb-3">Administra el backlog de tus productos y prioriza funcionalidades.</p>
        <a href="#" class="text-amber-600 hover:underline">Ver backlog →</a>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 class="font-bold text-lg mb-2">Reportes de Avance</h3>
        <p class="text-gray-600 mb-3">Visualiza el progreso y estado actual de tus proyectos.</p>
        <a href="#" class="text-blue-600 hover:underline">Ver reportes →</a>
      </div>
    </div>
  );
}
