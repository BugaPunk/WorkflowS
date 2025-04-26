import { JSX } from "preact";
import { ComponentChildren } from "preact";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  children: ComponentChildren;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  children,
  variant = "default",
  size = "default",
  class: className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "hover:bg-gray-100 hover:text-gray-900",
    outline: "border border-gray-300 hover:bg-gray-100 hover:text-gray-900"
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button class={classes} {...props}>
      {children}
    </button>
  );
}
