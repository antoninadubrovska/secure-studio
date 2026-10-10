// checks whether the JWT secret is available
export function checkEnvFile(): void {
    if (!process.env.SECRET) {
        console.log('SECRET saknas i .env-filen!')
        process.exit(1)
    }
}