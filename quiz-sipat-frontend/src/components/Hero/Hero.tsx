import { Target } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

import mascoteImg from '../../assets/MASCOTE-CIPA-MARI.png'; 

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Animação para a mascote entrar deslizando da direita
  const mascotVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } 
    }
  };

  return (
    <section className={styles.heroSection}>
      {/* LADO ESQUERDO: CONTEÚDO */}
      <motion.div 
        className={styles.contentWrapper}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className={styles.badge}>
          <Target size={16} color="var(--color-primary)" />
          <span>Consolide seu aprendizado</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className={styles.title}>
          Aprenda, Responda, <br/><span className={styles.highlight}>Ganhe Prêmios</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className={styles.subtitle}>
          Teste seu conhecimento, consolide o aprendizado e concorra a prêmios incríveis que vão impulsionar sua jornada.
        </motion.p>
        
        <motion.div variants={itemVariants} className={styles.buttonGroup}>
          <Link to="/meus-quizzes" className={styles.btnPrimary}>Começar</Link>
          <Link to="/programacao" className={styles.btnSecondary}>Programação</Link>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.socialProof}>
          <div className={styles.avatars}>
            <div className={styles.avatar} style={{ backgroundColor: '#FF6B6B' }}></div>
            <div className={styles.avatar} style={{ backgroundColor: '#4ECDC4' }}></div>
            <div className={styles.avatar} style={{ backgroundColor: '#45B7D1' }}></div>
          </div>
          <p><span className={styles.proofHighlight}>100+</span> participantes nessa semana</p>
        </motion.div>
      </motion.div>

      {/* LADO DIREITO: MASCOTE */}
      <motion.div 
        className={styles.mascotWrapper}
        variants={mascotVariants}
        initial="hidden"
        animate="visible"
      >
        <img src={mascoteImg} alt="Mascote SIPAT" className={styles.mascotImage} />
      </motion.div>
    </section>
  );
}