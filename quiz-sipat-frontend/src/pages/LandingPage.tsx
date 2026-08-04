import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import { Categories } from '../components/Categories/Categories';
import { Features } from '../components/Features/Features';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      
      <main>
        <Hero />
        <Categories />
        <Features />
      </main>
    </div>
  );
}