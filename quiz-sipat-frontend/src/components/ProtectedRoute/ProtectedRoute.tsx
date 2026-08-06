import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { usuario } = useAuth(); // Pergunta ao React quem está logado

  // Se não houver ninguém logado, ou se a pessoa NÃO for da comissão, manda pra fora!
  if (!usuario || !usuario.is_comissao) {
    return <Navigate to="/" replace />;
  }

  // Se passar no teste, libera o acesso às rotas gerenciais
  return <Outlet />;
}