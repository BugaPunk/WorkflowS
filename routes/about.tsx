import { MainLayout } from "../layouts/MainLayout.tsx";

export default function About() {
  return (
    <MainLayout title="About - WorkflowS">
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto">
          <h1 class="text-4xl font-bold mb-6">About Us</h1>
          
          <div class="prose lg:prose-xl">
            <p class="mb-4">
              Welcome to WorkflowS, a modern web application built with Deno, Fresh, Preact, and Tailwind CSS.
              This project demonstrates a Laravel-like structure where views are rendered with a shared header component.
            </p>
            
            <h2 class="text-2xl font-semibold mt-6 mb-3">Our Technology Stack</h2>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Deno</strong> - A secure runtime for JavaScript and TypeScript</li>
              <li><strong>Fresh</strong> - A next-gen web framework for Deno</li>
              <li><strong>Preact</strong> - A fast 3kB alternative to React with the same API</li>
              <li><strong>Tailwind CSS</strong> - A utility-first CSS framework</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-6 mb-3">Project Structure</h2>
            <p class="mb-4">
              This project follows a Laravel-inspired structure:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>layouts/</strong> - Contains layout components</li>
              <li><strong>components/</strong> - Reusable UI components</li>
              <li><strong>routes/</strong> - Page components and API endpoints</li>
              <li><strong>islands/</strong> - Interactive components</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
