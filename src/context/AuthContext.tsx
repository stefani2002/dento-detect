import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
    const storedName = localStorage.getItem("name"); // чита name

    if (storedToken && storedEmail) {
      setToken(storedToken);
      setUser({ email: storedEmail, full_name: storedName || undefined }); // додај name
    }
  }, []);

  const login = (newToken: string, email: string, full_name?: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", email);
    if (full_name) localStorage.setItem("name", full_name);
    setToken(newToken);
    setUser({ email, full_name });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
