import { Head } from "$fresh/runtime.ts";
import LoginForm from "../islands/LoginForm.tsx";

export default function Login() {
  return (
    <>
      <Head>
        <title>Iniciar Sesión - WorkflowS</title>
      </Head>
      <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
