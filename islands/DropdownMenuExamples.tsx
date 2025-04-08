import DropdownMenu, { DropdownMenuSection } from "./DropdownMenu.tsx";

export default function DropdownMenuExamples() {
  // Ejemplo 1: Menú de productos
  const productMenuSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Storefront", href: "#storefront" },
        { label: "Warehouse", href: "#warehouse" },
        { label: "Stock", href: "#stock" },
      ],
    },
    {
      items: [
        { 
          label: "Delete", 
          isDanger: true, 
          onClick: () => alert("Eliminar producto") 
        },
      ],
    },
  ];

  // Ejemplo 2: Menú de usuario
  const userMenuSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Mi Perfil", href: "/profile" },
        { label: "Configuración", href: "/settings" },
        { label: "Mis Proyectos", href: "/projects" },
      ],
    },
    {
      items: [
        { 
          label: "Cerrar Sesión", 
          onClick: () => console.log("Cerrar sesión") 
        },
      ],
    },
  ];

  // Ejemplo 3: Menú de acciones de proyecto
  const projectActionsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Ver Detalles", href: "#details" },
        { label: "Editar Proyecto", onClick: () => console.log("Editar proyecto") },
        { label: "Asignar Usuarios", onClick: () => console.log("Asignar usuarios") },
      ],
    },
    {
      items: [
        { 
          label: "Archivar Proyecto", 
          onClick: () => console.log("Archivar proyecto") 
        },
        { 
          label: "Eliminar Proyecto", 
          isDanger: true, 
          onClick: () => console.log("Eliminar proyecto") 
        },
      ],
    },
  ];

  // Ejemplo 4: Menú de filtros con icono personalizado
  const filterMenuSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Todos los estados", onClick: () => console.log("Filtrar: Todos") },
        { label: "En Planificación", onClick: () => console.log("Filtrar: Planificación") },
        { label: "En Progreso", onClick: () => console.log("Filtrar: En Progreso") },
        { label: "Completados", onClick: () => console.log("Filtrar: Completados") },
      ],
    },
  ];

  const filterIcon = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      class="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  );

  return (
    <div class="p-6 space-y-8">
      <div>
        <h2 class="text-lg font-semibold mb-4">Ejemplo 1: Menú de Productos</h2>
        <DropdownMenu 
          buttonText="Producto" 
          sections={productMenuSections} 
        />
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-4">Ejemplo 2: Menú de Usuario (Alineado a la izquierda)</h2>
        <div class="flex justify-end">
          <DropdownMenu 
            buttonText="Usuario" 
            sections={userMenuSections} 
            align="left"
          />
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-4">Ejemplo 3: Acciones de Proyecto</h2>
        <DropdownMenu 
          buttonText="Acciones" 
          sections={projectActionsSections} 
        />
      </div>

      <div>
        <h2 class="text-lg font-semibold mb-4">Ejemplo 4: Filtros con Icono Personalizado</h2>
        <DropdownMenu 
          buttonText="Filtrar" 
          sections={filterMenuSections} 
          buttonIcon={filterIcon}
        />
      </div>
    </div>
  );
}
