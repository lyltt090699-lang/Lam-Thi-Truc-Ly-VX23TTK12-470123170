import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, loginAccount, logoutAccount, registerAccount } from "../api/auth";
import type { CurrentUser } from "../api/auth";
import { clearToken, getToken } from "../api/client";
import { mergeGuestCart } from "../cart/storage";

type AuthContextValue = {
  user: CurrentUser | null;
  ready: boolean;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<CurrentUser>;
  login: (input: { email: string; password: string }) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      setReady(true);
      return;
    }

    getCurrentUser()
      .then((current) => {
        if (active) {
          setUser(current);
        }
      })
      .catch(() => {
        clearToken();
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async register(input) {
        const session = await registerAccount(input);
        await mergeGuestCart();
        const current = toCurrentUser(session);
        setUser(current);
        return current;
      },
      async login(input) {
        const session = await loginAccount(input);
        await mergeGuestCart();
        const current = toCurrentUser(session);
        setUser(current);
        return current;
      },
      async logout() {
        try {
          await logoutAccount();
        } finally {
          setUser(null);
        }
      },
      async refresh() {
        const current = await getCurrentUser();
        setUser(current);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function toCurrentUser(session: { email: string; fullName: string; roles?: string[] }): CurrentUser {
  return {
    email: session.email,
    fullName: session.fullName,
    roles: session.roles ?? [],
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
