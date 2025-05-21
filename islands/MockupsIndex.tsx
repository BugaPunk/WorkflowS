import { useState } from "preact/hooks";
import ProjectMetricsDashboard from "../mockups/metrics/ProjectMetricsDashboard.tsx";
import GenerateReport from "../mockups/reports/GenerateReport.tsx";
import ReportsManagement from "../mockups/reports/ReportsManagement.tsx";
import BurndownChart from "../mockups/metrics/BurndownChart.tsx";
import TeamVelocityChart from "../mockups/metrics/TeamVelocityChart.tsx";
import WorkDistributionChart from "../mockups/metrics/WorkDistributionChart.tsx";
import ProjectHealthGauge from "../mockups/metrics/ProjectHealthGauge.tsx";

export default function MockupsIndex() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ProjectMetricsDashboard />;
      case "generate-report":
        return <GenerateReport />;
      case "reports-management":
        return <ReportsManagement />;
      case "burndown":
        return <BurndownChart />;
      case "velocity":
        return <TeamVelocityChart />;
      case "distribution":
        return <WorkDistributionChart />;
      case "health":
        return <ProjectHealthGauge />;
      default:
        return <div>Selecciona un mockup para visualizar</div>;
    }
  };
  
  return (
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="container mx-auto px-4 py-6">
          <h1 class="text-3xl font-bold text-gray-800">Mockups de Métricas y Reportes</h1>
          <p class="text-gray-600 mt-2">
            Visualización de las interfaces de usuario para la gestión de métricas y reportes
          </p>
        </div>
      </header>
      
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-wrap border-b mb-6">
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "dashboard"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard de Métricas
          </button>
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "generate-report"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("generate-report")}
          >
            Generar Reporte
          </button>
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium ${
              activeTab === "reports-management"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("reports-management")}
          >
            Gestión de Reportes
          </button>
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
        
        <div class="bg-white rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
