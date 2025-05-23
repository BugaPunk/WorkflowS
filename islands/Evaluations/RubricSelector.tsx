import { useState, useEffect } from "preact/hooks";
import { type Rubric, RubricStatus } from "../../models/rubric.ts";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";

interface RubricSelectorProps {
  projectId?: string;
  onSelectRubric: (rubric: Rubric) => void;
  onCancel: () => void;
}

export default function RubricSelector({
  projectId,
  onSelectRubric,
  onCancel,
}: RubricSelectorProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [templates, setTemplates] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Cargar rúbricas
  useEffect(() => {
    const fetchRubrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar rúbricas del proyecto
        let projectRubricsUrl = "/api/rubrics";
        if (projectId) {
          projectRubricsUrl += `?projectId=${projectId}`;
        }
        
        const projectRubricsResponse = await fetch(projectRubricsUrl);
        
        if (!projectRubricsResponse.ok) {
          throw new Error(`Error al cargar rúbricas: ${projectRubricsResponse.statusText}`);
        }
        
        const projectRubricsData = await projectRubricsResponse.json();
        setRubrics(projectRubricsData);
        
        // Cargar plantillas de rúbricas
        const templatesResponse = await fetch("/api/rubrics?template=true");
        
        if (!templatesResponse.ok) {
          throw new Error(`Error al cargar plantillas: ${templatesResponse.statusText}`);
        }
        
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      } catch (err) {
        setError(err.message || "Error al cargar rúbricas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRubrics();
  }, [projectId]);

  // Filtrar rúbricas
  const filteredRubrics = (showTemplates ? templates : rubrics).filter(rubric => {
    return rubric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (rubric.description && rubric.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Renderizar estado de la rúbrica
  const renderStatus = (status: RubricStatus) => {
    switch (status) {
      case RubricStatus.DRAFT:
        return <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Borrador</span>;
      case RubricStatus.ACTIVE:
        return <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activa</span>;
      case RubricStatus.ARCHIVED:
        return <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Archivada</span>;
      default:
        return null;
    }
  };

  return (
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">
            Seleccionar Rúbrica para Evaluación
          </h2>
          <Button 
            variant="secondary" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setShowTemplates(false)}
              class={`px-4 py-2 rounded-md ${!showTemplates ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Rúbricas del Proyecto
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              class={`px-4 py-2 rounded-md ${showTemplates ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Plantillas
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Buscar rúbricas..."
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {loading ? (
        <div class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2 text-gray-600">Cargando rúbricas...</p>
        </div>
      ) : error ? (
        <div class="p-4 text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            class="mt-2 text-blue-600 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : filteredRubrics.length === 0 ? (
        <div class="p-8 text-center text-gray-500">
          <p>No se encontraron rúbricas{showTemplates ? " plantilla" : ""}.</p>
          {showTemplates ? (
            <p class="mt-2">
              Puedes crear plantillas de rúbricas en la sección de 
              <a href="/rubrics" class="text-blue-600 hover:underline ml-1">
                Gestión de Rúbricas
              </a>.
            </p>
          ) : (
            <p class="mt-2">
              Puedes crear rúbricas para este proyecto en la sección de 
              <a href="/rubrics" class="text-blue-600 hover:underline ml-1">
                Gestión de Rúbricas
              </a>.
            </p>
          )}
        </div>
      ) : (
        <ul class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredRubrics.map((rubric) => (
            <li key={rubric.id} class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-medium text-gray-900">
                      {rubric.name}
                    </h3>
                    {renderStatus(rubric.status)}
                    {rubric.isTemplate && (
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Plantilla</span>
                    )}
                  </div>
                  {rubric.description && (
                    <p class="mt-1 text-sm text-gray-600">{rubric.description}</p>
                  )}
                  <p class="mt-1 text-xs text-gray-500">
                    {rubric.criteria.length} criterios • 
                    {rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)} puntos posibles
                  </p>
                </div>
                
                <Button
                  onClick={() => onSelectRubric(rubric)}
                  variant="primary"
                  size="sm"
                >
                  Seleccionar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
