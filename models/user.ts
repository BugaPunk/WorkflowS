import { COLLECTIONS, type Model, createModel, getKv } from "@/utils/db.ts";
import { z } from "zod";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  SCRUM_MASTER = "scrum_master",
  PRODUCT_OWNER = "product_owner",
  TEAM_DEVELOPER = "team_developer",
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
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

// Update user role
export async function updateUserRole(userId: string, newRole: UserRole): Promise<User | null> {
  try {
    const kv = getKv();

    // Get the user first
    const user = await getUserById(userId);

    if (!user) {
      return null;
    }

    // Only update if the role is different
    if (user.role === newRole) {
      return user;
    }

    // Update the user with the new role
    const updatedUser = {
      ...user,
      role: newRole,
      updatedAt: new Date().getTime(),
    };

    // Save the updated user
    const key = [...COLLECTIONS.USERS, userId];
    await kv.set(key, updatedUser);

    // Update all active sessions for this user
    const sessionsIterator = kv.list({ prefix: [...COLLECTIONS.USERS, "sessions"] });
    for await (const entry of sessionsIterator) {
      const sessionData = entry.value as { userId: string; role: UserRole };
      if (sessionData && sessionData.userId === userId) {
        // Update the role in the session
        const updatedSession = {
          ...sessionData,
          role: newRole,
        };
        await kv.set(entry.key, updatedSession);
      }
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user role:", error);
    return null;
  }
}

// Update a user
export async function updateUser(
  userId: string,
  updateData: Partial<Omit<UserData, "password"> & { passwordHash?: string }>
): Promise<User | null> {
  try {
    const kv = getKv();

    // Get the user first
    const user = await getUserById(userId);

    if (!user) {
      return null;
    }

    // Update the user with the new data
    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date().getTime(),
    };

    // Save the updated user
    const key = [...COLLECTIONS.USERS, userId];
    await kv.set(key, updatedUser);

    // If email was updated, update the email index
    if (updateData.email && updateData.email !== user.email) {
      // Delete old email index
      await kv.delete([...COLLECTIONS.USERS, "by_email", user.email]);
      // Create new email index
      await kv.set([...COLLECTIONS.USERS, "by_email", updateData.email], userId);
    }

    // If username was updated, update the username index
    if (updateData.username && updateData.username !== user.username) {
      // Delete old username index
      await kv.delete([...COLLECTIONS.USERS, "by_username", user.username]);
      // Create new username index
      await kv.set([...COLLECTIONS.USERS, "by_username", updateData.username], userId);
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
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
