import { Button } from "../Button.tsx";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitText: string;
  submittingText: string;
  cancelText?: string;
  submitButtonClass?: string;
  cancelButtonClass?: string;
}

export default function FormActions({
  onCancel,
  isSubmitting,
  submitText,
  submittingText,
  cancelText = "Cancelar",
  submitButtonClass = "bg-blue-600 hover:bg-blue-700",
  cancelButtonClass = "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-400",
}: FormActionsProps) {
  return (
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-0 pt-4 border-t border-gray-200 mt-6">
      <Button
        type="button"
        onClick={onCancel}
        class={`${cancelButtonClass} font-bold py-2 px-4 rounded sm:mr-2 order-2 sm:order-1`}
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        class={`${submitButtonClass} text-white font-bold py-2 px-4 rounded order-1 sm:order-2 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? submittingText : submitText}
      </Button>
    </div>
  );
}
