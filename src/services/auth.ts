import api from "../lib/api"

export interface LoginReq {
  email: string
  password: string
}

export interface AuthRes {
  access: string
  refresh: string
}

export interface RegisterReq {
  fullName: string
  email: string
  password: string
}

export const login = async (req: LoginReq): Promise<AuthRes> => {
  const response = await api.post("/auth/login", req)
  return response.data
}

export const register = async (req: RegisterReq): Promise<void> => {
  await api.post("/auth/register", req)
}
