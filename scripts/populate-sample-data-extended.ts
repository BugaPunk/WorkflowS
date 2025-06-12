// Value Imports
import { createUser, UserRole } from "../models/user.ts";
import { createProject, ProjectStatus } from "../models/project.ts";
import { createSprint, SprintStatus, addUserStoryToSprint } from "../models/sprint.ts";
import { createUserStory, UserStoryStatus, UserStoryPriority, updateUserStory } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { updateUserStoryStatusBasedOnTasks } from "../services/userStoryStatusService.ts";
import { getKv } from "../utils/db.ts";
import { createRubricWithDefaults, RubricStatus } from "../models/rubric.ts";
import { createDeliverable } from "../models/deliverable.ts";
import { createEvaluationWithDefaults, EvaluationStatus } from "../models/evaluation.ts";

// Type Imports
import type { User } from "../models/user.ts";
import type { Project } from "../models/project.ts";
// import type { Sprint } from "../models/sprint.ts";
import type { UserStory } from "../models/userStory.ts";
import type { Task } from "../models/task.ts";
import type { Rubric, RubricCriterion, RubricCriterionLevel } from "../models/rubric.ts";
import type { Deliverable, Attachment } from "../models/deliverable.ts";
import type { Evaluation } from "../models/evaluation.ts";


// --- Helper Functions ---
function getRelativeDate(daysOffset: number, referenceDate: Date = new Date()): Date {
  const newDate = new Date(referenceDate);
  newDate.setDate(newDate.getDate() + daysOffset);
  return newDate;
}

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log("Starting database seeding...");

  const kv = getKv();

  const createdUsers: Record<string, User> = {};
  const createdProjectsMap: Map<string, Project> = new Map();
  const createdRubricsMap: Map<string, Rubric> = new Map();
  const createdDeliverablesMap: Map<string, Deliverable & Task> = new Map();

  const defaultAdminUserId = createdUsers['admin']?.id || 'bootstrap_admin_id'; // Ensure admin is created first

  // --- 1. Create Users ---
  console.log("Creating users...");
  const usersToCreate = [
    { ref: "admin", username: "adminuser", email: "admin@example.com", password: "password123", role: UserRole.ADMIN, firstName: "Admin", lastName: "User" },
    { ref: "po_alice", username: "alicep", email: "alice.p@example.com", password: "password123", role: UserRole.PRODUCT_OWNER, firstName: "Alice", lastName: "Product" },
    { ref: "sm_bob", username: "bobs", email: "bob.s@example.com", password: "password123", role: UserRole.SCRUM_MASTER, firstName: "Bob", lastName: "Scrum" },
    { ref: "dev_charlie", username: "charlied", email: "charlie.d@example.com", password: "password123", role: UserRole.TEAM_DEVELOPER, firstName: "Charlie", lastName: "Dev" },
    { ref: "dev_diana", username: "dianad", email: "diana.d@example.com", password: "password123", role: UserRole.TEAM_DEVELOPER, firstName: "Diana", lastName: "Developer" },
    { ref: "tester_eve", username: "evet", email: "eve.t@example.com", password: "password123", role: UserRole.TEAM_DEVELOPER, firstName: "Eve", lastName: "Tester" },
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
    if (!createdUsers['admin']) {
        console.error("FATAL: Admin user could not be created. Seeding cannot continue reliably.");
        return;
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
      projectKeyRef: "ECOMM",
      createdByRef: "sm_bob",
      criteria: [
        { name: "Functionality", description: "The feature works as expected.", weight: 0.4, maxPoints: 10, levels: [ { pointValue: 0, description: "Non-functional" }, { pointValue: 5, description: "Partially functional" }, { pointValue: 10, description: "Fully functional" }] },
        { name: "Code Quality", description: "The code is clean, well-structured, and maintainable.", weight: 0.3, maxPoints: 10, levels: [ { pointValue: 0, description: "Poor" }, { pointValue: 5, description: "Acceptable" }, { pointValue: 10, description: "Excellent" }] },
        { name: "Testing", description: "Adequate tests are provided.", weight: 0.3, maxPoints: 10, levels: [ { pointValue: 0, description: "No tests" }, { pointValue: 5, description: "Some tests" }, { pointValue: 10, description: "Comprehensive tests" }] },
      ],
    }
  ];

  // --- 2. Create Rubrics ---
  console.log("\nCreating Rubrics...");
  try {
    for (const rubricDef of rubricsData) {
      const project = createdProjectsMap.get(rubricDef.projectKeyRef);
      const creator = createdUsers[rubricDef.createdByRef];
      if (!creator) {
        console.warn(`WARN: Creator user ref '${rubricDef.createdByRef}' not found for rubric '${rubricDef.name}'. Skipping rubric.`);
        continue;
      }
      const processedCriteria = rubricDef.criteria.map(c => ({
        id: crypto.randomUUID(), name: c.name, description: c.description, weight: c.weight, maxPoints: c.maxPoints,
        levels: c.levels.map(l => ({ id: crypto.randomUUID(), pointValue: l.pointValue, description: l.description, })),
      }));
      const rubricToCreateData: Omit<Rubric, keyof Model | "id" | "createdAt" | "updatedAt" | "criteria"> & { criteria: RubricCriterion[] } = {
        name: rubricDef.name, description: rubricDef.description, status: rubricDef.status,
        projectId: project?.id, criteria: processedCriteria, createdBy: creator.id,
      };
      const newRubric = createRubricWithDefaults(rubricToCreateData);
      await kv.set(["rubrics", newRubric.id], newRubric);
      createdRubricsMap.set(rubricDef.refName, newRubric);
      console.log(`Created Rubric: ${newRubric.name} (ID: ${newRubric.id})`);
    }
  } catch (error) {
    console.error("Error creating rubrics:", error);
  }

  // --- Project Definitions ---
  const projectsData = [
    {
      projectName: "E-commerce Platform", status: ProjectStatus.IN_PROGRESS,
      description: "Next-generation online shopping platform...",
      productOwnerRef: "po_alice", scrumMasterRef: "sm_bob", memberRefs: ["dev_charlie", "dev_diana", "tester_eve"], creatorRef: "admin",
      sprints: [
        {
          sprintName: "ECOMM Sprint 1 - MVP User & Product Setup", goal: "Core user authentication, product catalog display, and basic cart functionality.",
          status: SprintStatus.COMPLETED, startDateOffset: -28, endDateOffset: -14, creatorRef: "sm_bob",
          userStories: [
            {
              title: "US1: User Registration & Login", description: "As a new user...", acceptanceCriteria: "1. User can register...",
              priority: UserStoryPriority.CRITICAL, points: 8, status: UserStoryStatus.DONE,
              assigneeRef: "dev_charlie", creatorRef: "po_alice",
              tasks: [
                { title: "T1.1: Design registration & login UI mockups", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 8, spentHours: 4, description: "Create wireframes and mockups for registration and login pages." },
                { title: "T1.2: Implement registration API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 12, spentHours: 6, description: "Develop backend API for user creation." },
                { title: "T1.3: Implement login API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_diana", estimatedHours: 10, spentHours: 5, description: "Develop backend API for user authentication." },
                { title: "T1.4: Frontend for registration & login pages", status: TaskStatus.DONE, assignedToRef: "dev_diana", estimatedHours: 16, spentHours: 8, description: "Build UI based on mockups." },
                { title: "T1.5: Write unit tests for auth APIs", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 8, spentHours: 4, description: "Ensure API reliability." },
                {
                  refName: "authQaDeliverable", title: "T1.6: Perform QA testing on auth flow", status: TaskStatus.DONE, assignedToRef: "tester_eve", estimatedHours: 8, spentHours: 6, description: "Verify complete authentication functionality.",
                  isDesignatedDeliverable: true, submissionInstructions: "Submit QA report document and test execution logs.",
                  dueDate: getRelativeDate(-15).getTime(), submittedAt: getRelativeDate(-14).getTime(), submittedByRef: "tester_eve",
                  attachments: [
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
              tasks: [ {title: "T2.1 Design UI", status: TaskStatus.DONE, assignedToRef:"dev_charlie", estimatedHours:4, spentHours:3} ]
            },
          ]
        },
        {
          sprintName: "ECOMM Sprint 2 - Cart & Checkout Foundations", goal: "Implement add to cart...",
          status: SprintStatus.ACTIVE, startDateOffset: -13, endDateOffset: 1, creatorRef: "sm_bob",
          userStories: [ {title: "US3: Add to Cart", description:"...", acceptanceCriteria:"...", priority: UserStoryPriority.CRITICAL, points:5, status: UserStoryStatus.IN_PROGRESS, assigneeRef:"dev_charlie", creatorRef:"po_alice", tasks: [{title:"T3.1 API", status:TaskStatus.IN_PROGRESS, assignedToRef:"dev_charlie", estimatedHours:8, spentHours:2}]} ]
        },
      ],
      backlogUserStories: [ {title:"US_B1: Reviews", description:"...", acceptanceCriteria:"...", priority:UserStoryPriority.MEDIUM, points:8, status:UserStoryStatus.BACKLOG, creatorRef:"po_alice", tasks:[{title:"TB1.1 API", status:TaskStatus.TO_DO, estimatedHours:6}]} ]
    },
  ];

  // --- 3. Create Projects, Sprints, User Stories, Tasks & Deliverables ---
  for (const projectData of projectsData) {
    console.log(`\nCreating Project: ${projectData.projectName}`);
    try {
      const productOwnerId = createdUsers[projectData.productOwnerRef]?.id || defaultAdminUserId;
      const scrumMasterId = createdUsers[projectData.scrumMasterRef]?.id || defaultAdminUserId;
      const createdById = createdUsers[projectData.creatorRef]?.id || defaultAdminUserId;

      const projectPayload = {
        name: projectData.projectName, description: projectData.description, status: projectData.status,
        productOwnerId, scrumMasterId,
        memberIds: projectData.memberRefs.map(ref => createdUsers[ref]?.id).filter(id => !!id) as string[],
        createdBy: createdById,
      };
      const project = await createProject(projectPayload);
      createdProjectsMap.set(projectData.projectName, project);
      console.log(`Created Project: ${project.name} (ID: ${project.id})`);

      for (const sprintData of projectData.sprints) {
        console.log(`  Creating Sprint: ${sprintData.sprintName} for project ${project.name}`);
        const sprintCreatorId = createdUsers[sprintData.creatorRef]?.id || scrumMasterId;
        const sprintStartDate = getRelativeDate(sprintData.startDateOffset);
        const sprintEndDate = getRelativeDate(sprintData.endDateOffset);

        const sprint = await createSprint({
          name: sprintData.sprintName, goal: sprintData.goal, projectId: project.id, status: sprintData.status,
          startDate: sprintStartDate.getTime(), endDate: sprintEndDate.getTime(), createdBy: sprintCreatorId,
        });
        console.log(`  Created Sprint: ${sprint.name} (ID: ${sprint.id})`);

        for (const usData of sprintData.userStories) {
          console.log(`    Creating User Story: ${usData.title} for sprint ${sprint.name}`);
          const usCreatorId = createdUsers[usData.creatorRef]?.id || productOwnerId;
          const userStory = await createUserStory({
            title: usData.title, description: usData.description, acceptanceCriteria: usData.acceptanceCriteria,
            priority: usData.priority, points: usData.points, projectId: project.id,
          }, usCreatorId);

          await addUserStoryToSprint(sprint.id, userStory.id);
          const updatePayload: Partial<UserStory> = { status: usData.status };
          const assignee = usData.assigneeRef ? createdUsers[usData.assigneeRef] : undefined;
          if (assignee) { updatePayload.assignedTo = assignee.id; }
          await updateUserStory(userStory.id, updatePayload);
          console.log(`    Created User Story: ${userStory.title} (ID: ${userStory.id}), status: ${usData.status}`);

          for (const taskData of usData.tasks || []) {
            let taskCreatorId = scrumMasterId;
            if (taskData.creatorRef && createdUsers[taskData.creatorRef]) {
              taskCreatorId = createdUsers[taskData.creatorRef].id;
            } else if (projectData.creatorRef && createdUsers[projectData.creatorRef]) {
              taskCreatorId = createdUsers[projectData.creatorRef].id;
            } else {
              taskCreatorId = createdUsers['admin']!.id;
            }

            if (taskData.isDesignatedDeliverable) {
              console.log(`      Creating Deliverable from Task: ${taskData.title}`);
              const deliverableAssignedToId = taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined;
              const deliverableSubmittedById = taskData.submittedByRef ? createdUsers[taskData.submittedByRef]?.id : undefined;

              const deliverablePayload: Omit<Deliverable, keyof Model | "id" | "createdAt" | "updatedAt" | "attachments" > & { attachments: Attachment[]; isDeliverable: true } = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, assignedTo: deliverableAssignedToId, createdBy: taskCreatorId,
                isDeliverable: true, submissionInstructions: taskData.submissionInstructions,
                dueDate: taskData.dueDate, submittedAt: taskData.submittedAt, submittedBy: deliverableSubmittedById,
                estimatedHours: taskData.estimatedHours, spentHours: taskData.spentHours,
                attachments: (taskData.attachments || []).map(att => {
                  const uploadedAtTimestamp = typeof att.uploadedAtOffset === 'number'
                    ? getRelativeDate(att.uploadedAtOffset).getTime() : Date.now();
                  const uploader = att.uploadedByRef ? createdUsers[att.uploadedByRef] : createdUsers['admin'];
                  return {
                    id: crypto.randomUUID(), fileName: att.fileName || "default_attachment.dat",
                    fileType: att.fileType || "application/octet-stream", fileSize: att.fileSize || 0,
                    uploadedBy: uploader?.id || defaultAdminUserId, uploadedAt: uploadedAtTimestamp,
                    url: att.url || "https://example.com/default_url",
                  };
                }),
              };
              const newDeliverable = await createDeliverable(deliverablePayload);
              await kv.set(["deliverables", newDeliverable.id], newDeliverable);
              if(taskData.refName) createdDeliverablesMap.set(taskData.refName, newDeliverable as Deliverable & Task);
              console.log(`      Created Deliverable: ${newDeliverable.title} (ID: ${newDeliverable.id})`);
            } else {
              console.log(`      Creating Task: ${taskData.title} for US ${userStory.title}`);
              const taskAssignedToId = taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined;
              const taskPayload: Omit<Task, keyof Model | "id" | "createdAt" | "updatedAt"> = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, assignedTo: taskAssignedToId,
                estimatedHours: taskData.estimatedHours, spentHours: taskData.spentHours,
                createdBy: taskCreatorId,
                isDeliverable: false, // Explicitly set for normal tasks
              };
              await createTask(taskPayload);
            }
          }
          if (usData.tasks && usData.tasks.length > 0) {
             await updateUserStoryStatusBasedOnTasks(userStory.id);
             console.log(`      Updated status for US ${userStory.title} based on its tasks.`);
          }
        }
      }
      for (const usData of projectData.backlogUserStories || []) { /* ... backlog ... */ }
    } catch (error) {
      console.error(`Error creating project ${projectData.projectName}:`, error);
    }
  }

  const evaluationsData = [
    {
      deliverableRef: "authQaDeliverable", rubricRef: "standardFeatureRubric",
      evaluatorRef: "sm_bob", studentRef: "tester_eve", status: EvaluationStatus.COMPLETED,
      overallFeedback: "Good QA coverage. Some edge cases could be explored further in next iterations.", // Renamed from feedback
      evaluatedAtTimestamp: getRelativeDate(-13).getTime(),
      criteriaEvaluations: [
        { criterionName: "Functionality", score: 10, comments: "All auth flows work as expected." },
        { criterionName: "Code Quality", score: 8, comments: "Test scripts are clear (assuming QA report is code-like)." },
        { criterionName: "Testing", score: 9, comments: "Comprehensive test cases executed and documented." },
      ]
    }
  ];
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
      let maxPossibleScore = 0;
      let totalScore = 0;
      const populatedCriteriaEvals = rubric.criteria.map((rubricCriterion) => {
        const evalCriterion = evalDef.criteriaEvaluations.find(ec => ec.criterionName === rubricCriterion.name);
        maxPossibleScore += rubricCriterion.maxPoints;
        const currentScore = evalCriterion?.score || 0;
        totalScore += currentScore;
        return {
          criterionId: rubricCriterion.id || crypto.randomUUID(),
          criterionName: rubricCriterion.name, score: currentScore,
          levelDescription: rubricCriterion.levels.find(l => l.pointValue === currentScore)?.description || "N/A",
          comments: evalCriterion?.comments || "",
        };
      });
      const evaluationToCreateData: Omit<Evaluation, keyof Model | "id" | "createdAt" | "updatedAt"> = {
        deliverableId: deliverable.id, rubricId: rubric.id, evaluatorId: evaluator.id, studentId: student.id,
        status: evalDef.status, overallFeedback: evalDef.overallFeedback, criteriaEvaluations: populatedCriteriaEvals, // Renamed from feedback to overallFeedback
        maxPossibleScore, totalScore, evaluatedAt: evalDef.evaluatedAtTimestamp || Date.now(),
        // projectId removed earlier, if it's not part of Evaluation schema.
        // If it IS part of the schema and was removed in error, it should be:
        // projectId: deliverable.userStoryId ? (await kv.get<UserStory>(["userStories", deliverable.userStoryId])).value?.projectId : undefined,
      };
      const newEvaluation = createEvaluationWithDefaults(evaluationToCreateData);
      await kv.set(["evaluations", newEvaluation.id], newEvaluation);
      console.log(`Created Evaluation for Deliverable: ${deliverable.title} (ID: ${newEvaluation.id})`);
    }
  } catch (error) {
    console.error("Error creating evaluations:", error);
  }
  console.log("\nAll sample data processed.");
}

// --- Main Execution ---
if (import.meta.main) {
  seedDatabase()
    .then(() => { console.log("\nDatabase seeding process finished successfully."); })
    .catch((err) => { console.error("\nCritical error during database seeding:", err); });
}

// Helper type for Model to avoid importing it if it's a global/utility type
interface Model {
  id: string;
  createdAt: number;
  updatedAt: number;
}
