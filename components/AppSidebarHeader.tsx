import type { JSX } from "preact";
import { SidebarTrigger } from "./ui/sidebar.tsx";

export function AppSidebarHeader(): JSX.Element {
  return (
    <header class="border-gray-200 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-4 sm:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div class="flex items-center gap-2 w-full">
        <SidebarTrigger class="-ml-1 lg:hidden" />
        <div class="flex items-center">
          <h1 class="text-base sm:text-lg font-semibold truncate">WorkflowS</h1>
        </div>
      </div>
    </header>
  );
}
