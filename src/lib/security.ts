/**
 * Shared security validators.
 * Used across the application for input validation and sanitization.
 */

/** Validates email format using a basic RFC-compliant pattern. */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates password strength.
 * Requires at least 8 characters, one uppercase, one lowercase,
 * one digit, and one special character.
 */
export function isStrongPassword(password: string): boolean {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

/** Strips common SQL injection characters from user input. */
export function sanitizeForDb(input: string): string {
    return input.replace(/--+/g, "").replace(/['\"%;]/g, "");
}

/** Escapes HTML special characters to prevent XSS. */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
