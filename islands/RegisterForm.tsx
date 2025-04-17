import { useState } from "preact/hooks";
import { UserRole } from "../db/schema.ts";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(UserRole.ADMINISTRATOR);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Registro exitoso! Redirigiendo al inicio de sesión...");
        // Limpiar el formulario
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole(UserRole.ADMINISTRATOR);
        
        // Redireccionar después de 2 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
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
            for="role"
            class="block text-sm font-medium text-gray-700"
          >
            Elige tu Rol
          </label>
          <div class="mt-1">
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.currentTarget.value as UserRole)}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value={UserRole.TEAM_DEVELOPER}>
                Team Developer - Miembro del equipo de desarrollo
              </option>
              <option value={UserRole.SCRUM_MASTER}>
                Scrum Master - Facilitador para el equipo de desarrollo
              </option>
              <option value={UserRole.PRODUCT_OWNER}>
                Product Owner - Representa a los interesados
              </option>
              <option value={UserRole.ADMINISTRATOR}>
                Administrator - Administrador del sistema con acceso completo
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <div class="mt-1">
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onInput={(e) => setFirstName(e.currentTarget.value)}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700"
            >
              Apellido
            </label>
            <div class="mt-1">
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onInput={(e) => setLastName(e.currentTarget.value)}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700"
          >
            Nombre de Usuario
          </label>
          <div class="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onInput={(e) => setUsername(e.currentTarget.value)}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700"
          >
            Correo Electrónico
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onInput={(e) => setEmail(e.currentTarget.value)}
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
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700"
          >
            Confirmar Contraseña
          </label>
          <div class="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              minLength={6}
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
            {isLoading ? "Registrando..." : "Registrarse"}
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
              ¿Ya tienes una cuenta?
            </span>
          </div>
        </div>

        <div class="mt-6">
          <a
            href="/login"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  );
}
