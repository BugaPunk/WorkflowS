import type { ComponentChildren } from "preact";
import { Header } from "../components/Header.tsx";

interface PublicLayoutProps {
  children: ComponentChildren;
  title?: string;
}

export function PublicLayout({ children, title: _ = "WorkflowS" }: PublicLayoutProps) {
  return (
    <div class="flex min-h-screen w-full flex-col">
      <Header />
      <main class="flex-1">{children}</main>
      <footer class="bg-gray-100 py-4 text-center text-gray-600">
        <div class="container mx-auto">
          <p>&copy; {new Date().getFullYear()} WorkflowS.</p>
        </div>
      </footer>
    </div>
  );
}
