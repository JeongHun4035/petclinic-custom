import type { AuthUser } from '@/types/interfaces/services'

export const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    return null
  }
}

const normalizedAuthCode = (authCode: string) => authCode.trim().toUpperCase()

export const isAdmin = (user: AuthUser | null) => {
  const authCode = user ? normalizedAuthCode(user.authCode) : ''

  return authCode === 'ADMIN' || authCode === 'ROLE_ADMIN' || authCode.includes('ADMIN')
}

export const canManageResources = (user: AuthUser | null) => {
  if (!user) {
    return false
  }

  const authCode = normalizedAuthCode(user.authCode)

  return isAdmin(user) || authCode === 'VETS' || authCode === 'VET' || authCode === 'ROLE_VETS' || authCode === 'ROLE_VET'
}

export const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenInfo')
  localStorage.removeItem('user')
}