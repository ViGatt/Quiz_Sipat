import { Target } from 'lucide-react';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.badge}>
        <Target size={16} color="var(--color-primary)" />
        <span>Consolide seu aprendizado</span>
      </div>
      
      <h1 className={styles.title}>
        Aprenda, Responda, <span className={styles.highlight}>Ganhe Prêmios</span>
      </h1>
      
      <p className={styles.subtitle}>
        Teste seu conhecimento, consolide o aprendizado e concorra a prêmios incríveis que vão impulsionar sua jornada.
      </p>
      
      <div className={styles.buttonGroup}>
        <button className={styles.btnPrimary}>Começar</button>
        <button className={styles.btnSecondary}>Explorar Quizzes</button>
      </div>

      <div className={styles.socialProof}>
        <div className={styles.avatars}>
          <div className={styles.avatar} style={{ backgroundColor: '#FF6B6B' }}></div>
          <div className={styles.avatar} style={{ backgroundColor: '#4ECDC4' }}></div>
          <div className={styles.avatar} style={{ backgroundColor: '#45B7D1' }}></div>
        </div>
        <p><span className={styles.proofHighlight}>100+</span> participantes nessa semana</p>
      </div>
    </section>
  );
}