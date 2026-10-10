import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi } from '@/api/auth';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, isStaffRole } from '@/constants';
import type { LoginRequest, RegisterInput, TokenResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** ADMIN or STAFF — may enter the admin panel. */
  isStaff: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<User>;
  register: (payload: RegisterInput) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  /** Replace the cached user after a profile update. */
  setUser: (user: User) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY) ? readCachedUser() : null
  );
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(AUTH_TOKEN_KEY));

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUserState(null);
  }, []);

  const setUser = useCallback((next: User) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
    setUserState(next);
  }, []);

  // Revalidate a stored session once on load — a disabled account or expired token logs out.
  useEffect(() => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return;
    authApi
      .getMe()
      .then(setUser)
      .catch(clearSession)
      .finally(() => setIsLoading(false));
  }, [setUser, clearSession]);

  const startSession = useCallback(
    (res: TokenResponse) => {
      localStorage.setItem(AUTH_TOKEN_KEY, res.access_token);
      setUser(res.user);
      return res.user;
    },
    [setUser]
  );

  const login = useCallback(async (payload: LoginRequest) => startSession(await authApi.login(payload)), [startSession]);
  const register = useCallback(async (payload: RegisterInput) => startSession(await authApi.register(payload)), [startSession]);
  const loginWithGoogle = useCallback(
    async (idToken: string) => startSession(await authApi.googleVerify(idToken)),
    [startSession]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isStaff: isStaffRole(user?.role),
      isLoading,
      login,
      register,
      loginWithGoogle,
      setUser,
      logout: clearSession,
    }),
    [user, isLoading, login, register, loginWithGoogle, setUser, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
