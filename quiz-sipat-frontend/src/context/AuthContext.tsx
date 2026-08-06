import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Usuario = {
  id: string;
  cpf: string;
  nome: string;
  is_comissao: boolean;
};

interface AuthContextData {
  usuario: Usuario | null;
  login: (dadosUsuario: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializa o estado lendo o localStorage (se houver alguém salvo, ele já começa logado)
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioSalvo = localStorage.getItem('@sipat:usuario');
    if (usuarioSalvo) {
      return JSON.parse(usuarioSalvo);
    }
    return null;
  });

  const login = (dadosUsuario: Usuario) => {
    setUsuario(dadosUsuario);
    localStorage.setItem('@sipat:usuario', JSON.stringify(dadosUsuario));
  };

  // Função para deslogar e limpar a memória
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('@sipat:usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}