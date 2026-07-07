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
