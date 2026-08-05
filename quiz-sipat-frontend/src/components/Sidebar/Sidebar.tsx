import { Search, LayoutDashboard, BookOpen, Calendar, Users, Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logoTitle}>
          SIPAT <span className={styles.logoHighlight}>RIC AMBIENTAL</span>
        </h2>
      </div>

      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search..." className={styles.searchInput} />
      </div>

      <nav className={styles.navMenu}>
        <Link to="/dashboard" className={`${styles.navItem} ${styles.active}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/quizzes" className={styles.navItem}>
          <BookOpen size={20} />
          <span>Quizzes</span>
        </Link>
        <Link to="/eventos" className={styles.navItem}>
          <Calendar size={20} />
          <span>Eventos</span>
        </Link>
        <Link to="/participantes" className={styles.navItem}>
          <Users size={20} />
          <span>Participantes</span>
        </Link>
      </nav>

      <div className={styles.bottomMenu}>
        <p className={styles.sectionTitle}>Gerenciamento</p>
        <Link to="/configuracoes" className={styles.navItem}>
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}