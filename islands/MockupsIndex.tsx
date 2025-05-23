import { useState } from "preact/hooks";
import BurndownChart from "./Metrics/BurndownChart.tsx";
import ProjectHealthGauge from "./Metrics/ProjectHealthGauge.tsx";
import TeamVelocityChart from "./Metrics/TeamVelocityChart.tsx";
import WorkDistributionChart from "./Metrics/WorkDistributionChart.tsx";

export default function MockupsIndex() {
  const [activeTab, setActiveTab] = useState("burndown");

  const renderContent = () => {
    switch (activeTab) {
      case "burndown":
        return <BurndownChart sprintId="example-sprint-id" />;
      case "velocity":
        return <TeamVelocityChart projectId="example-project-id" />;
      case "distribution":
        return <WorkDistributionChart projectId="example-project-id" />;
      case "health":
        return <ProjectHealthGauge projectId="example-project-id" />;
      default:
        return <div>Selecciona un componente para visualizar</div>;
    }
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-6">
          <h1 class="text-3xl font-bold text-gray-800">Componentes de Métricas</h1>
          <p class="text-gray-600 mt-2">
            Visualización de los componentes de métricas implementados
          </p>
        </div>
      </header>

      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-wrap border-b mb-6">
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "burndown"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("burndown")}
          >
            Burndown Chart
          </button>
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "velocity"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("velocity")}
          >
            Velocidad del Equipo
          </button>
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "distribution"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("distribution")}
          >
            Distribución de Trabajo
          </button>
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "health"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("health")}
          >
            Salud del Proyecto
          </button>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">{renderContent()}</div>

        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-700">
            <strong>Nota:</strong> Esta es una vista de demostración que utiliza IDs de ejemplo.
            Para ver datos reales, accede a las métricas desde la sección de proyectos.
          </p>
        </div>
      </div>
    </div>
  );
}
