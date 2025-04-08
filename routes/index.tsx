import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { MainLayout } from "../layouts/MainLayout.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <MainLayout title="Home - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold mt-8 mb-4">Welcome to WorkflowS</h1>
          <p class="my-4 text-center">
            This is a Deno Fresh project restructured with a Laravel-like layout system.
            The header is now a reusable component that appears on all pages.
          </p>
          <Counter count={count} />
        </div>
      </div>
    </MainLayout>
  );
}
