import { createContext, useState } from "react";

interface AuthContextProps {
  selectedAccount: string;
  setSelectedAccount: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  return <AuthContext.Provider value={{ selectedAccount, setSelectedAccount }}>{children}</AuthContext.Provider>;
};
