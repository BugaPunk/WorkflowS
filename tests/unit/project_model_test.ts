// tests/unit/project_model_test.ts
import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { createProject, getProjectById, ProjectStatus, addProjectMember, ProjectRole } from "../../models/project.ts";
import { createUser, UserRole } from "../../models/user.ts";
import { setupTestDatabase, teardownTestDatabase } from "../setup.ts";

let kv: Deno.Kv;

Deno.test("Project Model Tests", async (t) => {
  // Setup
  kv = await setupTestDatabase();

  // Tests
  await t.step("createProject should create a project with correct data", async () => {
    // Create a user first
    const user = await createUser({
      username: "projectcreator",
      email: "creator@example.com",
      password: "password123",
      role: UserRole.ADMIN,
    });

    const projectData = {
      name: "Test Project",
      description: "This is a test project",
      status: ProjectStatus.PLANNING,
      createdBy: user.id,
    };

    const project = await createProject(projectData);

    assertEquals(project.name, projectData.name);
    assertEquals(project.description, projectData.description);
    assertEquals(project.status, projectData.status);
    assertEquals(project.createdBy, projectData.createdBy);
    assertExists(project.id);
    assertExists(project.createdAt);
    assertExists(project.updatedAt);
    assertEquals(project.members.length, 0);
  });

  await t.step("getProjectById should return the correct project", async () => {
    // Create a user first
    const user = await createUser({
      username: "projectuser",
      email: "projectuser@example.com",
      password: "password123",
      role: UserRole.ADMIN,
    });

    const projectData = {
      name: "Another Test Project",
      description: "This is another test project",
      status: ProjectStatus.PLANNING,
      createdBy: user.id,
    };

    const createdProject = await createProject(projectData);
    const retrievedProject = await getProjectById(createdProject.id);

    assertExists(retrievedProject);
    assertEquals(retrievedProject?.id, createdProject.id);
    assertEquals(retrievedProject?.name, projectData.name);
    assertEquals(retrievedProject?.description, projectData.description);
  });

  await t.step("addProjectMember should add a member to a project", async () => {
    // Create admin user
    const adminUser = await createUser({
      username: "admin",
      email: "admin@example.com",
      password: "password123",
      role: UserRole.ADMIN,
    });

    // Create team member
    const teamMember = await createUser({
      username: "teammember",
      email: "team@example.com",
      password: "password123",
      role: UserRole.TEAM_DEVELOPER,
    });

    // Create project
    const project = await createProject({
      name: "Member Test Project",
      description: "Project for testing member addition",
      status: ProjectStatus.PLANNING,
      createdBy: adminUser.id,
    });

    // Add team member to project
    const projectMember = await addProjectMember({
      userId: teamMember.id,
      projectId: project.id,
      role: ProjectRole.TEAM_MEMBER,
    });

    assertExists(projectMember);
    assertEquals(projectMember.userId, teamMember.id);
    assertEquals(projectMember.projectId, project.id);
    assertEquals(projectMember.role, ProjectRole.TEAM_MEMBER);

    // Get updated project to verify member was added
    const updatedProject = await getProjectById(project.id);
    assertExists(updatedProject);
    assertEquals(updatedProject.members.length, 1);
  });

  // Teardown
  await teardownTestDatabase(kv);
});
