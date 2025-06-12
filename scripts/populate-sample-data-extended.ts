// deno-lint-ignore-file no-explicit-any
// Imports
import { createUser, User, UserRole } from "../models/user.ts";
import { createProject, Project } from "../models/project.ts";
import { createSprint, Sprint, SprintStatus, addUserStoryToSprint } from "../models/sprint.ts";
import { createUserStory, UserStory, UserStoryStatus, UserStoryPriority, updateUserStory } from "../models/userStory.ts";
import { createTask, Task, TaskStatus } from "../models/task.ts";
import { updateUserStoryStatusBasedOnTasks } from "../services/userStoryStatusService.ts";

// --- Helper Functions ---
function getRelativeDate(daysOffset: number, referenceDate: Date = new Date()): Date {
  const newDate = new Date(referenceDate);
  newDate.setDate(newDate.getDate() + daysOffset);
  return newDate;
}

// --- Main Seeding Function ---
async function seedDatabase() {
  console.log("Starting database seeding...");

  const createdUsers: Record<string, User> = {};
  // const createdProjects: Record<string, Project> = {}; // Not strictly needed if not referencing projects later by key
  // const createdSprints: Record<string, Sprint> = {}; // Not strictly needed
  // const createdUserStories: Record<string, UserStory> = {}; // Not strictly needed

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
    return; // Stop if users can't be created
  }

  // --- Project Definitions ---
  const projectsData = [
    // Project 1: E-commerce Platform
    {
      projectName: "E-commerce Platform",
      projectKey: "ECOMM",
      description: "Next-generation online shopping platform with enhanced user experience and AI-driven recommendations.",
      productOwnerRef: "po_alice",
      scrumMasterRef: "sm_bob",
      memberRefs: ["dev_charlie", "dev_diana", "tester_eve"],
      creatorRef: "admin",
      sprints: [
        {
          sprintName: "ECOMM Sprint 1 - MVP User & Product Setup",
          goal: "Core user authentication, product catalog display, and basic cart functionality.",
          status: SprintStatus.COMPLETED, // Past sprint
          startDateOffset: -28,
          endDateOffset: -14,
          userStories: [
            {
              title: "US1: User Registration & Login",
              description: "As a new user, I want to register an account and log in, so I can access personalized features and save my preferences.",
              acceptanceCriteria: "1. User can register with email and password.\n2. User receives a confirmation email (mock).\n3. User can log in with valid credentials.\n4. Error shown for invalid login.",
              priority: UserStoryPriority.CRITICAL,
              points: 8,
              status: UserStoryStatus.DONE, // All tasks done
              assigneeRef: "dev_charlie", // Overall US assignee (optional)
              creatorRef: "po_alice",
              tasks: [
                { title: "T1.1: Design registration & login UI mockups", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 2, spentHours: 4, description: "Create wireframes and mockups for registration and login pages." },
                { title: "T1.2: Implement registration API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 3, spentHours: 6, description: "Develop backend API for user creation." },
                { title: "T1.3: Implement login API endpoint", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 5, description: "Develop backend API for user authentication." },
                { title: "T1.4: Frontend for registration & login pages", status: TaskStatus.DONE, assignedToRef: "dev_diana", points: 3, spentHours: 8, description: "Build UI based on mockups." },
                { title: "T1.5: Write unit tests for auth APIs", status: TaskStatus.DONE, assignedToRef: "dev_charlie", points: 2, spentHours: 4, description: "Ensure API reliability." },
                { title: "T1.6: Perform QA testing on auth flow", status: TaskStatus.DONE, assignedToRef: "tester_eve", points: 2, spentHours: 6, description: "Verify complete authentication functionality." },
              ]
            },
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
        {
          sprintName: "ECOMM Sprint 2 - Cart & Checkout Foundations",
          goal: "Implement add to cart, view cart, and initial checkout process.",
          status: SprintStatus.ACTIVE, // Current sprint
          startDateOffset: -13,
          endDateOffset: 1, // Ends tomorrow
          userStories: [
            {
              title: "US3: Add to Shopping Cart",
              description: "As a shopper, I want to add products to my shopping cart, so I can purchase them later.",
              acceptanceCriteria: "1. 'Add to Cart' button on product page.\n2. Cart icon updates with item count.\n3. Product is added to the session/user cart.",
              priority: UserStoryPriority.CRITICAL,
              points: 5,
              status: UserStoryStatus.IN_PROGRESS,
              assigneeRef: "dev_charlie",
              creatorRef: "po_alice",
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
              priority: UserStoryPriority.HIGH,
              points: 8,
              status: UserStoryStatus.PLANNED,
              assigneeRef: "dev_diana",
              creatorRef: "po_alice",
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
          status: SprintStatus.PLANNED,
          startDateOffset: 2,
          endDateOffset: 16,
          userStories: [
            {
              title: "US5: Payment Gateway Integration",
              description: "As a shopper, I want to securely pay for my order, so I can complete my purchase.",
              acceptanceCriteria: "1. Integration with Stripe/PayPal (mock).\n2. Secure handling of payment info.",
              priority: UserStoryPriority.CRITICAL,
              points: 13,
              status: UserStoryStatus.BACKLOG, // Will move to PLANNED when sprint starts
              assigneeRef: "dev_charlie",
              creatorRef: "po_alice",
              tasks: [] // Tasks to be defined later
            }
          ]
        }
      ],
      backlogUserStories: [
        {
          title: "US_B1: Product Reviews & Ratings",
          description: "As a shopper, I want to read and write product reviews, so I can make informed decisions and share my feedback.",
          acceptanceCriteria: "1. Users can submit star ratings.\n2. Users can write text reviews.\n3. Reviews are displayed on product pages.",
          priority: UserStoryPriority.MEDIUM,
          points: 8,
          status: UserStoryStatus.BACKLOG,
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
          priority: UserStoryPriority.HIGH,
          points: 13,
          status: UserStoryStatus.BACKLOG,
          creatorRef: "po_alice",
          tasks: []
        }
      ]
    },
    // Add another project definition here if needed for more variety
  ];


  // --- 2. Create Projects, Sprints, User Stories, and Tasks ---
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
      // createdProjects[projectData.projectKey] = project; // Store if needed
      console.log(`Created Project: ${project.name} (ID: ${project.id})`);

      // Sprints
      for (const sprintData of projectData.sprints) {
        console.log(`  Creating Sprint: ${sprintData.sprintName} for project ${project.name}`);
        const sprintCreator = sprintData.creatorRef ? createdUsers[sprintData.creatorRef] : createdUsers[projectData.scrumMasterRef];
        const sprint = await createSprint({
          name: sprintData.sprintName,
          goal: sprintData.goal,
          projectId: project.id,
          status: sprintData.status,
          startDate: getRelativeDate(sprintData.startDateOffset).getTime(),
          endDate: getRelativeDate(sprintData.endDateOffset).getTime(),
          createdBy: sprintCreator.id,
        });
        // createdSprints[sprint.name] = sprint; // Store if needed
        console.log(`  Created Sprint: ${sprint.name} (ID: ${sprint.id})`);

        // User Stories for this Sprint
        for (const usData of sprintData.userStories) {
          console.log(`    Creating User Story: ${usData.title} for sprint ${sprint.name}`);
          const usCreator = usData.creatorRef ? createdUsers[usData.creatorRef] : createdUsers[projectData.productOwnerRef];
          const userStory = await createUserStory({
            title: usData.title,
            description: usData.description,
            acceptanceCriteria: usData.acceptanceCriteria,
            priority: usData.priority,
            points: usData.points,
            projectId: project.id,
            // status: usData.status, // createUserStory sets default, will be updated by tasks or explicitly
          }, usCreator.id);

          await addUserStoryToSprint(sprint.id, userStory.id);
          // Update US with explicit status & assignee if provided, after linking to sprint
          const updatePayload: Partial<UserStory> = { status: usData.status };
          if (usData.assigneeRef && createdUsers[usData.assigneeRef]) {
            updatePayload.assignedTo = createdUsers[usData.assigneeRef].id;
          }
          await updateUserStory(userStory.id, updatePayload);

          // createdUserStories[userStory.title] = userStory; // Store if needed
          console.log(`    Created User Story: ${userStory.title} (ID: ${userStory.id}), added to Sprint ${sprint.name}, status: ${usData.status}`);

          for (const taskData of usData.tasks || []) {
            console.log(`      Creating Task: ${taskData.title} for US ${userStory.title}`);
            const taskCreator = taskData.creatorRef ? createdUsers[taskData.creatorRef] : createdUsers[projectData.scrumMasterRef];
            await createTask({
              title: taskData.title,
              description: taskData.description || "",
              status: taskData.status,
              userStoryId: userStory.id,
              assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
              points: taskData.points,
              spentHours: taskData.spentHours,
              createdBy: taskCreator.id,
            });
          }
          if (usData.tasks && usData.tasks.length > 0) {
             await updateUserStoryStatusBasedOnTasks(userStory.id);
             console.log(`      Updated status for US ${userStory.title} based on its tasks.`);
          }
        }
      }

      // Backlog User Stories for this Project
      for (const usData of projectData.backlogUserStories || []) {
        console.log(`    Creating Backlog User Story: ${usData.title} for project ${project.name}`);
        const usCreator = usData.creatorRef ? createdUsers[usData.creatorRef] : createdUsers[projectData.productOwnerRef];
        const userStory = await createUserStory({
          title: usData.title,
          description: usData.description,
          acceptanceCriteria: usData.acceptanceCriteria,
          priority: usData.priority,
          points: usData.points,
          projectId: project.id,
          status: usData.status || UserStoryStatus.BACKLOG,
        }, usCreator.id);

        if (usData.assigneeRef && createdUsers[usData.assigneeRef]) {
            await updateUserStory(userStory.id, { assignedTo: createdUsers[usData.assigneeRef].id });
        }
        // createdUserStories[userStory.title] = userStory; // Store if needed
        console.log(`    Created Backlog User Story: ${userStory.title} (ID: ${userStory.id})`);

        for (const taskData of usData.tasks || []) {
          console.log(`      Creating Task: ${taskData.title} for US ${userStory.title}`);
          const taskCreator = taskData.creatorRef ? createdUsers[taskData.creatorRef] : createdUsers[projectData.scrumMasterRef];
          await createTask({
            title: taskData.title,
            description: taskData.description || "",
            status: taskData.status,
            userStoryId: userStory.id,
            assignedTo: taskData.assignedToRef ? createdUsers[taskData.assignedToRef]?.id : undefined,
            points: taskData.points,
            spentHours: taskData.spentHours,
            createdBy: taskCreator.id,
          });
        }
        if (usData.tasks && usData.tasks.length > 0) {
          await updateUserStoryStatusBasedOnTasks(userStory.id);
          console.log(`      Updated status for US ${userStory.title} based on its tasks.`);
        }
      }

    } catch (error) {
      console.error(`Error creating project ${projectData.projectName}:`, error);
      // Continue with the next project
    }
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
