
import { Router } from 'express'
import * as z from 'zod'
import {
    deleteUser,
    getAllUsernames,
	updateUser,
	getUserById
} from '../fakeDb.ts'
import type { UserCredentials } from '../types.ts'
import { requireAuth } from '../middleware.ts'

const router = Router()

const updateUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
})


// GET /api/users — list usernames (login required)

router.get('/', requireAuth, (_req, res) => {
    res.status(200).json(getAllUsernames())
})

// GET /:id
router.get('/:id', requireAuth, (req, res) => {
    const id = req.params.id

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid user ID' })
        return
    }

    if (id !== res.locals.userId) {
        res.status(403).json({ error: 'You can only view your own profile' })
        return
    }

    const user = getUserById(id)

    if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
    }

    res.status(200).json({
        id: user.id,
        username: user.username
    })
})


// PUT /:id

router.put('/:id', requireAuth, async (req, res) => {
    const id = req.params.id

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid user ID' })
        return
    }

    if (id !== res.locals.userId) {
        res.status(403).json({ error: 'You can only update your own profile' })
        return
    }

    const result = updateUserSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({ error: 'Username and password are required' })
        return
    }

    const credentials: UserCredentials = result.data
    const updatedUser = await updateUser(id, credentials)

    if (!updatedUser) {
        res.status(404).json({ error: 'User not found' })
        return
    }

    res.sendStatus(204)
})

// DELETE /:id

router.delete('/:id', requireAuth, (req, res) => {
    const id = req.params.id

    if (typeof id !== 'string') {
        res.status(400).json({ error: 'Invalid user ID' })
        return
    }

    if (id !== res.locals.userId) {
        res.status(403).json({ error: 'You can only delete your own account' })
        return
    }

    const deleted = deleteUser(id)

    if (!deleted) {
        res.status(404).json({ error: 'User not found' })
        return
    }

    res.sendStatus(204)
})

export default router