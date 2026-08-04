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
      <Navbar />
      
      <main>
        <Hero />
        <Categories />
        <Features />
        <CtaBanner /> 
      </main>

      <Footer /> 
    </div>
  );
}