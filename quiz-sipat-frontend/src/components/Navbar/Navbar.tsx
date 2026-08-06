import { useState } from 'react';
import { Menu, X, BarChart2, User, LogOut, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';

import logoRic from '../../assets/Ricambiental_logo-30 A.png';

// Importando a Memória Global do nosso sistema
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Função disparada ao clicar em "Sair"
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/'); // Redireciona para a home
  };

  // Pega o primeiro nome para não estourar o layout
  const primeiroNome = usuario?.nome.split(' ')[0] || 'Usuário';

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        {/* 2. USANDO A VARIÁVEL DA IMAGEM AQUI: */}
        <img src={logoRic} alt="Logo SIPAT RIC Ambiental" className={styles.logo} />
        
        <span className={styles.logoText}>SIPAT RIC AMBIENTAL</span> 
      </div>

      {/* Navegação Desktop */}
      <nav className={styles.navDesktop}>
        <a href="#quizzes" className={styles.navLink}>Quizzes</a>
        <a href="#diario" className={styles.navLink}>Quiz Diário</a>
        <a href="#premios" className={styles.navLink}>Prêmios</a>
        <a href="#sobre" className={styles.navLink}>Sobre</a>
      </nav>

      {/* Botões Desktop */}
      <div className={styles.authButtons}>
        {/* O botão do Dashboard agora só aparece SE a pessoa for da comissão */}
        {usuario?.is_comissao && (
          <Link to="/dashboard" className={styles.dashboardIcon} title="Acessar Dashboard">
            <BarChart2 size={24} />
          </Link>
        )}

        {/* Lógica Inteligente: Mostra Perfil se logado, ou Login/Registro se deslogado */}
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

            {/* Dropdown de Deslogar */}
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
          <a href="#quizzes" className={styles.navLink}>Quizzes</a>
          <a href="#diario" className={styles.navLink}>Quiz Diário</a>
          <a href="#premios" className={styles.navLink}>Prêmios</a>
          <a href="#sobre" className={styles.navLink}>Sobre</a>
          
          <div className={styles.mobileAuthButtons}>
            {/* Mesma Lógica Inteligente para o Mobile */}
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