import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ElfSession {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  token: string | null;
  elf: ElfSession | null;
  login: (token: string, elf: ElfSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "north-pole-token";
const ELF_KEY = "north-pole-elf";

function readStored<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [elf, setElf] = useState<ElfSession | null>(() => readStored(ELF_KEY));

  const login = useCallback((newToken: string, newElf: ElfSession) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ELF_KEY, JSON.stringify(newElf));
    setToken(newToken);
    setElf(newElf);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ELF_KEY);
    setToken(null);
    setElf(null);
  }, []);

  const value = useMemo(
    () => ({ token, elf, login, logout }),
    [token, elf, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
