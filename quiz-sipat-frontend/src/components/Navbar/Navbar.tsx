import { useState } from 'react';
import { Menu, X, BarChart2, User, LogOut, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';

import logoRic from '../../assets/Ricambiental_logo-30 A.png';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const primeiroNome = usuario?.nome.split(' ')[0] || 'Usuário';

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '10px' }}>
          <img src={logoRic} alt="Logo SIPAT RIC Ambiental" className={styles.logo} />
          <span className={styles.logoText}>SIPAT RIC AMBIENTAL</span> 
        </Link>
      </div>

      {/* Navegação Desktop */}
      <nav className={styles.navDesktop}>
        <Link to="/" className={styles.navLink}>Início</Link>
        <Link to="/meus-quizzes" className={styles.navLink}>Quizzes</Link>
        <Link to="/programacao" className={styles.navLink}>Programação</Link>
        <a href="#premios" className={styles.navLink}>Prêmios</a>
        <Link to="/sobre" className={styles.navLink}>Sobre</Link>
      </nav>

      {/* Botões Desktop */}
      <div className={styles.authButtons}>
        {usuario?.is_comissao && (
          <Link to="/dashboard" className={styles.dashboardIcon} title="Acessar Dashboard">
            <BarChart2 size={24} />
          </Link>
        )}

        {usuario ? (
          <div className={styles.profileContainer}>
            <button 
              className={styles.profileBtn}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <User size={20} />
              <span>{primeiroNome}</span>
              <ChevronDown size={16} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {isProfileOpen && (
              <div className={styles.profileDropdown}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={18} /> Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.btnLogin}>Login</Link>
            <Link to="/register" className={styles.btnRegister}>Registre</Link>
          </>
        )}
      </div>

      {/* Botão Hambúrguer Mobile */}
      <button 
        className={styles.mobileMenuBtn}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {/* Link atualizado no menu Mobile também */}
          <Link to="/" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Início</Link>
          <Link to="/meus-quizzes" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Quizzes</Link>
          <Link to="/programacao" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Programação</Link>
          <a href="#premios" className={styles.navLink}>Prêmios</a>
          <Link to="/sobre" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Sobre</Link>
          
          <div className={styles.mobileAuthButtons}>
            {usuario ? (
              <button onClick={handleLogout} className={styles.btnRegister} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: '#ef4444' }}>
                <LogOut size={20} /> Sair ({primeiroNome})
              </button>
            ) : (
              <>
                <Link to="/login" className={styles.btnLogin}>Login</Link>
                <Link to="/register" className={styles.btnRegister}>Registre</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}