import { compare, hash } from 'bcrypt'
import { randomUUID } from 'node:crypto'
import type { User, UserCredentials } from './types.ts'

// in-memory database, all users disappear when the server restarts

const users: User[] = []

// Find a user by username
export function getUserByUsername(username: string): User | undefined {
    return users.find(user => user.username === username)
}

// Check whether the supplied username and password match
export async function authenticateUser(
    credentials: UserCredentials
): Promise<User | undefined> {
    const user = getUserByUsername(credentials.username)

    if (!user) {
        return undefined
    }

    const passwordMatches = await compare(credentials.password, user.password)

    if (!passwordMatches) {
        return undefined
    }

    return user
}

// Create a user and return the new user
export async function createUser(
    credentials: UserCredentials
): Promise<User> {
    const hashedPassword = await hash(credentials.password, 10)

    const user: User = {
        id: randomUUID(),
        username: credentials.username,
        password: hashedPassword
    }

    users.push(user)

    return user
}

// Update a user's username and password
export async function updateUser(
    id: string,
    credentials: UserCredentials
): Promise<User | undefined> {
    const user = users.find(user => user.id === id)

    if (!user) {
        return undefined
    }

    const hashedPassword = await hash(credentials.password, 10)

    user.username = credentials.username
    user.password = hashedPassword

    return user
}

// Delete a user by ID
export function deleteUser(id: string): boolean {
    const index = users.findIndex(user => user.id === id)

    if (index === -1) {
        return false
    }

    users.splice(index, 1)
    return true
}

// Return all usernames, never the passwords
export function getAllUsernames(): string[] {
    return users.map(user => user.username)
}