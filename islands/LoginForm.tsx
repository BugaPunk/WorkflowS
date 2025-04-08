import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

interface FormData {
  identifier: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    identifier: "",
    password: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
    
    // Clear error when field is edited
    if (error) {
      setError(null);
    }
  };
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.identifier || !formData.password) {
      setError("Por favor, completa todos los campos");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en el inicio de sesión");
        } catch (_e) {
          throw new Error(`Error en el inicio de sesión: ${response.statusText}`);
        }
      }
      
      // Redirect to welcome page on successful login
      window.location.href = "/welcome";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div class="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} class="space-y-4">
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
            Correo o Nombre de Usuario
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="identifier"
            name="identifier"
            type="text"
            placeholder="Correo o Nombre de Usuario"
            value={formData.identifier}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div class="flex items-center justify-between pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            class={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </div>
      </form>
    </div>
  );
}
