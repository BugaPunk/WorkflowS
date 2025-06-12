// deno-lint-ignore-file no-explicit-any
// Imports
import { createUser, User, UserRole } from "../models/user.ts";
import { createProject, Project } from "../models/project.ts";
import { createSprint, Sprint, SprintStatus, addUserStoryToSprint } from "../models/sprint.ts";
import { createUserStory, UserStory, UserStoryStatus, UserStoryPriority, updateUserStory } from "../models/userStory.ts";
import { createTask, Task, TaskStatus } from "../models/task.ts";
import { updateUserStoryStatusBasedOnTasks } from "../services/userStoryStatusService.ts";
import { getKv } from "../utils/db.ts"; // Added for direct KV access
import { createRubricWithDefaults, Rubric, RubricCriterion, RubricLevel, RubricStatus } from "../models/rubric.ts";
import { createDeliverable, Deliverable } from "../models/deliverable.ts";
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
  const createdProjectsMap: Map<string, Project> = new Map(); // To store created projects by name/key
  const createdRubricsMap: Map<string, Rubric> = new Map();
  const createdDeliverablesMap: Map<string, Deliverable & Task> = new Map(); // Deliverables are also tasks

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
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
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
      refName: "standardFeatureRubric",
      name: "Standard Feature Implementation Rubric",
      description: "A standard rubric for evaluating feature implementations.",
      status: RubricStatus.ACTIVE,
      projectKey: "ECOMM", // Link to a specific project by its key or use a global rubric by leaving projectId null
      createdByRef: "sm_bob",
      criteria: [
        { name: "Functionality", description: "The feature works as expected.", weight: 0.4, maxPoints: 10,
          levels: [ { score: 0, description: "Non-functional" }, { score: 5, description: "Partially functional" }, { score: 10, description: "Fully functional" }] },
        { name: "Code Quality", description: "The code is clean, well-structured, and maintainable.", weight: 0.3, maxPoints: 10,
          levels: [ { score: 0, description: "Poor" }, { score: 5, description: "Acceptable" }, { score: 10, description: "Excellent" }] },
        { name: "Testing", description: "Adequate tests are provided.", weight: 0.3, maxPoints: 10,
          levels: [ { score: 0, description: "No tests" }, { score: 5, description: "Some tests" }, { score: 10, description: "Comprehensive tests" }] },
      ],
    }
  ];

  // --- 2. Create Rubrics ---
  console.log("\nCreating Rubrics...");
  try {
    for (const rubricDef of rubricsData) {
      const project = createdProjectsMap.get(rubricDef.projectKey); // This relies on projects being created first if projectKey is used.
                                                                  // If projectKey is not found, this rubric could be considered global or skip project linking.

      const rubricToCreateData = {
        name: rubricDef.name,
        description: rubricDef.description,
        status: rubricDef.status,
        projectId: project?.id, // Link to project if project was found
        criteria: rubricDef.criteria.map(c => ({
            ...c,
            id: crypto.randomUUID(), // Model should handle ID generation if using createModel
            levels: c.levels.map(l => ({...l, id: crypto.randomUUID() }))
        })),
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


  // --- Project Definitions (Modified for Deliverables) ---
  const projectsData = [
    {
      projectName: "E-commerce Platform",
      projectKey: "ECOMM", // Used as ref for rubrics
      description: "Next-generation online shopping platform...",
      productOwnerRef: "po_alice",
      scrumMasterRef: "sm_bob",
      memberRefs: ["dev_charlie", "dev_diana", "tester_eve"],
      creatorRef: "admin",
      sprints: [
        {
          sprintName: "ECOMM Sprint 1 - MVP User & Product Setup",
          goal: "Core user authentication, product catalog display, and basic cart functionality.",
          status: SprintStatus.COMPLETED, startDateOffset: -28, endDateOffset: -14,
          userStories: [
            {
              title: "US1: User Registration & Login",
              description: "As a new user...",
              acceptanceCriteria: "1. User can register...",
              priority: UserStoryPriority.CRITICAL, points: 8, status: UserStoryStatus.DONE,
              assigneeRef: "dev_charlie", creatorRef: "po_alice",
              tasks: [
                // ... other tasks ...
                {
                  refName: "authQaDeliverable", // Reference name for this deliverable
                  title: "T1.6: Perform QA testing on auth flow", status: TaskStatus.DONE, assignedToRef: "tester_eve", points: 2, spentHours: 6, description: "Verify complete authentication functionality.",
                  isDesignatedDeliverable: true,
                  deliverableType: "QA_Report", // Example custom field for deliverable
                  submissionInstructions: "Submit QA report document and test execution logs.",
                  dueDate: getRelativeDate(-15).getTime(), // Due during Sprint 1
                  submittedAt: getRelativeDate(-14).getTime(),
                  submittedByRef: "tester_eve"
                },
              ]
            },
            // ... other user stories for Sprint 1 ...
             {
              title: "US2: Product Listing Page",
              description: "As a shopper, I want to view a list of available products, so I can browse and find items I'm interested in.",
              acceptanceCriteria: "1. Products are displayed in a grid or list view.\n2. Each product shows image, name, price.\n3. Basic pagination is implemented if many products.",
              priority: UserStoryPriority.HIGH,
              points: 5,
              status: UserStoryStatus.DONE,
              assigneeRef: "dev_diana",
              creatorRef: "po_alice",
              tasks: [
                { title: "T2.1: Design product listing UI", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 2, spentHours: 3 },
                { title: "T2.2: API to fetch product list", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 5 },
                { title: "T2.3: Frontend for product grid/list", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 6 },
                { title: "T2.4: QA for product listing", status: TaskStatus.DONE, assignedToRef: "tester_eve", points: 1, spentHours: 3 },
              ]
            },
          ]
        },
        // ... other sprints ...
        {
          sprintName: "ECOMM Sprint 2 - Cart & Checkout Foundations",
          goal: "Implement add to cart, view cart, and initial checkout process.",
          status: SprintStatus.ACTIVE, startDateOffset: -13, endDateOffset: 1,
          userStories: [
            {
              title: "US3: Add to Shopping Cart",
              description: "As a shopper, I want to add products to my shopping cart, so I can purchase them later.",
              acceptanceCriteria: "1. 'Add to Cart' button on product page.\n2. Cart icon updates with item count.\n3. Product is added to the session/user cart.",
              priority: UserStoryPriority.CRITICAL, points: 5, status: UserStoryStatus.IN_PROGRESS,
              assigneeRef: "dev_charlie", creatorRef: "po_alice",
              tasks: [
                { title: "T3.1: Design cart interaction UI", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 1, spentHours: 2 },
                { title: "T3.2: API for adding item to cart", status: TaskStatus.IN_PROGRESS, assignedToRef: "dev_charlie", points: 2, spentHours: 4 },
                { title: "T3.3: Frontend 'Add to Cart' button logic", status: TaskStatus.TO_DO, assignedToRef: "dev_diana", points: 2, spentHours: 0 },
                { title: "T3.4: QA for add to cart", status: TaskStatus.TO_DO, assignedToRef: "tester_eve", points: 1, spentHours: 0 },
              ]
            },
            {
              title: "US4: View Shopping Cart",
              description: "As a shopper, I want to view the contents of my shopping cart, so I can review items before checkout.",
              acceptanceCriteria: "1. Link to cart page is available.\n2. Cart page lists all items, quantities, prices.\n3. Ability to update quantity or remove items.",
              priority: UserStoryPriority.HIGH, points: 8, status: UserStoryStatus.PLANNED,
              assigneeRef: "dev_diana", creatorRef: "po_alice",
              tasks: [
                { title: "T4.1: Design cart page UI", status: TaskStatus.TO_DO, assignedToRef: "dev_charlie", points: 2 },
                { title: "T4.2: API for retrieving cart contents", status: TaskStatus.TO_DO, assignedToRef: "dev_diana", points: 3 },
                { title: "T4.3: Frontend for cart display & modification", status: TaskStatus.TO_DO, assignedToRef: "dev_diana", points: 3 },
              ]
            }
          ]
        },
        {
          sprintName: "ECOMM Sprint 3 - Future Sprint (Planned)",
          goal: "Implement payment integration and order history.",
          status: SprintStatus.PLANNED, startDateOffset: 2, endDateOffset: 16,
          userStories: [
            {
              title: "US5: Payment Gateway Integration",
              description: "As a shopper, I want to securely pay for my order, so I can complete my purchase.",
              acceptanceCriteria: "1. Integration with Stripe/PayPal (mock).\n2. Secure handling of payment info.",
              priority: UserStoryPriority.CRITICAL, points: 13, status: UserStoryStatus.BACKLOG,
              assigneeRef: "dev_charlie", creatorRef: "po_alice", tasks: []
            }
          ]
        }
      ],
      backlogUserStories: [
        {
          title: "US_B1: Product Reviews & Ratings",
          description: "As a shopper, I want to read and write product reviews...",
          acceptanceCriteria: "1. Users can submit star ratings...",
          priority: UserStoryPriority.MEDIUM, points: 8, status: UserStoryStatus.BACKLOG,
          creatorRef: "po_alice",
          tasks: [
            { title: "TB1.1: Design review submission form", status: TaskStatus.TO_DO, points: 2 },
            { title: "TB1.2: API for submitting reviews", status: TaskStatus.TO_DO, points: 3 },
            { title: "TB1.3: Display reviews on product page", status: TaskStatus.TO_DO, points: 3 },
          ]
        },
         {
          title: "US_B2: AI-Powered Product Recommendations",
          description: "As a shopper, I want to see personalized product recommendations, so I can discover new items I might like.",
          acceptanceCriteria: "1. 'Recommended for you' section on homepage/product pages.\n2. Recommendations are based on browsing/purchase history (simulated).",
          priority: UserStoryPriority.HIGH, points: 13, status: UserStoryStatus.BACKLOG,
          creatorRef: "po_alice", tasks: []
        }
      ]
    },
  ];

  // --- 3. Create Projects, Sprints, User Stories, Tasks & Deliverables ---
  for (const projectData of projectsData) {
    console.log(`\nCreating Project: ${projectData.projectName}`);
    try {
      const project = await createProject({
        name: projectData.projectName,
        projectKey: projectData.projectKey,
        description: projectData.description,
        productOwnerId: createdUsers[projectData.productOwnerRef].id,
        scrumMasterId: createdUsers[projectData.scrumMasterRef].id,
        memberIds: projectData.memberRefs.map(ref => createdUsers[ref].id),
        createdBy: createdUsers[projectData.creatorRef].id,
      });
      createdProjectsMap.set(projectData.projectKey, project);
      console.log(`Created Project: ${project.name} (ID: ${project.id})`);

      for (const sprintData of projectData.sprints) {
        console.log(`  Creating Sprint: ${sprintData.sprintName} for project ${project.name}`);
        const sprintCreator = sprintData.creatorRef ? createdUsers[sprintData.creatorRef] : createdUsers[projectData.scrumMasterRef];
        const sprint = await createSprint({
          name: sprintData.sprintName, goal: sprintData.goal, projectId: project.id, status: sprintData.status,
          startDate: getRelativeDate(sprintData.startDateOffset).getTime(), endDate: getRelativeDate(sprintData.endDateOffset).getTime(),
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
          console.log(`    Created User Story: ${userStory.title} (ID: ${userStory.id}), added to Sprint ${sprint.name}, status: ${usData.status}`);

          for (const taskData of usData.tasks || []) {
            const taskCreator = taskData.creatorRef ? createdUsers[taskData.creatorRef] : createdUsers[projectData.scrumMasterRef];
            if (taskData.isDesignatedDeliverable) {
              console.log(`      Creating Deliverable from Task: ${taskData.title}`);
              const deliverableData = {
                title: taskData.title,
                description: taskData.description || "",
                status: taskData.status, // TaskStatus can map to DeliverableStatus if they are aligned
                userStoryId: userStory.id,
                projectId: project.id,
                assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
                createdBy: taskCreator.id,
                // deliverableType: taskData.deliverableType, // Removed: Assuming this is not part of DeliverableData schema
                submissionInstructions: taskData.submissionInstructions,
                dueDate: taskData.dueDate,
                submittedAt: taskData.submittedAt,
                submittedBy: taskData.submittedByRef ? createdUsers[taskData.submittedByRef]?.id : undefined,
                // Assuming createDeliverable handles Model properties like id, createdAt, updatedAt
              };
              const newDeliverable = createDeliverable(deliverableData); // This should prepare the object with an ID.
              await kv.set(["deliverables", newDeliverable.id], newDeliverable);
              if(taskData.refName) createdDeliverablesMap.set(taskData.refName, newDeliverable as Deliverable & Task);
              console.log(`      Created Deliverable: ${newDeliverable.title} (ID: ${newDeliverable.id})`);
            } else {
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
      // ... (Backlog User Stories loop - similar task/deliverable logic would apply if backlog items can be deliverables) ...
       for (const usData of projectData.backlogUserStories || []) {
        console.log(`    Creating Backlog User Story: ${usData.title} for project ${project.name}`);
        const usCreator = usData.creatorRef ? createdUsers[usData.creatorRef] : createdUsers[projectData.productOwnerRef];
        const userStory = await createUserStory({
          title: usData.title, description: usData.description, acceptanceCriteria: usData.acceptanceCriteria,
          priority: usData.priority, points: usData.points, projectId: project.id, status: usData.status || UserStoryStatus.BACKLOG,
        }, usCreator.id);

        if (usData.assigneeRef && createdUsers[usData.assigneeRef]) {
            await updateUserStory(userStory.id, { assignedTo: createdUsers[usData.assigneeRef].id });
        }
        console.log(`    Created Backlog User Story: ${userStory.title} (ID: ${userStory.id})`);

        for (const taskData of usData.tasks || []) {
           const taskCreator = taskData.creatorRef ? createdUsers[taskData.creatorRef] : createdUsers[projectData.scrumMasterRef];
            if (taskData.isDesignatedDeliverable) {
              // Simplified: In a real scenario, ensure backlog deliverables make sense contextually
              console.log(`      Creating Deliverable from Backlog Task: ${taskData.title}`);
               const deliverableData = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, projectId: project.id,
                assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
                createdBy: taskCreator.id,
                // deliverableType: taskData.deliverableType, // Removed: Assuming this is not part of DeliverableData schema
                submissionInstructions: taskData.submissionInstructions, dueDate: taskData.dueDate,
              };
              const newDeliverable = createDeliverable(deliverableData);
              await kv.set(["deliverables", newDeliverable.id], newDeliverable);
               if(taskData.refName) createdDeliverablesMap.set(taskData.refName, newDeliverable as Deliverable & Task);
              console.log(`      Created Deliverable (from backlog): ${newDeliverable.title} (ID: ${newDeliverable.id})`);
            } else {
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
    } catch (error) {
      console.error(`Error creating project ${projectData.projectName}:`, error);
    }
  }

  // --- Evaluation Definitions ---
  const evaluationsData = [
    {
      deliverableRef: "authQaDeliverable", // Refers to task T1.6
      rubricRef: "standardFeatureRubric",
      evaluatorRef: "sm_bob", // Scrum master evaluates
      studentRef: "tester_eve", // Eve submitted the QA report
      status: EvaluationStatus.COMPLETED,
      feedback: "Good QA coverage. Some edge cases could be explored further in next iterations.",
      evaluatedAtTimestamp: getRelativeDate(-13).getTime(), // Evaluated after submission
      criteriaEvaluations: [ // Must match criteria in 'standardFeatureRubric' by order or ideally by ID if refs were used
        { criterionName: "Functionality", score: 10, comments: "All auth flows work as expected." },
        { criterionName: "Code Quality", score: 8, comments: "Test scripts are clear (assuming QA report is code-like)." }, // N/A if not code
        { criterionName: "Testing", score: 9, comments: "Comprehensive test cases executed and documented." },
      ]
    }
  ];

  // --- 4. Create Evaluations ---
  console.log("\nCreating Evaluations...");
  try {
    for (const evalDef of evaluationsData) {
      const deliverable = createdDeliverablesMap.get(evalDef.deliverableRef);
      const rubric = createdRubricsMap.get(evalDef.rubricRef);
      const student = createdUsers[evalDef.studentRef];
      const evaluator = createdUsers[evalDef.evaluatorRef];

      if (!deliverable || !rubric || !student || !evaluator) {
        console.warn(`Skipping evaluation for deliverable ref "${evalDef.deliverableRef}" or rubric ref "${evalDef.rubricRef}" due to missing entities.`);
        continue;
      }

      // Ensure criteria evaluations align with rubric criteria for maxPossibleScore and totalScore calculation
      let maxPossibleScore = 0;
      let totalScore = 0;
      const populatedCriteriaEvals = rubric.criteria.map((rubricCriterion, index) => {
        const evalCriterion = evalDef.criteriaEvaluations.find(ec => ec.criterionName === rubricCriterion.name) || evalDef.criteriaEvaluations[index];
        maxPossibleScore += rubricCriterion.maxPoints;
        const currentScore = evalCriterion?.score || 0;
        totalScore += currentScore;
        return {
          criterionId: rubricCriterion.id, // Link to the actual criterion ID from the rubric
          criterionName: rubricCriterion.name,
          score: currentScore,
          levelDescription: rubricCriterion.levels.find(l => l.score === currentScore)?.description || "N/A",
          comments: evalCriterion?.comments || "",
        };
      });

      const evaluationToCreateData = {
        deliverableId: deliverable.id,
        rubricId: rubric.id,
        evaluatorId: evaluator.id,
        studentId: student.id,
        status: evalDef.status,
        feedback: evalDef.feedback,
        criteriaEvaluations: populatedCriteriaEvals,
        maxPossibleScore,
        totalScore,
        evaluatedAt: evalDef.evaluatedAtTimestamp || Date.now(),
        projectId: deliverable.projectId, // or rubric.projectId
      };

      const newEvaluation = createEvaluationWithDefaults(evaluationToCreateData);
      await kv.set(["evaluations", newEvaluation.id], newEvaluation);
      console.log(`Created Evaluation for Deliverable: ${deliverable.title} by ${evaluator.username} for ${student.username} (ID: ${newEvaluation.id})`);
    }
  } catch (error) {
    console.error("Error creating evaluations:", error);
  }

  console.log("\nAll sample data processed.");
}

// --- Main Execution ---
if (import.meta.main) {
  seedDatabase()
    .then(() => {
      console.log("\nDatabase seeding process finished successfully.");
    })
    .catch((err) => {
      console.error("\nCritical error during database seeding:", err);
    });
}
