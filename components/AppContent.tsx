import type { JSX } from "preact";
import type { ComponentChildren } from "preact";
import { AppSidebarHeader } from "./AppSidebarHeader.tsx";

interface AppContentProps {
  children: ComponentChildren;
  variant?: "header" | "sidebar";
}

export function AppContent({ children, variant = "header" }: AppContentProps): JSX.Element {
  if (variant === "sidebar") {
    return (
      <div class="flex flex-col flex-1 w-full">
        <AppSidebarHeader />
        <div class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </div>
    );
  }

  return <div class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>;
}
