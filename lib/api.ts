// src/lib/api.ts
import axios from "axios";

/**
 * ВАЖНО: выбери один стиль baseURL:
 *  A) .env = VITE_API_URL=https://localhost:7226           (без /api)  -> в путях использовать /api/...
  B) .env = VITE_API_URL=https://localhost:7226/api       (с /api)     -> в путях НЕ писать /api
 
 * Сейчас просто читаем то, что у тебя в .env:
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

function getToken(): string | null {
  const raw = localStorage.getItem("accessToken");
  if (!raw || raw === "undefined" || raw === "null") return null;
  return raw;
}

// Подставляем Bearer, но НЕ на /auth/*
api.interceptors.request.use((cfg) => {
  const token = getToken();

  const url = (cfg.url ?? "").toLowerCase();
  const isAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh");

  cfg.headers = cfg.headers ?? {};

  if (!isAuthRoute && token) {
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  } else {
    delete (cfg.headers as any).Authorization;
  }

  return cfg;
});

// На 401 — выходим на /login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && location.pathname !== "/login") {
      localStorage.removeItem("accessToken");
      window.location.assign("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
