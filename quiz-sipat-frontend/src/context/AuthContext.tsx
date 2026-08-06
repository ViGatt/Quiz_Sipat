import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Define o formato do nosso colaborador logado
type Colaborador = {
  id: string;
  cpf: string;
  nome: string;
  is_comissao: boolean;
};

type AuthContextType = {
  usuario: Colaborador | null;
  login: (dadosUsuario: Colaborador) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Colaborador | null>(null);

  const login = (dadosUsuario: Colaborador) => setUsuario(dadosUsuario);
  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar a memória em qualquer lugar
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};