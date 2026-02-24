export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

export function isStrongPassword(password: string): boolean {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
}
