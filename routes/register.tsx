import { Head } from "$fresh/runtime.ts";
import RegisterForm from "../islands/RegisterForm.tsx";

export default function Register() {
  return (
    <>
      <Head>
        <title>Registro - WorkflowS</title>
      </Head>
      <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una Cuenta
          </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
        </div>
      </div>
    </>
  );
}
