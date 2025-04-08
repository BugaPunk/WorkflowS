import { PageProps } from "$fresh/server.ts";
import { MainLayout } from "../../layouts/MainLayout.tsx";

export default function Greet(props: PageProps) {
  const name = props.params.name;
  return (
    <MainLayout title={`Greet ${name} - WorkflowS`}>
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 my-8 text-center">
            <h1 class="text-4xl font-bold text-blue-600">Hello, {name}!</h1>
            <p class="my-4 text-gray-700">
              Welcome to our Laravel-style layout system.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
