import { JSX } from "preact";

interface FormTextareaProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (e: Event) => void;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export default function FormTextarea({
  id,
  name,
  label,
  value,
  placeholder,
  required = false,
  error,
  onChange,
  rows = 4,
  disabled = false,
  className = "",
}: FormTextareaProps) {
  return (
    <div class={`mb-4 ${className}`}>
      <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
        {label}{required && <span class="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
          error ? "border-red-500" : ""
        }`}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        disabled={disabled}
      />
      {error && (
        <p class="text-red-500 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
}
