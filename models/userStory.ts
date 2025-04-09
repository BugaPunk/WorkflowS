export enum UserStoryPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum UserStoryStatus {
  BACKLOG = "backlog",
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  TESTING = "testing",
  DONE = "done",
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: UserStoryPriority;
  status: UserStoryStatus;
  points?: number;
  projectId: string;
  createdBy: string;
  assignedTo?: string;
  sprintId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateUserStoryData {
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: UserStoryPriority;
  points?: number;
  projectId: string;
}

export interface UpdateUserStoryData {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  priority?: UserStoryPriority;
  status?: UserStoryStatus;
  points?: number;
  assignedTo?: string;
  sprintId?: string;
}
