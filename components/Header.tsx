import { JSX } from "preact";

export function Header(): JSX.Element {
  return (
    <header class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <img
            src="/logo.svg"
            width="40"
            height="40"
            alt="WorkflowS Logo"
            class="mr-3"
          />
          <h1 class="text-2xl font-bold">WorkflowS</h1>
        </div>
        <nav>
          <ul class="flex space-x-6">
            <li><a href="/" class="hover:underline">Home</a></li>
            <li><a href="/about" class="hover:underline">About</a></li>
            <li><a href="/contact" class="hover:underline">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
