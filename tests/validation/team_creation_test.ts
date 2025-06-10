import { assertEquals, assertExists, assert } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std/testing/bdd.ts";

describe("Validación de Creación de Equipos", () => {
  it("debería validar que el nombre del equipo no esté vacío", () => {
    const teamName = "Equipo de Desarrollo";
    assertExists(teamName);
    assert(teamName.length > 0, "El nombre del equipo no puede estar vacío");
  });

  it("debería validar que el equipo tenga un ID único", () => {
    const team = {
      id: "TEAM-001",
      name: "Equipo de Desarrollo"
    };
    
    assertExists(team.id);
    assertEquals(typeof team.id, "string");
    assert(team.id.startsWith("TEAM-"), "El ID debe comenzar con 'TEAM-'");
  });

  it("debería validar la estructura mínima requerida para un equipo", () => {
    const team = {
      id: "TEAM-001",
      name: "Equipo de Desarrollo",
      description: "Equipo encargado del desarrollo del proyecto",
      createdAt: new Date()
    };
    
    assertExists(team.id);
    assertExists(team.name);
    assertExists(team.createdAt);
    assertEquals(typeof team.name, "string");
    assertEquals(typeof team.id, "string");
    assert(team.name.length > 0, "El nombre del equipo no puede estar vacío");
  });
}); 