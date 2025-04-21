// tests/integration/project_member_flow_test.ts
import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { createUser, getUserById, UserRole } from "../../models/user.ts";
import { createProject, getProjectById, addProjectMember, ProjectRole } from "../../models/project.ts";
import { setupTestDatabase, teardownTestDatabase } from "../setup.ts";

let kv: Deno.Kv;

Deno.test("Project Member Assignment Flow", async (t) => {
  // Setup
  kv = await setupTestDatabase();

  await t.step("should update user role when assigned to project", async () => {
    // Arrange
    const adminUser = await createUser({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: UserRole.ADMIN,
    });

    const teamMember = await createUser({
      username: "teammember",
      email: "team@example.com",
      password: "team123",
      role: UserRole.TEAM_DEVELOPER,
    });

    const project = await createProject({
      name: "Test Project",
      description: "A test project",
      createdBy: adminUser.id,
    });

    // Act
    const projectMember = await addProjectMember({
      userId: teamMember.id,
      projectId: project.id,
      role: ProjectRole.SCRUM_MASTER,
    });

    // Assert
    assertExists(projectMember);
    assertEquals(projectMember.userId, teamMember.id);
    assertEquals(projectMember.projectId, project.id);
    assertEquals(projectMember.role, ProjectRole.SCRUM_MASTER);

    // Verify user role was updated
    const updatedUser = await getUserById(teamMember.id);
    assertExists(updatedUser);
    assertEquals(updatedUser.role, UserRole.SCRUM_MASTER);

    // Verify project members list was updated
    const updatedProject = await getProjectById(project.id);
    assertExists(updatedProject);
    assertEquals(updatedProject.members.length, 1);
  });

  // Teardown
  await teardownTestDatabase(kv);
});
