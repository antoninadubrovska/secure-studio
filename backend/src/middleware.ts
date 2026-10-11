import type { RequestHandler } from 'express'
import jwt, { type JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken'

const { verify, TokenExpiredError, JsonWebTokenError } = jwt

// Log incoming requests
export const logger: RequestHandler = (req, res, next) => {
console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
next()
}

// Require a valid JWT
export const requireAuth: RequestHandler = (req, res, next) => {
const auth = req.headers.authorization

if (!auth || !auth.startsWith('Bearer ')) {
    res.sendStatus(401)
    return
}

const token = auth.slice(7)

try {
    const verified = verify(token, process.env.SECRET!)

    if (
        typeof verified === 'string' ||
        typeof verified === 'undefined' ||
        !('id' in verified) ||
        typeof verified.id !== 'string'
    ) {
        res.sendStatus(401)
        return
    }

    res.locals.userId = verified.id
    next()
} catch (error: unknown) {
    if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
    ) {
        res.sendStatus(401)
        return
    }

    next(error)
}


}
