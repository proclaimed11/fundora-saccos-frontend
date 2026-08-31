import apiClient from "@/lib/api-client"

export type LoginRequest = {
  username: string
  password: string
}

export type LoginSuccessResponse = {
  success: true
  message: string
  userId: number
  username: string
  role: string
  token: string
}

export type LoginFailureResponse = {
  success: false
  message: string
}

export type LoginResponse = LoginSuccessResponse | LoginFailureResponse

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", payload)
  return data
}

export type LogoutResponse = {
  success: boolean
  message: string
}

export const logout = async (): Promise<LogoutResponse> => {
  const { data } = await apiClient.post<LogoutResponse>("/api/auth/logout")
  return data
}

export type ForgotPasswordResponse = {
  success: boolean
  message: string
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const { data } = await apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email })
  return data
}

export type ResetPasswordPayload = {
  email: string
  code: string
  newPassword: string
}

export type ResetPasswordResponse = {
  success: boolean
  message: string
}

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  const { data } = await apiClient.post<ResetPasswordResponse>("/api/auth/reset-password", payload)
  return data
}