import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { Categories } from '../components/Categories/Categories';
import { Features } from '../components/Features/Features';
import { CtaBanner } from '../components/CtaBanner/CtaBanner'; 
import { Footer } from '../components/Footer/Footer';        
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Luzes Principais (Maiores) */}
      <div className={`${styles.glowBlur} ${styles.glowBlueTop}`} />
      <div className={`${styles.glowBlur} ${styles.glowGreenMiddle}`} />
      <div className={`${styles.glowBlur} ${styles.glowBlueBottom}`} />

      {/* Luzes Secundárias (Menores e espalhadas para preencher o vazio) */}
      <div className={`${styles.glowBlur} ${styles.glowBlueSmallRight}`} />
      <div className={`${styles.glowBlur} ${styles.glowGreenSmallLeft}`} />
      <div className={`${styles.glowBlur} ${styles.glowBlueSmallBottomRight}`} />

      <div className={styles.contentOverlay}>
        <Navbar />
        
        <main>
          <Hero />
          <Categories />
          <Features />
          <CtaBanner /> 
        </main>

        <Footer /> 
      </div>
    </div>
  );
}