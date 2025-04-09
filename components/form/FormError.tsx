interface FormErrorProps {
  error: string | null;
}

export default function FormError({ error }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
    </div>
  );
}
