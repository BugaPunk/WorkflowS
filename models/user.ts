import { z } from "zod";
import { getKv, COLLECTIONS, Model, createModel } from "@/utils/db.ts";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  SCRUM_MASTER = "scrum_master",
  PRODUCT_OWNER = "product_owner",
  TEAM_DEVELOPER = "team_developer"
}

// Define the User schema with Zod for validation
export const UserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.TEAM_DEVELOPER),
});

// Define the User type
export type UserData = z.infer<typeof UserSchema>;

// Define the User model
export interface User extends Model, Omit<UserData, "password"> {
  passwordHash: string;
}

// Create a new user
export async function createUser(userData: UserData): Promise<User> {
  // Hash the password (in a real app, use a proper password hashing library)
  const passwordHash = await hashPassword(userData.password);

  // Create the user model
  const user = createModel<Omit<User, keyof Model>>({
    username: userData.username,
    email: userData.email,
    passwordHash,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role || UserRole.TEAM_DEVELOPER,
  });

  // Get KV instance
  const kv = getKv();

  // Save the user to the database
  const key = [...COLLECTIONS.USERS, user.id];
  await kv.set(key, user);

  // Also create an index for email lookup
  await kv.set([...COLLECTIONS.USERS, "by_email", user.email], user.id);

  // Also create an index for username lookup
  await kv.set([...COLLECTIONS.USERS, "by_username", user.username], user.id);

  return user;
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const kv = getKv();
  const key = [...COLLECTIONS.USERS, id];
  const result = await kv.get<User>(key);
  return result.value;
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const kv = getKv();
  const emailKey = [...COLLECTIONS.USERS, "by_email", email];
  const result = await kv.get<string>(emailKey);

  if (!result.value) {
    return null;
  }

  return getUserById(result.value);
}

// Get a user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const kv = getKv();
  const usernameKey = [...COLLECTIONS.USERS, "by_username", username];
  const result = await kv.get<string>(usernameKey);

  if (!result.value) {
    return null;
  }

  return getUserById(result.value);
}

// Simple password hashing function (for demo purposes only)
// In a real app, use a proper password hashing library like bcrypt
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Verify a password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const kv = getKv();
  const users: User[] = [];

  // List all users
  const usersIterator = kv.list<User>({ prefix: [...COLLECTIONS.USERS] });

  for await (const entry of usersIterator) {
    // Only include main user entries (not indexes)
    if (entry.key.length === 2 && entry.key[0] === COLLECTIONS.USERS[0]) {
      users.push(entry.value);
    }
  }

  return users;
}

// Delete a user
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const kv = getKv();

    // Get the user first to access their email and username
    const user = await getUserById(userId);

    if (!user) {
      return false;
    }

    // Delete the main user entry
    await kv.delete([...COLLECTIONS.USERS, userId]);

    // Delete the email index
    await kv.delete([...COLLECTIONS.USERS, "by_email", user.email]);

    // Delete the username index
    await kv.delete([...COLLECTIONS.USERS, "by_username", user.username]);

    // Delete any session associated with this user
    const sessionsIterator = kv.list({ prefix: [...COLLECTIONS.USERS, "sessions"] });
    for await (const entry of sessionsIterator) {
      const sessionData = entry.value as { userId: string };
      if (sessionData && sessionData.userId === userId) {
        await kv.delete(entry.key);
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
