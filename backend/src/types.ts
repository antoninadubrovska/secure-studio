import * as z from 'zod'

// describes a complete stored user, including the ID
export const userSchema = z.object({
    id: z.string(),
    username: z.string().min(1),
    password: z.string().min(1)
})

export type User = z.infer<typeof userSchema>

export const userCredentialsSchema = userSchema.omit({
    id: true
})

// describes registration or login input, where the user supplies only a username and password
export type UserCredentials = z.infer<typeof userCredentialsSchema>

export type TokenResponse = {
    jwt: string
}

export type JwtPayload = {
    id: string
}