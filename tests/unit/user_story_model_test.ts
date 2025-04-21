// tests/unit/user_story_model_test.ts
import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { createUserStory, getUserStoryById, UserStoryPriority, UserStoryStatus } from "../../models/userStory.ts";
import { createUser, UserRole } from "../../models/user.ts";
import { createProject } from "../../models/project.ts";
import { setupTestDatabase, teardownTestDatabase } from "../setup.ts";

let kv: Deno.Kv;

Deno.test("User Story Model Tests", async (t) => {
  // Setup
  kv = await setupTestDatabase();

  // Tests
  await t.step("createUserStory should create a user story with correct data", async () => {
    // Create a product owner
    const productOwner = await createUser({
      username: "productowner",
      email: "po@example.com",
      password: "password123",
      role: UserRole.PRODUCT_OWNER,
    });

    // Create a project
    const project = await createProject({
      name: "User Story Test Project",
      description: "Project for testing user stories",
      createdBy: productOwner.id,
    });

    const userStoryData = {
      title: "Test User Story",
      description: "As a user, I want to test the system",
      acceptanceCriteria: "The test passes successfully",
      priority: UserStoryPriority.HIGH,
      points: 5,
      projectId: project.id,
    };

    const userStory = await createUserStory(userStoryData, productOwner.id);

    assertExists(userStory);
    assertEquals(userStory.title, userStoryData.title);
    assertEquals(userStory.description, userStoryData.description);
    assertEquals(userStory.acceptanceCriteria, userStoryData.acceptanceCriteria);
    assertEquals(userStory.priority, userStoryData.priority);
    assertEquals(userStory.points, userStoryData.points);
    assertEquals(userStory.projectId, project.id);
    assertEquals(userStory.createdBy, productOwner.id);
    assertEquals(userStory.status, UserStoryStatus.BACKLOG);
    assertExists(userStory.id);
    assertExists(userStory.createdAt);
    assertExists(userStory.updatedAt);
  });

  await t.step("getUserStoryById should return the correct user story", async () => {
    // Create a product owner
    const productOwner = await createUser({
      username: "anotherpo",
      email: "anotherpo@example.com",
      password: "password123",
      role: UserRole.PRODUCT_OWNER,
    });

    // Create a project
    const project = await createProject({
      name: "Another User Story Test Project",
      description: "Another project for testing user stories",
      createdBy: productOwner.id,
    });

    const userStoryData = {
      title: "Another Test User Story",
      description: "As a user, I want to test the system again",
      acceptanceCriteria: "The test passes successfully again",
      priority: UserStoryPriority.MEDIUM,
      points: 3,
      projectId: project.id,
    };

    const createdUserStory = await createUserStory(userStoryData, productOwner.id);
    const retrievedUserStory = await getUserStoryById(createdUserStory.id);

    assertExists(retrievedUserStory);
    assertEquals(retrievedUserStory?.id, createdUserStory.id);
    assertEquals(retrievedUserStory?.title, userStoryData.title);
    assertEquals(retrievedUserStory?.description, userStoryData.description);
  });

  // Teardown
  await teardownTestDatabase(kv);
});
