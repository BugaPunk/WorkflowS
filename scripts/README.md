# Project Scripts

This directory contains various utility scripts for the project.

## `populate-sample-data-extended.ts`

This script populates your Deno KV database with sample data for development and testing purposes. It creates a comprehensive sample project, including:

*   Users with different roles (admin, scrum master, product owner, developer)
*   A project ("E-commerce Platform Revamp")
*   Multiple sprints within the project (with past, active, and planned statuses)
*   User stories assigned to these sprints, with varying points, statuses, and tasks
*   Tasks assigned to user stories and users
*   User stories in the project backlog

**Important Notes:**

*   This script is intended for use in a development or testing environment.
*   Running this script multiple times may result in duplicate data, as it primarily focuses on creating new entities. If you need a clean slate, you might need to clear your KV database manually or use/develop a separate script for that (e.g., `scripts/clear-database.ts` if it exists and is suitable).

**How to Run:**

To execute the script and populate your Deno KV store, run the following command from the root of the project:

```sh
deno run -A scripts/populate-sample-data-extended.ts
```

The `-A` flag grants the script necessary permissions (like KV access, net access if any, etc.). You should see log messages in your console indicating the progress of the data seeding.
