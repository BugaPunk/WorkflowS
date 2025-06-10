import { assertEquals, assertExists, assert } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std/testing/bdd.ts";

describe("Validación de Roles", () => {
  it("debería validar correctamente un rol de administrador", () => {
    const role = {
      id: 1,
      name: "admin",
      permissions: ["create_team", "delete_team", "manage_users"]
    };
    
    assertExists(role);
    assertEquals(role.name, "admin");
    assertEquals(role.permissions.length, 3);
  });

  it("debería validar correctamente un rol de miembro", () => {
    const role = {
      id: 2,
      name: "member",
      permissions: ["view_team", "update_tasks"]
    };
    
    assertExists(role);
    assertEquals(role.name, "member");
    assertEquals(role.permissions.length, 2);
  });

  it("debería validar que un rol tenga al menos un permiso", () => {
    const role = {
      id: 3,
      name: "viewer",
      permissions: ["view_team"]
    };
    
    assertExists(role);
    assert(role.permissions.length > 0, "El rol debe tener al menos un permiso");
  });
}); 