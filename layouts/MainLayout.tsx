import type { ComponentChildren } from "preact";
import { Header } from "../components/Header.tsx";

interface MainLayoutProps {
  children: ComponentChildren;
  title?: string;
}

export function MainLayout({ children, title = "WorkflowS" }: MainLayoutProps) {
  return (
    <div class="flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow">
        {children}
      </main>
      <footer class="bg-gray-100 py-4 text-center text-gray-600">
        <div class="container mx-auto">
          <p>&copy; {new Date().getFullYear()} WorkflowS.</p>
        </div>
      </footer>
    </div>
  );
}
