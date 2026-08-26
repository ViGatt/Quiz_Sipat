import { useState, useEffect } from 'react';
import { Trophy, Ticket, XCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import { BackgroundGlow } from '../../components/BackgroundGlow/BackgroundGlow';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './MeuDesempenho.module.css';

interface ErroQuiz {
  questao: string;
  resposta_correta: string;
}

interface ResumoQuiz {
  dia_sipat_id: number;
  tema: string;
  acertos: number;
  total_questoes: number;
  erros: ErroQuiz[];
}

interface DesempenhoData {
  pontuacao_total: number;
  numero_sorte: string | null;
  elegivel_sorteio: boolean;
  quizzes_respondidos: ResumoQuiz[];
}

export function MeuDesempenho() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState<DesempenhoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  useEffect(() => {
    const fetchDesempenho = async () => {
      if (!usuario) return;
      try {
        setLoading(true);
        const response = await api.get(`/relatorios/meu-resumo/${usuario.cpf}`);
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao carregar desempenho", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesempenho();
  }, [usuario]);

  const toggleExpand = (quizId: number) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  return (
    <div className={styles.layout}>
      <BackgroundGlow />
      <ParticipantSidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>Meu Desempenho</h1>
          <p className={styles.subtitle}>Acompanhe sua pontuação, seus números da sorte e revise seus erros.</p>
        </header>

        {loading ? (
          <p style={{ color: 'var(--color-text-dark)' }}>Carregando seu histórico...</p>
        ) : dados ? (
          <>
            {/* CARDS DE DESTAQUE */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(0, 195, 255, 0.1)', color: 'var(--color-primary)' }}>
                  <Trophy size={32} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Pontuação Total</h3>
                  <span className={styles.statValue}>{dados.pontuacao_total} <small>pts</small></span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: dados.elegivel_sorteio ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: dados.elegivel_sorteio ? '#22c55e' : '#f59e0b' }}>
                  <Ticket size={32} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Número da Sorte</h3>
                  {dados.numero_sorte ? (
                    <div className={styles.luckyContainer}>
                      <span className={styles.luckyLabel}>Total gerados: 1</span>
                      <span className={styles.luckyNumberSmall}>{dados.numero_sorte}</span>
                    </div>
                  ) : (
                    <span className={styles.statPending}>
                      {dados.elegivel_sorteio ? 'Gerando...' : 'Faltam acertos'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* LISTA DE QUIZZES RESPONDIDOS */}
            <section className={styles.historySection}>
              <h2 className={styles.sectionTitle}>Histórico de Revisão</h2>
              
              {dados.quizzes_respondidos.length === 0 ? (
                <p className={styles.emptyText}>Você ainda não respondeu a nenhum quiz.</p>
              ) : (
                <div className={styles.quizList}>
                  {dados.quizzes_respondidos.map((quiz) => {
                    const porcentagem = Math.round((quiz.acertos / quiz.total_questoes) * 100);
                    const isExpanded = expandedQuiz === quiz.dia_sipat_id;
                    const pontuacaoQuiz = quiz.acertos * 100; // Cálculo dinâmico da pontuação

                    return (
                      <div key={quiz.dia_sipat_id} className={styles.quizCard}>
                        <div className={styles.quizHeader} onClick={() => toggleExpand(quiz.dia_sipat_id)}>
                          <div className={styles.quizMainInfo}>
                            <h4>Dia {quiz.dia_sipat_id} - {quiz.tema}</h4>
                            <div className={styles.quizMetrics}>
                              <span className={styles.accuracy}>
                                <CheckCircle size={14} color="#22c55e" /> {quiz.acertos}/{quiz.total_questoes} Acertos ({porcentagem}%)
                              </span>
                              {/* NOVA LABEL DE PONTUAÇÃO */}
                              <span className={styles.quizPointsLabel}>
                                <Trophy size={14} color="#00c3ff" /> {pontuacaoQuiz} pts
                              </span>
                            </div>
                          </div>
                          <button className={styles.btnExpand}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>

                        {/* ÁREA EXPANSÍVEL COM OS ERROS */}
                        {isExpanded && (
                          <div className={styles.quizDetails}>
                            {quiz.erros.length === 0 ? (
                              <div className={styles.perfectScore}>
                                <Trophy size={20} color="#f59e0b" />
                                <p>Parabéns! Você gabaritou este quiz e não teve nenhum erro.</p>
                              </div>
                            ) : (
                              <div className={styles.errorList}>
                                <h5>O que você precisa revisar:</h5>
                                <ul>
                                  {quiz.erros.map((erro, index) => (
                                    <li key={index}>
                                      <div className={styles.errorQuestion}>
                                        <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>{erro.questao}</span>
                                      </div>
                                      <div className={styles.correctAnswer}>
                                        <strong>Resposta correta:</strong> {erro.resposta_correta}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}