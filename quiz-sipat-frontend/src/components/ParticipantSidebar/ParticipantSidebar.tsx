import { BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './ParticipantSidebar.module.css';
import logoImg from '../../assets/Ricambiental_logo-30 A.png';

export function ParticipantSidebar() {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={logoImg} alt="SIPAT Logo" className={styles.logo} />
      </div>

      <nav className={styles.nav}>
        <Link 
          to="/meus-quizzes" 
          className={`${styles.navItem} ${location.pathname.includes('/meus-quizzes') ? styles.active : ''}`}
        >
          <BookOpen size={20} />
          <span>Meus Quizzes</span>
        </Link>
      </nav>
    </aside>
  );
}