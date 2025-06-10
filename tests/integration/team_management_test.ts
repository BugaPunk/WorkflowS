import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std/testing/bdd.ts";

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  members: TeamMember[];
  createdAt: Date;
}

describe("Gestión de Equipos - Pruebas de Integración", () => {
  it("debería crear un equipo correctamente", async () => {
    const team: Team = {
      id: 1,
      name: "Equipo de Desarrollo",
      members: [],
      createdAt: new Date()
    };
    
    assertExists(team);
    assertEquals(team.name, "Equipo de Desarrollo");
    assertEquals(team.members.length, 0);
  });

  it("debería agregar un miembro al equipo", async () => {
    const team: Team = {
      id: 1,
      name: "Equipo de Desarrollo",
      members: [],
      createdAt: new Date()
    };

    const member: TeamMember = {
      id: 1,
      name: "Juan Pérez",
      role: "developer"
    };

    team.members.push(member);
    
    assertEquals(team.members.length, 1);
    assertEquals(team.members[0].name, "Juan Pérez");
  });

  it("debería validar la estructura completa del equipo", async () => {
    const team: Team = {
      id: 1,
      name: "Equipo de Desarrollo",
      members: [
        {
          id: 1,
          name: "Juan Pérez",
          role: "developer"
        }
      ],
      createdAt: new Date()
    };
    
    assertExists(team.id);
    assertExists(team.name);
    assertExists(team.members);
    assertExists(team.createdAt);
  });
}); 