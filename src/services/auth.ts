import api from "../lib/api"

export interface LoginReq { email: string; password: string }
export interface AuthRes { access: string; refresh: string | null }
export interface RegisterReq { fullName: string; email: string; password: string }

export const login = async (req: LoginReq): Promise<AuthRes> => {
  const { data } = await api.post("/auth/login", req)

  const access =
    data?.access ??
    data?.accessToken ??
    data?.token ??
    data?.Access ??
    data?.AccessToken ??
    data?.Token

  const refresh =
    data?.refresh ??
    data?.refreshToken ??
    data?.Refresh ??
    data?.RefreshToken ??
    null

  if (!access || typeof access !== "string") {
    console.warn("[auth.login] Unexpected response:", data)
    throw new Error("Invalid login response: no access token")
  }

  return { access, refresh }
}

export const register = async (req: RegisterReq): Promise<void> => {
  await api.post("/auth/register", req)
}
