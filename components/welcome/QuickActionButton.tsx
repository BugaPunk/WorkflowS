import { JSX } from "preact";

interface QuickActionButtonProps {
  href: string;
  icon: JSX.Element;
  label: string;
}

export default function QuickActionButton({
  href,
  icon,
  label,
}: QuickActionButtonProps) {
  return (
    <a href={href} class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors">
      <div class="h-8 w-8 mx-auto mb-2 text-gray-700">
        {icon}
      </div>
      <span class="text-sm font-medium text-gray-700">{label}</span>
    </a>
  );
}
