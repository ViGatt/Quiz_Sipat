import React from 'react';
import { Navbar } from '../components/Navbar/Navbar';
import { Hero } from '../components/Hero/Hero';
import styles from './LandingPage.module.css';

export function LandingPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      
      <main>
        <Hero />
      </main>
    </div>
  );
}