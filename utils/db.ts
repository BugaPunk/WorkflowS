/// <reference lib="deno.unstable" />
import { IS_BROWSER } from "$fresh/runtime.ts";

// Only open KV on the server side
let _kv: Deno.Kv | null = null;

// Initialize KV only on the server
if (!IS_BROWSER) {
  _kv = await Deno.openKv();
}

// Export a getter function for KV
export function getKv(): Deno.Kv {
  if (!_kv) {
    throw new Error(
      "La base de datos KV no está inicializada o se está accediendo desde el navegador"
    );
  }
  return _kv;
}

// Define collection prefixes
export const COLLECTIONS = {
  USERS: ["users"],
  SESSIONS: ["sessions"],
  PROJECTS: ["projects"],
  PROJECT_MEMBERS: ["project_members"],
} as const;

// Helper function to generate a unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Helper function to get current timestamp
export function now(): number {
  return new Date().getTime();
}

// Generic type for database models
export interface Model {
  id: string;
  createdAt: number;
  updatedAt: number;
}

// Helper function to create a new model instance
export function createModel<T extends object>(data: T): T & Model {
  const timestamp = now();
  return {
    ...data,
    id: generateId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// Helper function to update a model
export function updateModel<T extends Model>(model: T, updates: Partial<T>): T {
  return {
    ...model,
    ...updates,
    updatedAt: now(),
  };
}
