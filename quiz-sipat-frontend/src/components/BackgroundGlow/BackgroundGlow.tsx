import styles from './BackgroundGlow.module.css';

export function BackgroundGlow() {
  return (
    <div className={styles.glowContainer}>
      <div className={`${styles.glowBlur} ${styles.glow1}`} />
      <div className={`${styles.glowBlur} ${styles.glow2}`} />
      <div className={`${styles.glowBlur} ${styles.glowBlur} ${styles.glow3}`} />
      <div className={`${styles.glowBlur} ${styles.glow4}`} />
      <div className={`${styles.glowBlur} ${styles.glow5}`} />
    </div>
  );
}