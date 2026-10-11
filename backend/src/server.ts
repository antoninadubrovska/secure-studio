
import express from 'express'
import jwt from 'jsonwebtoken'
import * as z from 'zod'
import { logger, requireAuth } from './middleware.ts'
import {
    authenticateUser,
    createUser,
    getUserByUsername
} from './fakeDb.ts'
import { checkEnvFile } from './utils.ts'
import type { TokenResponse, UserCredentials } from './types.ts'
import usersRouter from './routes/users.ts'

checkEnvFile()

const app = express()
const PORT = 3007
const SECRET = process.env.SECRET!

app.use(logger)
app.use(express.json())

const credentialsSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
})

// Register a new user and log them in
app.post('/api/register', async (req, res) => {
    const result = credentialsSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({ error: 'Username and password are required' })
        return
    }

    const credentials: UserCredentials = result.data

    if (getUserByUsername(credentials.username)) {
        res.status(409).json({ error: 'Username already exists' })
        return
    }

    const user = await createUser(credentials)
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '8h' })

    const response: TokenResponse = { jwt: token }
    res.status(201).json(response)
})

// Sign in an existing user
app.post('/api/signin', async (req, res) => {
    const result = credentialsSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({ error: 'Username and password are required' })
        return
    }

    const user = await authenticateUser(result.data)

    if (!user) {
        res.status(401).json({ error: 'Invalid username or password' })
        return
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '8h' })

    const response: TokenResponse = { jwt: token }
    res.status(200).json(response)
})

// Users routes
app.use('/api/users', usersRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})

