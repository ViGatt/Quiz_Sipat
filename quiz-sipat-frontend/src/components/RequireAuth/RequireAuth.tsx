import { Outlet, Link } from 'react-router-dom';
import { Lock, LogIn, UserPlus, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './RequireAuth.module.css';

export function RequireAuth() {
  const { usuario } = useAuth();

  // Se NÃO houver usuário logado, a catraca trava e exibe esta tela:
  if (!usuario) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Lock size={48} className={styles.icon} />
          </div>
          
          <h2 className={styles.title}>Acesso Restrito</h2>
          <p className={styles.message}>
            Para garantir que sua participação seja registrada e que você concorra aos prêmios da SIPAT, é necessário identificar-se no sistema.
          </p>
          
          <div className={styles.actions}>
            <Link to="/login" className={styles.btnLogin}>
              <LogIn size={20} /> Fazer Login
            </Link>
            <Link to="/register" className={styles.btnRegister}>
              <UserPlus size={20} /> Primeiro Acesso
            </Link>
          </div>
          
          <Link to="/" className={styles.linkHome}>
            <Home size={18} /> Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}