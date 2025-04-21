// tests/basic_test.ts
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

// Una prueba simple para verificar que el entorno de pruebas funciona
Deno.test("basic test", () => {
  assertEquals(1 + 1, 2);
});
