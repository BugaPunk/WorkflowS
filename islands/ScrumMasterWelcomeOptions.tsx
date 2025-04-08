export default function ScrumMasterWelcomeOptions() {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 class="font-bold text-lg mb-2">Mis Proyectos</h3>
        <p class="text-gray-600 mb-3">Visualiza y gestiona los proyectos donde eres Scrum Master.</p>
        <a href="/projects" class="text-blue-600 hover:underline">Ver proyectos →</a>
      </div>

      <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 class="font-bold text-lg mb-2">Gestionar Sprints</h3>
        <p class="text-gray-600 mb-3">Planifica y administra los sprints de tus proyectos.</p>
        <a href="#" class="text-purple-600 hover:underline">Gestionar sprints →</a>
      </div>

      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 class="font-bold text-lg mb-2">Reuniones Scrum</h3>
        <p class="text-gray-600 mb-3">Programa y gestiona las reuniones diarias, retrospectivas y planificaciones.</p>
        <a href="#" class="text-green-600 hover:underline">Gestionar reuniones →</a>
      </div>

      <div class="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 class="font-bold text-lg mb-2">Impedimentos</h3>
        <p class="text-gray-600 mb-3">Registra y da seguimiento a los impedimentos del equipo.</p>
        <a href="#" class="text-amber-600 hover:underline">Ver impedimentos →</a>
      </div>
    </div>
  );
}
