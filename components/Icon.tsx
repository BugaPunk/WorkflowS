import { JSX } from "preact";
import { ComponentType } from "preact";

interface IconProps {
  iconNode: ComponentType;
  class?: string;
}

export function Icon({ iconNode: IconComponent, class: className = "" }: IconProps) {
  return <IconComponent class={className} />;
}
