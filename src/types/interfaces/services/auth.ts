export interface LoginRequest {
  username: string,
  password: string,
}

export interface AuthUser {
  username: string,
  authCode: string,
  ownerId: number | null,
  vetId: number | null,
}

export interface AuthResponse {
  accessToken: string,
  tokenType: string,
  expiresIn: number,
  user: AuthUser,
}
