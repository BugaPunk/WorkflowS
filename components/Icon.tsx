import type { ComponentType, JSX } from "preact";

interface IconProps {
  iconNode: ComponentType<JSX.HTMLAttributes<HTMLElement>>;
  class?: string;
}

export function Icon({ iconNode: IconComponent, class: className = "" }: IconProps) {
  return <IconComponent class={className} />;
}
