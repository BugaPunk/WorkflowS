/**
 * Combina múltiples clases de Tailwind en una sola cadena
 * @param classes Clases a combinar
 * @returns Cadena de clases combinadas
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
