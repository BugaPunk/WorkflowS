import { useState } from "preact/hooks";

export default function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
        // Redireccionar después de 1 segundo
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      {message && (
        <div
          class={`mb-4 p-4 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form class="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            for="usernameOrEmail"
            class="block text-sm font-medium text-gray-700"
          >
            Nombre de Usuario o Correo Electrónico
          </label>
          <div class="mt-1">
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onInput={(e) => setUsernameOrEmail(e.currentTarget.value)}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <div class="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            class={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">
              ¿No tienes una cuenta?
            </span>
          </div>
        </div>

        <div class="mt-6">
          <a
            href="/register"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Registrarse
          </a>
        </div>
      </div>
    </div>
  );
}
