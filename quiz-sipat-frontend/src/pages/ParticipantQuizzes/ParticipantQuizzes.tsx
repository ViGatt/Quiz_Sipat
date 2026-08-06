import { BookOpen, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import styles from './ParticipantQuizzes.module.css';

export function ParticipantQuizzes() {
  const navigate = useNavigate();

  const availableQuizzes = [
    { id: 1, title: 'Quiz Dia 01 - Tema EPI', description: 'Conceitos básicos de segurança', questions: 15, duration: '20 min', status: 'pendente' },
    { id: 2, title: 'Quiz Dia 02 - Tema Saúde', description: 'Prevenção e bem-estar', questions: 15, duration: '20 min', status: 'concluido', score: '14/15' },
  ];

  return (
    <div className={styles.container}>
      <ParticipantSidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Meus Quizzes</h1>
            <p className={styles.subtitle}>Assista às palestras e participe dos quizzes diários da SIPAT</p>
          </div>
        </header>

        <div className={styles.quizzesList}>
          {availableQuizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <div className={styles.quizIcon}>
                <BookOpen size={24} color="var(--color-primary)" />
              </div>
              
              <div className={styles.quizInfo}>
                <div className={styles.quizHeader}>
                  <h3 className={styles.quizTitle}>{quiz.title}</h3>
                  {quiz.status === 'concluido' ? (
                    <span className={styles.badgeCompleted}>Concluído</span>
                  ) : (
                    <span className={styles.badgePending}>Pendente</span>
                  )}
                </div>
                <p className={styles.quizDescription}>{quiz.description}</p>
                <div className={styles.quizMeta}>
                  <span>{quiz.questions} questões</span>
                  <span>⏱ {quiz.duration}</span>
                </div>
              </div>

              <div className={styles.quizActions}>
                <button 
                  className={quiz.status === 'concluido' ? styles.btnOutline : styles.btnPrimary}
                  onClick={() => navigate(`/meus-quizzes/${quiz.id}`)}
                >
                  <PlayCircle size={18} /> 
                  {quiz.status === 'concluido' ? 'Rever Palestra' : 'Acessar Palestra'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}