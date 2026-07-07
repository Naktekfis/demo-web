import { randomBytes } from 'crypto'

export function generateTeamUid(prefix: string) {
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  const code = randomBytes(6)
    .toString('base64url')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 6)

  return `${cleanPrefix}-${code.padEnd(6, '0')}`
}

export function normalizeTeamUid(uid: string) {
  return uid.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidTeamUid(uid: string, prefix: string) {
  const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  return new RegExp(`^${cleanPrefix}-[A-Z0-9]{6}$`).test(normalizeTeamUid(uid))
}
