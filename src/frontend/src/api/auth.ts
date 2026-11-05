import { apiFetch, clearToken, setToken } from "./client";

export type AuthSession = {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
};

export type CurrentUser = {
  email: string;
  fullName: string;
  roles: string[];
};

export async function registerAccount(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const session = (await response.json()) as AuthSession;
  setToken(session.token);
  return session;
}

export async function loginAccount(input: { email: string; password: string }) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const session = (await response.json()) as AuthSession;
  setToken(session.token);
  return session;
}

export async function logoutAccount() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/auth/me");
  return (await response.json()) as CurrentUser;
}

export async function requestPasswordReset(email: string) {
  const response = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return (await response.json()) as { message: string; resetUrl?: string };
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as { message: string };
}

export async function getAdminAccess() {
  const response = await apiFetch("/api/admin/access");
  return (await response.json()) as { message: string };
}
