// Central password policy used everywhere a user CHOOSES a password
// (setup, password change, admin-created teammates, reset flows).
// Auto-generated temporary passwords are exempt (they're random and forced to
// be changed on first login).

export const PASSWORD_MIN_LENGTH = 8;

// Human-readable summary shown in the UI next to password inputs.
export const PASSWORD_RULES_TEXT =
  "At least 8 characters, including an uppercase letter, a lowercase letter, and a number.";

// Returns an error message if the password is too weak, or null if it passes.
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  return null;
}
