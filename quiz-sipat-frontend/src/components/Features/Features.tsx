import { BookOpen, Gift, BarChart2, TrendingUp, Trophy, Smartphone, Star} from 'lucide-react';
import styles from './Features.module.css';

export function Features() {
  const features = [
    { id: 1, title: 'Aprendizado personalizado', desc: 'Testes adaptativos que se ajustam ao seu nível de conhecimento.', icon: <BookOpen size={24} color="var(--color-accent-purple)" /> },
    { id: 2, title: 'Sorteio de premiação', desc: 'Ganhe pontos, medalhas e recompensas reais por suas conquistas.', icon: <Gift size={24} color="#FF6B6B" /> },
    { id: 3, title: 'Dashboard de Acompanhamento', desc: 'Ferramentas abrangentes para educadores criarem e gerenciarem quizzes.', icon: <BarChart2 size={24} color="var(--color-accent-blue)" /> },
    { id: 4, title: 'Monitoramento de evolução', desc: 'Testes adaptativos que se ajustam ao seu nível de conhecimento e ritmo.', icon: <TrendingUp size={24} color="var(--color-secondary)" /> },
    { id: 5, title: 'Dashboard Competitivo', desc: 'Compita com outros jogadores e suba no ranking em várias categorias.', icon: <Trophy size={24} color="#FFC107" /> },
    { id: 6, title: 'Amigável a dispositivo celular', desc: 'Acesse quizzes a qualquer hora, em qualquer lugar e em qualquer dispositivo.', icon: <Smartphone size={24} color="var(--color-text-muted)" /> },
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Star size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
          Features
        </div>
        <h2 className={styles.title}>
          Por que <span className={styles.highlight}>Participar?</span>
        </h2>
        <p className={styles.subtitle}>
          Descubra diversos quizzes para consolidar seu conhecimento e aprender sobre novos assuntos.
        </p>
      </div>

      <div className={styles.grid}>
        {features.map((feat) => (
          <div key={feat.id} className={styles.card}>
            <div className={styles.iconWrapper}>
              {feat.icon}
            </div>
            <h3 className={styles.cardTitle}>{feat.title}</h3>
            <p className={styles.cardDesc}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}