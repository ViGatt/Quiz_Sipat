import { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import styles from './ParticipantQuizzes.module.css';
import { api } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext';
import { BackgroundGlow } from '../../components/BackgroundGlow/BackgroundGlow';

// Tipagem para os dados que vêm da API
interface QuizAPI {
  id: number;
  data: string;
  tema: string;
  link_youtube_palestra: string;
  descricao: string | null;
}

export function ParticipantQuizzes() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [quizzes, setQuizzes] = useState<QuizAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [concluidos, setConcluidos] = useState<number[]>([]);

  useEffect(() => {
    const fetchQuizzesEStatus = async () => {
      if (!usuario) return;

      try {
        setLoading(true);
        const [resQuizzes, resConcluidos] = await Promise.all([
          api.get('/quiz/'),
          api.get(`/quiz/concluidos/${usuario.cpf}`)
        ]);
        
        setQuizzes(resQuizzes.data.quizzes);
        setConcluidos(resConcluidos.data.concluidos);
        
      } catch (err) {
        console.error("Erro ao buscar quizzes:", err);
        setError("Não foi possível carregar os quizzes no momento. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesEStatus();
  }, [usuario]);

  return (
    <div className={styles.container}>
      <BackgroundGlow/>
      <ParticipantSidebar />
      
      <main className={styles.mainContent}>
        {/* Cabeçalho atualizado com display flex para separar o texto do botão */}
        <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className={styles.title}>Meus Quizzes</h1>
            <p className={styles.subtitle}>Assista às palestras e participe dos quizzes diários da SIPAT</p>
          </div>
          
          {/* O seu botão Home */}
          <Link to="/" className={styles.homeIconBtn} title="Voltar à Landing Page">
            <Home size={20} />
          </Link>
        </header>

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-primary)' }}>
            Carregando quizzes da SIPAT...
          </div>
        )}

        {error && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className={styles.quizzesList}>
            {quizzes.length === 0 ? (
              <p style={{ color: '#666' }}>Nenhum quiz liberado até o momento.</p>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className={styles.quizCard}>
                  <div className={styles.quizIcon}>
                    <BookOpen size={24} color="var(--color-primary)" />
                  </div>
                  
                  <div className={styles.quizInfo}>
                    <div className={styles.quizHeader}>
                      <h3 className={styles.quizTitle}>Dia {quiz.id} - {quiz.tema}</h3>
                      
                      {concluidos.includes(quiz.id) ? (
                        <span style={{ backgroundColor: '#22c55e', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Concluído
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Pendente
                        </span>
                      )}
                    </div>

                    <p className={styles.quizDescription}>
                      {quiz.descricao || 'Assista à palestra obrigatória para liberar o quiz do dia.'}
                    </p>

                    <div className={styles.quizMeta}>
                      <span>15 questões</span>
                      <span>⏱ 20 min</span>
                    </div>
                  </div>

                  <div className={styles.quizActions}>
                    <button 
                      className={styles.btnPrimary}
                      onClick={() => navigate(`/meus-quizzes/${quiz.id}`)}
                    >
                      <PlayCircle size={18} /> 
                      Acessar Palestra
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}