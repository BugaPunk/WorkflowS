// Validar que un campo no esté vacío
export function validateRequired(value: string, fieldName: string): string | undefined {
  if (!value || value.trim() === "") {
    return `El campo ${fieldName} es obligatorio`;
  }
  return undefined;
}

// Validar longitud mínima
export function validateMinLength(value: string, minLength: number, fieldName: string): string | undefined {
  if (value && value.length < minLength) {
    return `El campo ${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return undefined;
}

// Validar longitud máxima
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | undefined {
  if (value && value.length > maxLength) {
    return `El campo ${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return undefined;
}

// Validar email
export function validateEmail(value: string): string | undefined {
  if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return "El correo electrónico no es válido";
  }
  return undefined;
}

// Validar fechas
export function validateDateRange(startDate: string, endDate: string): string | undefined {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return "La fecha de finalización debe ser posterior a la fecha de inicio";
    }
  }
  return undefined;
}

// Validar que un campo sea un número
export function validateNumber(value: string, fieldName: string): string | undefined {
  if (value && isNaN(Number(value))) {
    return `El campo ${fieldName} debe ser un número`;
  }
  return undefined;
}

// Validar que un campo sea un número entero positivo
export function validatePositiveInteger(value: string, fieldName: string): string | undefined {
  if (value) {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      return `El campo ${fieldName} debe ser un número entero positivo`;
    }
  }
  return undefined;
}

// Combinar múltiples validaciones
export function validateField(value: string, validations: ((value: string) => string | undefined)[]): string | undefined {
  for (const validation of validations) {
    const error = validation(value);
    if (error) {
      return error;
    }
  }
  return undefined;
}
