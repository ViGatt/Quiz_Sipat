import { useState } from 'react';
import { Menu, X ,BarChart2 } from 'lucide-react';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

// 1. IMPORTANDO A IMAGEM AQUI:
import logoRic from '../../assets/Ricambiental_logo-30 A.png';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <Link to="/dashboard" className={styles.dashboardIcon} title="Acessar Dashboard">
          <BarChart2 size={24} />
        </Link>
        <Link to="/login" className={styles.btnLogin}>Login</Link>
        <Link to="/register" className={styles.btnRegister}>Registre</Link>
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
            <Link to="/login" className={styles.btnLogin}>Login</Link>
            <Link to="/register" className={styles.btnRegister}>Registre</Link>
          </div>
        </div>
      )}
    </header>
  );
}