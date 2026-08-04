import styles from './CtaBanner.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png'; 

export function CtaBanner() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Pronto para começar sua jornada nesse evento?
          </h2>
          <p className={styles.subtitle}>
            Junte-se a nós nessa jornada. Realize o cadastro e comece a exploração.
          </p>
          <div className={styles.buttonGroup}>
            <button className={styles.btnPrimary}>Criar Conta</button>
            <button className={styles.btnSecondary}>Explorar Quizzes</button>
          </div>
        </div>
        
        <div className={styles.imageSide}>
          <div className={styles.whiteBackdrop}></div>
          <img src={mascotImg} alt="Mascote SIPAT" className={styles.mascot} />
        </div>
      </div>
    </section>
  );
}