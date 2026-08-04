import { ShieldCheck, Leaf, Heart, Activity, Globe, BriefcaseMedical, ArrowRight, BookOpen } from 'lucide-react';
import styles from './Categories.module.css';

export function Categories() {
  const categories = [
    { id: 1, title: 'EPI', desc: 'Teste seu conhecimento sobre o uso de EPIs no dia a dia', icon: <ShieldCheck size={24} />, color: 'var(--color-primary)' },
    { id: 2, title: 'Hábitos saudáveis', desc: 'Teste seu conhecimento sobre hábitos saudáveis no dia a dia', icon: <Leaf size={24} />, color: 'var(--color-secondary)' },
    { id: 3, title: 'Saúde', desc: 'Teste seu conhecimento sobre o cuidado da saúde no dia a dia', icon: <Heart size={24} />, color: 'var(--color-accent-purple)' },
    { id: 4, title: 'Ergonomia', desc: 'Teste seu conhecimento sobre postura no escritório ou homeoffice no dia a dia', icon: <Activity size={24} />, color: '#FF6B6B' },
    { id: 5, title: 'Diversidade e inclusão', desc: 'Teste seu conhecimento sobre respeito às diferenças no dia a dia', icon: <Globe size={24} />, color: 'var(--color-accent-blue)' },
    { id: 6, title: 'Primeiros socorros', desc: 'Teste seu conhecimento sobre atendimento inicial no dia a dia', icon: <BriefcaseMedical size={24} />, color: '#FF6B6B' }, // Ajuste a cor do último se necessário
  ];

  return (
    <section className={styles.categoriesSection} id="quizzes">
      <div className={styles.header}>
        <div className={styles.badge}>
          <BookOpen size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
          Categories
        </div>
        <h2 className={styles.title}>
          Explore <span className={styles.highlight}>Categorias de Quiz</span>
        </h2>
        <p className={styles.subtitle}>
          Descubra quizzes sobre vários assuntos para testar e expandir seu conhecimento
        </p>
      </div>

      <div className={styles.grid}>
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className={styles.card}
            style={{ borderTop: `4px solid ${cat.color}` }}
          >
            <div 
              className={styles.iconWrapper} 
              style={{ backgroundColor: cat.color, color: '#ffffff' }}
            >
              {cat.icon}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <p className={styles.cardDesc}>{cat.desc}</p>
              <button className={styles.cardLink} style={{ color: cat.color }}>
                Explorar Quizzes <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
