// Este archivo contiene configuraciones específicas para Deno
export const denoConfig = {
  // Configuración para resolver módulos de Deno
  importMap: "./import_map.json",
  
  // Configuración para TypeScript
  compilerOptions: {
    jsx: "react-jsx",
    jsxImportSource: "preact",
  },
};
