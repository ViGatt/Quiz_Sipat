import { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './ParticipantSidebar.module.css';
import logoImg from '../../assets/Ricambiental_logo-30 A.png';

export function ParticipantSidebar() {
  const location = useLocation();

  // Começa sempre retraído ao entrar na página
  const [isOpen, setIsOpen] = useState(false);

  // Fecha automaticamente ao trocar de rota (importante no mobile,
  // pra não deixar o drawer aberto por cima da próxima página)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/meus-quizzes', label: 'Meus Quizzes', icon: BookOpen },
    { to: '/meu-desempenho', label: 'Meu Desempenho', icon: BarChart2 },
  ];

  return (
    <>
      {/* Botão flutuante para abrir/fechar (visível sempre, mas essencial no mobile) */}
      <button
        className={styles.toggleBtn}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay escuro no mobile quando o menu está aberto */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}>
        <div className={styles.logoContainer}>
          <img src={logoImg} alt="SIPAT Logo" className={styles.logo} />
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.navItem} ${location.pathname.includes(to) ? styles.active : ''}`}
              title={label}
            >
              <Icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}