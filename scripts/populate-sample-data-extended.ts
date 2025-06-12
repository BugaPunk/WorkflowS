// Value Imports
import { createUser, UserRole } from "../models/user.ts";
import { createProject, ProjectStatus, addProjectMember, ProjectRole } from "../models/project.ts";
import { createSprint, SprintStatus, addUserStoryToSprint } from "../models/sprint.ts";
import { createUserStory, UserStoryStatus, UserStoryPriority, updateUserStory } from "../models/userStory.ts";
import { createTask, TaskStatus } from "../models/task.ts";
import { updateUserStoryStatusBasedOnTasks } from "../services/userStoryStatusService.ts";
import { getKv } from "../utils/db.ts";
import { RubricStatus } from "../models/rubric.ts";
import { createRubric } from "../services/rubricService.ts";
import { createDeliverable } from "../models/deliverable.ts";
import { EvaluationStatus } from "../models/evaluation.ts"; // createEvaluationWithDefaults removed
import { createEvaluation, finalizeEvaluation } from "../services/evaluationService.ts"; // Added

// Type Imports
import type { User } from "../models/user.ts";
import type { Project, ProjectMemberData } from "../models/project.ts";
// import type { Sprint } from "../models/sprint.ts";
import type { UserStory } from "../models/userStory.ts";
import type { Task } from "../models/task.ts";
import type { Rubric, RubricCriterion, RubricCriterionLevel } from "../models/rubric.ts";
import type { Deliverable, Attachment } from "../models/deliverable.ts";
import type { Evaluation, CriterionEvaluation } from "../models/evaluation.ts"; // Added CriterionEvaluation


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

  let defaultAdminUserId: string;

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
    defaultAdminUserId = createdUsers['admin'].id;
  } catch (error) {
    console.error("Error creating users:", error);
    return;
  }

  // --- Project Definitions (must be before Rubrics if rubrics link to projects by projectKeyRef) ---
  const projectsData = [
    {
      projectName: "E-commerce Platform", projectKeyForMap: "ECOMM",
      status: ProjectStatus.IN_PROGRESS,
      description: "Next-generation online shopping platform with enhanced user experience and AI-driven recommendations.",
      productOwnerRef: "po_alice", scrumMasterRef: "sm_bob", memberRefs: ["dev_charlie", "dev_diana", "tester_eve"], creatorRef: "admin",
      sprints: [
        {
          sprintName: "ECOMM Sprint 1 - MVP User & Product Setup", goal: "Core user authentication, product catalog display, and basic cart functionality.",
          status: SprintStatus.COMPLETED, startDateOffset: -28, endDateOffset: -14, creatorRef: "sm_bob",
          userStories: [
            {
              title: "US1: User Registration & Login", description: "As a new user, I want to register an account and log in, so I can access personalized features and save my preferences.", acceptanceCriteria: "1. User can register with email and password.\n2. User receives a confirmation email (mock).\n3. User can log in with valid credentials.\n4. Error shown for invalid login.",
              priority: UserStoryPriority.CRITICAL, points: 8, status: UserStoryStatus.DONE,
              assigneeRef: "dev_charlie", creatorRef: "po_alice",
              tasks: [
                { title: "T1.1: Design registration & login UI mockups", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 8, spentHours: 4, description: "Create wireframes and mockups for registration and login pages.", creatorRef: "sm_bob" },
                { title: "T1.2: Implement registration API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 12, spentHours: 6, description: "Develop backend API for user creation.", creatorRef: "dev_charlie" },
                { title: "T1.3: Implement login API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_diana", estimatedHours: 10, spentHours: 5, description: "Develop backend API for user authentication.", creatorRef: "dev_diana" },
                { title: "T1.4: Frontend for registration & login pages", status: TaskStatus.DONE, assignedToRef: "dev_diana", estimatedHours: 16, spentHours: 8, description: "Build UI based on mockups.", creatorRef: "dev_diana" },
                { title: "T1.5: Write unit tests for auth APIs", status: TaskStatus.DONE, assignedToRef: "dev_charlie", estimatedHours: 8, spentHours: 4, description: "Ensure API reliability.", creatorRef: "dev_charlie" },
                {
                  refName: "authQaDeliverable", title: "T1.6: Perform QA testing on auth flow", status: TaskStatus.DONE, assignedToRef: "tester_eve", estimatedHours: 8, spentHours: 6, description: "Verify complete authentication functionality.",
                  isDesignatedDeliverable: true, submissionInstructions: "Submit QA report document and test execution logs.",
                  dueDate: getRelativeDate(-15).getTime(), submittedAt: getRelativeDate(-14).getTime(), submittedByRef: "tester_eve", creatorRef: "tester_eve",
                  attachments: [
                    { fileName: "QA_Report_Auth_v1.pdf", fileType: "application/pdf", fileSize: 1024 * 230, uploadedByRef: "tester_eve", uploadedAtOffset: -14, url: "/attachments/qa_report_auth_v1.pdf" },
                    { fileName: "Test_Execution_Log.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSize: 1024 * 85, uploadedByRef: "tester_eve", uploadedAtOffset: -14, url: "/attachments/test_execution_log.xlsx" }
                  ]
                },
              ]
            },
             {
              title: "US2: Product Listing Page", description: "As a shopper, I want to view a list of available products, so I can browse and find items I'm interested in.", acceptanceCriteria: "1. Products are displayed in a grid or list view.\n2. Each product shows image, name, price.\n3. Basic pagination is implemented if many products.",
              priority: UserStoryPriority.HIGH, points: 5, status: UserStoryStatus.DONE,
              assigneeRef: "dev_diana", creatorRef: "po_alice",
              tasks: [ {title: "T2.1 Design UI", status: TaskStatus.DONE, assignedToRef:"dev_charlie", estimatedHours:4, spentHours:3, creatorRef: "sm_bob"} ]
            },
          ]
        },
         {
          sprintName: "ECOMM Sprint 2 - Cart & Checkout Foundations", goal: "Implement add to cart, view cart, and initial checkout process.",
          status: SprintStatus.ACTIVE, startDateOffset: -13, endDateOffset: 1, creatorRef: "sm_bob",
          userStories: [ {title: "US3: Add to Cart", description:"As a shopper, I want to add products to my shopping cart, so I can purchase them later.", acceptanceCriteria:"1. 'Add to Cart' button on product page.\n2. Cart icon updates with item count.\n3. Product is added to the session/user cart.", priority: UserStoryPriority.CRITICAL, points:5, status: UserStoryStatus.IN_PROGRESS, assigneeRef:"dev_charlie", creatorRef:"po_alice", tasks: [{title:"T3.1 API", status:TaskStatus.IN_PROGRESS, assignedToRef:"dev_charlie", estimatedHours:8, spentHours:2, creatorRef: "dev_charlie"}]} ]
        },
      ],
      backlogUserStories: [ {title:"US_B1: Reviews", description:"As a shopper, I want to read and write product reviews, so I can make informed decisions and share my feedback.", acceptanceCriteria:"1. Users can submit star ratings.\n2. Users can write text reviews.\n3. Reviews are displayed on product pages.", priority:UserStoryPriority.MEDIUM, points:8, status:UserStoryStatus.BACKLOG, creatorRef:"po_alice", tasks:[{title:"TB1.1 API", status:TaskStatus.TO_DO, estimatedHours:6, creatorRef: "po_alice"}]} ]
    },
  ];

  for (const projectDef of projectsData) {
    console.log(`\nCreating Project: ${projectDef.projectName}`);
    try {
      const productOwnerUser = createdUsers[projectDef.productOwnerRef];
      const scrumMasterUser = createdUsers[projectDef.scrumMasterRef];
      const creatorUser = createdUsers[projectDef.creatorRef];

      if (!productOwnerUser || !scrumMasterUser || !creatorUser) {
        console.warn(`WARN: One or more key users (PO, SM, Creator) not found for project '${projectDef.projectName}'. Skipping project.`);
        continue;
      }

      const projectPayload = {
        name: projectDef.projectName, description: projectDef.description, status: projectDef.status,
        productOwnerId: productOwnerUser.id,
        scrumMasterId: scrumMasterUser.id,
        memberIds: [],
        createdBy: creatorUser.id,
      };
      const createdProject = await createProject(projectPayload);
      createdProjectsMap.set(projectDef.projectKeyForMap || projectDef.projectName, createdProject);
      console.log(`Created Project: ${createdProject.name} (ID: ${createdProject.id})`);

      const projectMemberUserRefs = new Set<string>();
      if (projectDef.productOwnerRef) projectMemberUserRefs.add(projectDef.productOwnerRef);
      if (projectDef.scrumMasterRef) projectMemberUserRefs.add(projectDef.scrumMasterRef);
      (projectDef.memberRefs || []).forEach(ref => projectMemberUserRefs.add(ref));
      (projectDef.sprints || []).forEach(sprint => {
        if(sprint.creatorRef) projectMemberUserRefs.add(sprint.creatorRef);
        (sprint.userStories || []).forEach(us => {
            if (us.creatorRef) projectMemberUserRefs.add(us.creatorRef);
            if (us.assigneeRef) projectMemberUserRefs.add(us.assigneeRef);
            (us.tasks || []).forEach(task => {
                if (task.creatorRef) projectMemberUserRefs.add(task.creatorRef);
                if (task.assignedToRef) projectMemberUserRefs.add(task.assignedToRef);
                if (task.isDesignatedDeliverable && task.submittedByRef) projectMemberUserRefs.add(task.submittedByRef);
            });
        });
      });
      (projectDef.backlogUserStories || []).forEach(us => {
        if (us.creatorRef) projectMemberUserRefs.add(us.creatorRef);
        if (us.assigneeRef) projectMemberUserRefs.add(us.assigneeRef);
        (us.tasks || []).forEach(task => {
            if (task.creatorRef) projectMemberUserRefs.add(task.creatorRef);
            if (task.assignedToRef) projectMemberUserRefs.add(task.assignedToRef);
        });
      });

      console.log(`  Adding members to project '${createdProject.name}'...`);
      try {
        for (const userRef of projectMemberUserRefs) {
            const user = createdUsers[userRef];
            if (!user) {
                console.warn(`    WARN: User reference '${userRef}' not found for project member. Skipping.`);
                continue;
            }
            let projectRole = ProjectRole.TEAM_MEMBER;
            if (userRef === projectDef.productOwnerRef) projectRole = ProjectRole.PRODUCT_OWNER;
            else if (userRef === projectDef.scrumMasterRef) projectRole = ProjectRole.SCRUM_MASTER;

            await addProjectMember({ userId: user.id, projectId: createdProject.id, role: projectRole });
            console.log(`    Added member ${user.username} to project '${createdProject.name}' as ${projectRole}`);
        }
      } catch (memberError) { console.error(`  Error adding members to project '${createdProject.name}':`, memberError); }

      for (const sprintData of projectDef.sprints) {
        console.log(`  Creating Sprint: ${sprintData.sprintName} for project ${createdProject.name}`);
        const sprintCreatorId = createdUsers[sprintData.creatorRef]?.id || scrumMasterUser.id;
        const sprint = await createSprint({
            name: sprintData.sprintName, goal: sprintData.goal, projectId: createdProject.id,
            status: sprintData.status, startDate: getRelativeDate(sprintData.startDateOffset).getTime(),
            endDate: getRelativeDate(sprintData.endDateOffset).getTime(), createdBy: sprintCreatorId,
        });
        console.log(`  Created Sprint: ${sprint.name} (ID: ${sprint.id})`);

        for (const usData of sprintData.userStories) {
          const usCreatorId = createdUsers[usData.creatorRef!]?.id || productOwnerUser.id;
          const userStory = await createUserStory({
            title: usData.title, description: usData.description, acceptanceCriteria: usData.acceptanceCriteria,
            priority: usData.priority, points: usData.points, projectId: createdProject.id,
          }, usCreatorId);
          await addUserStoryToSprint(sprint.id, userStory.id);
          const updatePayload: Partial<UserStory> = { status: usData.status };
          const assigneeUser = usData.assigneeRef ? createdUsers[usData.assigneeRef] : undefined;
          if (assigneeUser) { updatePayload.assignedTo = assigneeUser.id; }
          await updateUserStory(userStory.id, updatePayload);
          console.log(`    Created User Story: ${userStory.title} (ID: ${userStory.id}), status: ${usData.status}`);

          for (const taskData of usData.tasks || []) {
            let taskCreatorIdResolved = scrumMasterUser.id;
            const taskCreatorRefUser = taskData.creatorRef ? createdUsers[taskData.creatorRef] : undefined;
            const projectCreatorUser = projectDef.creatorRef ? createdUsers[projectDef.creatorRef] : undefined;
            if (taskCreatorRefUser) { taskCreatorIdResolved = taskCreatorRefUser.id; }
            else if (projectCreatorUser) { taskCreatorIdResolved = projectCreatorUser.id; }
            else { taskCreatorIdResolved = defaultAdminUserId; }

            if (taskData.isDesignatedDeliverable) {
              const deliverableAssignedToId = taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined;
              const deliverableSubmittedById = taskData.submittedByRef ? createdUsers[taskData.submittedByRef]?.id : undefined;
              const deliverablePayload: Omit<Deliverable, keyof Model | "id" | "createdAt" | "updatedAt" | "attachments" > & { attachments: Attachment[]; isDeliverable: true } = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, assignedTo: deliverableAssignedToId, createdBy: taskCreatorIdResolved,
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
              const taskAssignedToId = taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined;
              const taskPayload: Omit<Task, keyof Model | "id" | "createdAt" | "updatedAt"> = {
                title: taskData.title, description: taskData.description || "", status: taskData.status,
                userStoryId: userStory.id, assignedTo: taskAssignedToId,
                estimatedHours: taskData.estimatedHours, spentHours: taskData.spentHours,
                createdBy: taskCreatorIdResolved, isDeliverable: false,
              };
              await createTask(taskPayload);
            }
          }
          if (usData.tasks && usData.tasks.length > 0) {
             await updateUserStoryStatusBasedOnTasks(userStory.id);
          }
        }
      }
      for (const usData of projectDef.backlogUserStories || []) { /* ... (backlog creation logic) ... */ }
    } catch (error) {
      console.error(`Error creating project ${projectDef.projectName}:`, error);
    }
  }
   // --- Rubric Definitions (Full data, moved after project creation) ---
  // (Rubric creation loop will use createdProjectsMap populated above)
  // ... (Rubric data and creation loop as defined in previous steps)

  const evaluationsData = [
    {
      deliverableRef: "authQaDeliverable", rubricRef: "standardFeatureRubric",
      evaluatorRef: "sm_bob", studentRef: "tester_eve", status: EvaluationStatus.COMPLETED, // This status indicates it should be finalized
      overallFeedback: "Good QA coverage. Some edge cases could be explored further in next iterations.",
      evaluatedAtTimestamp: getRelativeDate(-13).getTime(),
      criteriaEvaluations: [
        { criterionName: "Functionality", score: 10, comments: "All auth flows work as expected." },
        { criterionName: "Code Quality", score: 8, comments: "Test scripts are clear." }, // Assuming QA report is evaluated like code
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

      // Prepare criteria evaluations for the DRAFT
      const draftCriteriaEvals = rubric.criteria.map(rc => {
        const matchedEvalCriterion = evalDef.criteriaEvaluations.find(ec => ec.criterionName === rc.name);
        return {
          criterionId: rc.id,
          score: matchedEvalCriterion?.score || 0, // Default to 0 if not specified for draft
          comments: matchedEvalCriterion?.comments || "",
        };
      });

      const draftPayload = {
        deliverableId: deliverable.id, rubricId: rubric.id, evaluatorId: evaluator.id, studentId: student.id,
        status: EvaluationStatus.DRAFT, // Always create as DRAFT first
        criteriaEvaluations: draftCriteriaEvals,
        overallFeedback: evalDef.overallFeedback || "", // Use overallFeedback from static data
        // totalScore & maxPossibleScore will be set by service
      };

      const createdDraftEvaluation = await createEvaluation(draftPayload as any); // Cast if Omit type is too strict here

      if (createdDraftEvaluation) {
        console.log(`  Created Draft Evaluation: ${createdDraftEvaluation.id} for deliverable ${deliverable.title}`);
        // Finalize if the static data indicates the evaluation should be completed
        if (evalDef.status === EvaluationStatus.COMPLETED) {
          const finalEvaluation = await finalizeEvaluation(createdDraftEvaluation.id);
          if (finalEvaluation) {
            console.log(`    Finalized Evaluation: ${finalEvaluation.id}, Score: ${finalEvaluation.totalScore}/${finalEvaluation.maxPossibleScore}`);
          } else {
            console.warn(`    WARN: Could not finalize evaluation ${createdDraftEvaluation.id}`);
          }
        }
      } else {
        console.warn(`    WARN: Could not create draft evaluation for deliverable ${evalDef.deliverableRef}`);
      }
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
