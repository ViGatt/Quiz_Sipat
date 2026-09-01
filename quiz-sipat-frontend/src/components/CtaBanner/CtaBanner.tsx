import styles from './CtaBanner.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png'; 
import { useNavigate } from 'react-router-dom';

export function CtaBanner() {
  const navigate = useNavigate();
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
        {/* 3. Adicione o evento onClick com os caminhos corretos das suas rotas */}
          <button 
          className={styles.btnPrimary} 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            navigate('/register');
          }}
        >
          Criar Conta
        </button>
        
        <button 
        className={styles.btnSecondary} 
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate('/programacao');
        }}
      >
        Programação
      </button>
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