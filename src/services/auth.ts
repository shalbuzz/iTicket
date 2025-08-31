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

export interface RefreshReq {
  refresh: string
}

export const login = async (req: LoginReq): Promise<AuthRes> => {
  const { data } = await api.post("/auth/login", req)
  return data
}

export const register = async (req: RegisterReq): Promise<{ id: string }> => {
  const { data } = await api.post("/auth/register", req)
  return data // { id }
}

export const refresh = async (req: RefreshReq): Promise<AuthRes> => {
  const { data } = await api.post("/auth/refresh", req)
  return data
}
