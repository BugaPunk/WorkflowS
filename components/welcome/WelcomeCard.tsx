import type { JSX } from "preact";
import DropdownMenu, { type DropdownMenuSection } from "../../islands/DropdownMenu.tsx";

interface WelcomeCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
  linkText: string;
  linkHref: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  dropdownSections?: DropdownMenuSection[];
  dropdownButtonIcon?: JSX.Element;
}

export default function WelcomeCard({
  title,
  description,
  icon,
  linkText,
  linkHref,
  bgColor,
  borderColor,
  textColor,
  dropdownSections,
  dropdownButtonIcon,
}: WelcomeCardProps) {
  return (
    <div class={`${bgColor} p-5 rounded-lg border ${borderColor}`}>
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class={`font-bold text-lg ${textColor}`}>{title}</h3>
          <p class="text-gray-600 mt-1">{description}</p>
        </div>
        {icon}
      </div>
      <div class="flex justify-between items-center">
        <a href={linkHref} class={`${textColor} hover:underline`}>
          {linkText} →
        </a>
        {dropdownSections && (
          <DropdownMenu 
            buttonText="Opciones" 
            sections={dropdownSections} 
            buttonIcon={dropdownButtonIcon}
            className="ml-2"
          />
        )}
      </div>
    </div>
  );
}
