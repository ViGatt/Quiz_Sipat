import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { Categories } from '../components/Categories/Categories';
import { Features } from '../components/Features/Features';
import { CtaBanner } from '../components/CtaBanner/CtaBanner'; 
import { Footer } from '../components/Footer/Footer';        
import { BackgroundGlow } from '../components/BackgroundGlow/BackgroundGlow'; 
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.container}>
      
      {/* Luzes animadas e fixas no fundo */}
      <BackgroundGlow />

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