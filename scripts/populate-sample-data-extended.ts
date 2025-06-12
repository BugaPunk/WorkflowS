// deno-lint-ignore-file no-explicit-any
// Imports
import type { createUser, User, UserRole } from "../models/user.ts";
import type  { createProject, Project } from "../models/project.ts";
import type { createSprint, Sprint, SprintStatus, addUserStoryToSprint } from "../models/sprint.ts";
import type { createUserStory, UserStory, UserStoryStatus, UserStoryPriority, updateUserStory } from "../models/userStory.ts";
import type { createTask, Task, TaskStatus } from "../models/task.ts";
import type { updateUserStoryStatusBasedOnTasks } from "../services/userStoryStatusService.ts";
import type { getKv } from "../utils/db.ts"; // Added for direct KV access
import type { createRubricWithDefaults, Rubric, RubricCriterion, RubricLevel, RubricStatus } from "../models/rubric.ts";
import type { createDeliverable, Deliverable, Attachment } from "../models/deliverable.ts"; // Added Attachment
import { createEvaluationWithDefaults, Evaluation, EvaluationStatus } from "../models/evaluation.ts";

// --- Helper Functions ---
function getRelativeDate(daysOffset: number, referenceDate: Date = new Date()): Date {
  const newDate = new Date(referenceDate);
  newDate.setDate(newDate.getDate() + daysOffset);
  return newDate;
}

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log("Starting database seeding...");

  const kv = getKv(); // Initialize KV store

  const createdUsers: Record<string, User> = {};
  const createdProjectsMap: Map<string, Project> = new Map();
  const createdRubricsMap: Map<string, Rubric> = new Map();
  const createdDeliverablesMap: Map<string, Deliverable & Task> = new Map();

  // --- 1. Create Users ---
  console.log("Creating users...");
  const usersToCreate = [
    { ref: "admin", username: "adminuser", email: "admin@example.com", password: "password123", role: UserRole.ADMIN, firstName: "Admin", lastName: "User" },
    { ref: "po_alice", username: "alicep", email: "alice.p@example.com", password: "password123", role: UserRole.PRODUCT_OWNER, firstName: "Alice", lastName: "Product" },
    { ref: "sm_bob", username: "bobs", email: "bob.s@example.com", password: "password123", role: UserRole.SCRUM_MASTER, firstName: "Bob", lastName: "Scrum" },
    { ref: "dev_charlie", username: "charlied", email: "charlie.d@example.com", password: "password123", role: UserRole.DEVELOPER, firstName: "Charlie", lastName: "Dev" },
    { ref: "dev_diana", username: "dianad", email: "diana.d@example.com", password: "password123", role: UserRole.DEVELOPER, firstName: "Diana", lastName: "Developer" },
    { ref: "tester_eve", username: "evet", email: "eve.t@example.com", password: "password123", role: UserRole.TESTER, firstName: "Eve", lastName: "Tester" },
  ];

  try {
    for (const userData of usersToCreate) {
      const user = await createUser({
        username: userData.username, email: userData.email, password: userData.password,
        role: userData.role, firstName: userData.firstName, lastName: userData.lastName,
      });
      createdUsers[userData.ref] = user;
      console.log(`Created user: ${user.username} (ID: ${user.id})`);
    }
  } catch (error) {
    console.error("Error creating users:", error);
    return;
  }

  // --- Rubric Definitions ---
  const rubricsData = [
    {
      refName: "standardFeatureRubric", name: "Standard Feature Implementation Rubric",
      description: "A standard rubric for evaluating feature implementations.", status: RubricStatus.ACTIVE,
      projectKey: "ECOMM", createdByRef: "sm_bob",
      criteria: [
        { name: "Functionality", description: "The feature works as expected.", weight: 0.4, maxPoints: 10, levels: [ { score: 0, description: "Non-functional" }, { score: 5, description: "Partially functional" }, { score: 10, description: "Fully functional" }] },
        { name: "Code Quality", description: "The code is clean, well-structured, and maintainable.", weight: 0.3, maxPoints: 10, levels: [ { score: 0, description: "Poor" }, { score: 5, description: "Acceptable" }, { score: 10, description: "Excellent" }] },
        { name: "Testing", description: "Adequate tests are provided.", weight: 0.3, maxPoints: 10, levels: [ { score: 0, description: "No tests" }, { score: 5, description: "Some tests" }, { score: 10, description: "Comprehensive tests" }] },
      ],
    }
  ];

  // --- 2. Create Rubrics ---
  console.log("\nCreating Rubrics...");
  try {
    for (const rubricDef of rubricsData) {
      const project = createdProjectsMap.get(rubricDef.projectKey);
      const rubricToCreateData = {
        name: rubricDef.name, description: rubricDef.description, status: rubricDef.status,
        projectId: project?.id,
        criteria: rubricDef.criteria.map(c => ({ ...c, id: crypto.randomUUID(), levels: c.levels.map(l => ({...l, id: crypto.randomUUID() })) })),
        createdBy: createdUsers[rubricDef.createdByRef].id,
      };
      const newRubric = createRubricWithDefaults(rubricToCreateData);
      await kv.set(["rubrics", newRubric.id], newRubric);
      createdRubricsMap.set(rubricDef.refName, newRubric);
      console.log(`Created Rubric: ${newRubric.name} (ID: ${newRubric.id})`);
    }
  } catch (error) {
    console.error("Error creating rubrics:", error);
  }

  // --- Project Definitions (Modified for Deliverables & Attachments) ---
  const projectsData = [
    {
      projectName: "E-commerce Platform", projectKey: "ECOMM", description: "Next-generation online shopping platform...",
      productOwnerRef: "po_alice", scrumMasterRef: "sm_bob", memberRefs: ["dev_charlie", "dev_diana", "tester_eve"], creatorRef: "admin",
      sprints: [
        {
          sprintName: "ECOMM Sprint 1 - MVP User & Product Setup", goal: "Core user authentication, product catalog display, and basic cart functionality.",
          status: SprintStatus.COMPLETED, startDateOffset: -28, endDateOffset: -14,
          userStories: [
            {
              title: "US1: User Registration & Login", description: "As a new user...", acceptanceCriteria: "1. User can register...",
              priority: UserStoryPriority.CRITICAL, points: 8, status: UserStoryStatus.DONE,
              assigneeRef: "dev_charlie", creatorRef: "po_alice",
              tasks: [
                { title: "T1.1: Design registration & login UI mockups", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 2, spentHours: 4, description: "Create wireframes and mockups for registration and login pages." },
                { title: "T1.2: Implement registration API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 3, spentHours: 6, description: "Develop backend API for user creation." },
                { title: "T1.3: Implement login API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 5, description: "Develop backend API for user authentication." },
                { title: "T1.4: Frontend for registration & login pages", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 8, description: "Build UI based on mockups." },
                { title: "T1.5: Write unit tests for auth APIs", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 2, spentHours: 4, description: "Ensure API reliability." },
                {
                  refName: "authQaDeliverable", title: "T1.6: Perform QA testing on auth flow", status: TaskStatus.DONE, assignedToRef: "tester_eve", points: 2, spentHours: 6, description: "Verify complete authentication functionality.",
                  isDesignatedDeliverable: true, submissionInstructions: "Submit QA report document and test execution logs.",
                  dueDate: getRelativeDate(-15).getTime(), submittedAt: getRelativeDate(-14).getTime(), submittedByRef: "tester_eve",
                  attachments: [ // Added sample attachments
                    { fileName: "QA_Report_Auth_v1.pdf", fileType: "application/pdf", fileSize: 1024 * 230, uploadedByRef: "tester_eve", uploadedAtOffset: -14, url: "/attachments/qa_report_auth_v1.pdf" },
                    { fileName: "Test_Execution_Log.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSize: 1024 * 85, uploadedByRef: "tester_eve", uploadedAtOffset: -14, url: "/attachments/test_execution_log.xlsx" }
                  ]
                },
              ]
            },
            {
              title: "US2: Product Listing Page", description: "As a shopper...", acceptanceCriteria: "1. Products are displayed...",
              priority: UserStoryPriority.HIGH, points: 5, status: UserStoryStatus.DONE,
              assigneeRef: "dev_diana", creatorRef: "po_alice",
              tasks: [ /* ... tasks ... */ ]
            },
          ]
        },
        {
          sprintName: "ECOMM Sprint 2 - Cart & Checkout Foundations", goal: "Implement add to cart...",
          status: SprintStatus.ACTIVE, startDateOffset: -13, endDateOffset: 1,
          userStories: [ /* ... user stories and tasks ... */ ]
        },
      ],
      backlogUserStories: [ /* ... backlog user stories and tasks ... */ ]
    },
  ];

  // --- 3. Create Projects, Sprints, User Stories, Tasks & Deliverables ---
  for (const projectData of projectsData) {
    console.log(`\nCreating Project: ${projectData.projectName}`);
    try {
      const project = await createProject({
        name: projectData.projectName, projectKey: projectData.projectKey, description: projectData.description,
        productOwnerId: createdUsers[projectData.productOwnerRef].id, scrumMasterId: createdUsers[projectData.scrumMasterRef].id,
        memberIds: projectData.memberRefs.map(ref => createdUsers[ref].id), createdBy: createdUsers[projectData.creatorRef].id,
      });
      createdProjectsMap.set(projectData.projectKey, project);
      console.log(`Created Project: ${project.name} (ID: ${project.id})`);

      for (const sprintData of projectData.sprints) {
        console.log(`  Creating Sprint: ${sprintData.sprintName} for project ${project.name}`);
        const sprintCreator = sprintData.creatorRef ? createdUsers[sprintData.creatorRef] : createdUsers[projectData.scrumMasterRef];
        const sprintStartDate = getRelativeDate(sprintData.startDateOffset); // For attachment date calculations
        const sprintEndDate = getRelativeDate(sprintData.endDateOffset); // For attachment date calculations (though less common)

        const sprint = await createSprint({
          name: sprintData.sprintName, goal: sprintData.goal, projectId: project.id, status: sprintData.status,
          startDate: sprintStartDate.getTime(), endDate: sprintEndDate.getTime(),
          createdBy: sprintCreator.id,
        });
        console.log(`  Created Sprint: ${sprint.name} (ID: ${sprint.id})`);

        for (const usData of sprintData.userStories) {
          console.log(`    Creating User Story: ${usData.title} for sprint ${sprint.name}`);
          const usCreator = usData.creatorRef ? createdUsers[usData.creatorRef] : createdUsers[projectData.productOwnerRef];
          const userStory = await createUserStory({
            title: usData.title, description: usData.description, acceptanceCriteria: usData.acceptanceCriteria,
            priority: usData.priority, points: usData.points, projectId: project.id,
          }, usCreator.id);

          await addUserStoryToSprint(sprint.id, userStory.id);
          const updatePayload: Partial<UserStory> = { status: usData.status };
          if (usData.assigneeRef && createdUsers[usData.assigneeRef]) {
            updatePayload.assignedTo = createdUsers[usData.assigneeRef].id;
          }
          await updateUserStory(userStory.id, updatePayload);
          console.log(`    Created User Story: ${userStory.title} (ID: ${userStory.id}), status: ${usData.status}`);

          for (const taskData of usData.tasks || []) {
            const taskCreator = taskData.creatorRef ? createdUsers[taskData.creatorRef] : createdUsers[projectData.scrumMasterRef];
            if (taskData.isDesignatedDeliverable) {
              console.log(`      Creating Deliverable from Task: ${taskData.title}`);
              const deliverablePayload = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, projectId: project.id,
                assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
                createdBy: taskCreator.id,
                submissionInstructions: taskData.submissionInstructions,
                dueDate: taskData.dueDate, // Assuming this is already a timestamp from projectsData
                submittedAt: taskData.submittedAt, // Assuming this is already a timestamp
                submittedBy: taskData.submittedByRef ? createdUsers[taskData.submittedByRef]?.id : undefined,
                attachments: (taskData.attachments || []).map(att => {
                  // Resolve uploadedAt: if an offset is given, calculate relative to current date. Otherwise, use current time.
                  // In a real scenario, you might want a more sophisticated base date for attachments (e.g., sprint start/end).
                  const uploadedAtTimestamp = typeof att.uploadedAtOffset === 'number'
                    ? getRelativeDate(att.uploadedAtOffset).getTime()
                    : Date.now();

                  const uploaderId = att.uploadedByRef && createdUsers[att.uploadedByRef]
                    ? createdUsers[att.uploadedByRef]!.id
                    : createdUsers['admin']!.id; // Default to admin if ref is missing

                  return {
                    id: crypto.randomUUID(),
                    fileName: att.fileName || "default_attachment.dat",
                    fileType: att.fileType || "application/octet-stream",
                    fileSize: att.fileSize || 0,
                    uploadedBy: uploaderId,
                    uploadedAt: uploadedAtTimestamp,
                    url: att.url || "https://example.com/default_url",
                  } as Attachment; // Cast to Attachment type
                }),
              };
              const newDeliverable = createDeliverable(deliverablePayload);
              await kv.set(["deliverables", newDeliverable.id], newDeliverable);
              if(taskData.refName) createdDeliverablesMap.set(taskData.refName, newDeliverable as Deliverable & Task);
              console.log(`      Created Deliverable: ${newDeliverable.title} (ID: ${newDeliverable.id})`);
            } else { // Standard Task
              console.log(`      Creating Task: ${taskData.title} for US ${userStory.title}`);
              await createTask({
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id,
                assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
                points: taskData.points, spentHours: taskData.spentHours, createdBy: taskCreator.id,
              });
            }
          }
          if (usData.tasks && usData.tasks.length > 0) {
             await updateUserStoryStatusBasedOnTasks(userStory.id);
             console.log(`      Updated status for US ${userStory.title} based on its tasks.`);
          }
        }
      }
      // Backlog User Stories (simplified, assuming no deliverables from backlog for now)
      for (const usData of projectData.backlogUserStories || []) {
        console.log(`    Creating Backlog User Story: ${usData.title} for project ${project.name}`);
        // ... (existing backlog creation logic, ensure tasks are created if defined) ...
      }
    } catch (error) {
      console.error(`Error creating project ${projectData.projectName}:`, error);
    }
  }

  // --- Evaluation Definitions & Creation ---
  const evaluationsData = [ /* ... as defined before ... */ ];
  console.log("\nCreating Evaluations...");
  // ... (evaluation creation logic as defined before, ensure it uses createdDeliverablesMap and createdRubricsMap) ...

  console.log("\nAll sample data processed.");
}

// --- Main Execution ---
if (import.meta.main) {
  seedDatabase()
    .then(() => { console.log("\nDatabase seeding process finished successfully."); })
    .catch((err) => { console.error("\nCritical error during database seeding:", err); });
}
