export function isAdminEmail(email?: string | null) {
  return Boolean(
    email &&
      (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .includes(email.toLowerCase()),
  )
}
