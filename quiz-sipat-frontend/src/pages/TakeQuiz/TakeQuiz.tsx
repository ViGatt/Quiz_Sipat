import { useState, useEffect } from 'react';
import { ChevronLeft, Flag, ChevronRight, Clock, Heart, AlertCircle, Trophy, Target, BarChart2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './TakeQuiz.module.css';

interface Question {
  id: string | number;
  text: string;
  points: number;
  difficulty: string;
  options: { id: string; text: string }[];
}

export function TakeQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();

  const [showInstructions, setShowInstructions] = useState(true); 
  const [loading, setLoading] = useState(false); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Novos estados para o placar e modal final
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const iniciarEBuscarQuiz = async () => {
      if (!usuario || !id || showInstructions) return;

      try {
        setLoading(true);
        const response = await api.post('/quiz/iniciar', {
          cpf: usuario.cpf,
          dia_sipat_id: Number(id)
        });

        const data = response.data;

        if (data.questoes && data.questoes.length > 0) {
          const questoesFormatadas = data.questoes.map((q: any) => {
            let optionsList: {id: string, text: string}[] = [];

            if (Array.isArray(q.opcoes)) {
              const letters = ['A', 'B', 'C', 'D'];
              optionsList = q.opcoes.map((opt: string, idx: number) => ({
                id: letters[idx] || String(idx),
                text: opt
              }));
            } else if (typeof q.opcoes === 'object' && q.opcoes !== null) {
              ['A', 'B', 'C', 'D'].forEach(letter => {
                const optText = q.opcoes[letter] || q.opcoes[letter.toLowerCase()];
                if (optText) {
                  optionsList.push({ id: letter, text: optText });
                }
              });
            } else {
              if (q.opcao_a) optionsList.push({ id: 'A', text: q.opcao_a });
              if (q.opcao_b) optionsList.push({ id: 'B', text: q.opcao_b });
              if (q.opcao_c) optionsList.push({ id: 'C', text: q.opcao_c });
              if (q.opcao_d) optionsList.push({ id: 'D', text: q.opcao_d });
            }

            return {
              id: q.id,
              text: q.texto || q.enunciado || "Pergunta sem texto", 
              points: 100, 
              difficulty: 'Média', 
              options: optionsList.filter(opt => opt.text && opt.text.trim() !== '')
            };
          });
          
          setQuestions(questoesFormatadas);
        } else {
          alert("Nenhuma questão cadastrada para este dia.");
          navigate('/meus-quizzes');
        }

      } catch (err: any) {
        console.error("Erro ao iniciar quiz:", err);
        alert(err.response?.data?.detail || "Erro ao carregar o quiz. Você já participou hoje?");
        navigate('/meus-quizzes');
      } finally {
        setLoading(false);
      }
    };

    iniciarEBuscarQuiz();
  }, [id, usuario, navigate, showInstructions]);

  useEffect(() => {
    if (timeLeft > 0 && !loading && !showInstructions && !quizFinished && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, loading, showInstructions, quizFinished, questions]);

  const handleNextQuestion = async () => {
    if (!selectedOption || submitting) return;
    const currentQuestion = questions[currentQuestionIndex];

    try {
      setSubmitting(true);
      const res = await api.post('/quiz/responder', {
        cpf: usuario?.cpf,
        dia_sipat_id: Number(id),
        questao_id: String(currentQuestion.id),
        alternativa_escolhida: selectedOption
      });

      const acertou = res.data?.acertou; 
      
      let newPoints = points;
      let newCorrectCount = correctCount;
      let newLives = lives;

      if (acertou) {
        newPoints += currentQuestion.points;
        newCorrectCount += 1;
        setPoints(newPoints);
        setCorrectCount(newCorrectCount);
      } else {
        newLives -= 1;
        setLives(newLives);
      }
      
      const isGameOver = newLives === 0;
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (isGameOver || isLastQuestion) {
        setQuizFinished(true); // Aciona o pop-up maravilhoso!
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setTimeLeft(60); 
      }

    } catch (err: any) {
      console.error("Erro ao submeter resposta:", err);
      alert(err.response?.data?.detail || "Erro ao registrar sua resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showInstructions) {
    // ... [MANTENHA O SEU CÓDIGO DE INSTRUÇÕES IGUAL]
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.title}>Instruções do Quiz</h1>
        </header>

        <main className={styles.mainContent} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.instructionsCard}>
            <div className={styles.instructionsIcon}>
              <AlertCircle size={56} color="var(--color-primary)" />
            </div>
            <h2 className={styles.instructionsTitle}>Como Jogar</h2>
            
            <div className={styles.instructionsList}>
              <p><span>👉</span> <span>Você terá que responder <strong>15 questões</strong> sobre o tema do dia.</span></p>
              <p><span>👉</span> <span>Você tem um total de <strong>3 vidas</strong> (corações). Se errar 3 vezes, o jogo acaba.</span></p>
              <p><span>👉</span> <span>Você tem <strong>60 segundos</strong> para responder cada questão.</span></p>
              
              <div className={styles.instructionsWarning}>
                <strong>Regra do Sorteio:</strong><br/>
                Atenção! É necessário acertar no mínimo <strong>10 das 15 questões</strong> para ser elegível aos prêmios e sorteios da SIPAT.
              </div>
            </div>

            <button className={styles.btnStartQuiz} onClick={() => setShowInstructions(false)}>
              Entendi, Começar Quiz!
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <div style={{ margin: 'auto', padding: '3rem', color: 'white' }}>Carregando Jogo...</div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // --- MODAL DE FINALIZAÇÃO DO JOGO ---
  if (quizFinished) {
    const isWinner = correctCount >= 10; // Regra dos 10 acertos para o sorteio
    const isGameOver = lives === 0;

    return (
      <div className={styles.layout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.resultOverlay}>
          <div className={styles.resultCard}>
            
            <div className={styles.resultIconWrapper} style={{ backgroundColor: isWinner ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
              {isWinner ? <Trophy size={64} color="#22c55e" /> : <Target size={64} color="#f59e0b" />}
            </div>
            
            <h2 className={styles.resultTitle}>
              {isGameOver ? "Fim de Jogo!" : isWinner ? "Parabéns, excelente!" : "Bom esforço!"}
            </h2>
            
            <p className={styles.resultMessage}>
              {isGameOver 
                ? "Você perdeu todas as suas vidas. Revise o material e tente ir mais longe no quiz de amanhã!"
                : isWinner 
                  ? "Você garantiu sua elegibilidade para o sorteio. Continue participando para aumentar suas chances!" 
                  : "Você completou o quiz, mas não atingiu a pontuação mínima para o sorteio de hoje. Revise seus erros e amanhã tem mais!"}
            </p>

            <div className={styles.resultStats}>
              <div className={styles.statBox}>
                <span>Pontuação</span>
                <strong>{points} <small>pts</small></strong>
              </div>
              <div className={styles.statBox}>
                <span>Acertos</span>
                <strong>{correctCount} / {questions.length}</strong>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button className={styles.btnSecondary} onClick={() => navigate('/meus-quizzes')}>
                <ArrowLeft size={18} /> Central de Quizzes
              </button>
              <button className={styles.btnPrimary} onClick={() => navigate('/meu-desempenho')}>
                <BarChart2 size={18} /> Ver Meu Desempenho
              </button>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className={styles.layout}>
      {/* CABEÇALHO */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>Quiz Dia {id?.padStart(2, '0') || '01'} - SIPAT</h1>
      </header>

      <main className={styles.mainContent}>
        {/* ÁREA PRINCIPAL DO QUIZ */}
        <section className={styles.quizArea}>
          
          <div className={styles.progressHeader}>
            <span>Questão {String(currentQuestionIndex + 1).padStart(2, '0')} de {questions.length}</span>
            <span>{Math.round(progressPercentage)}% Completo</span>
          </div>
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionMeta}>
              <span className={styles.badgePoints}>{currentQuestion.points} points</span>
              <div className={`${styles.timer} ${timeLeft <= 10 ? styles.timerDanger : ''}`}>
                <Clock size={18} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <span className={styles.badgeDifficulty}>{currentQuestion.difficulty}</span>
            </div>
            <h2 className={styles.questionText}>{currentQuestion.text}</h2>
          </div>

          <div className={styles.optionsGrid}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <button 
                  key={opt.id} 
                  className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => setSelectedOption(opt.id)}
                  disabled={submitting}
                >
                  <span className={styles.optionLetter}>{opt.id}</span>
                  <span className={styles.optionText}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.actionFooter}>
            <button className={styles.btnSkip} disabled={submitting}>
              <Flag size={18} /> Pular
            </button>
            <button 
              className={styles.btnNext} 
              onClick={handleNextQuestion}
              disabled={selectedOption === null || submitting}
            >
              {submitting ? 'Enviando...' : 'Próxima Questão'} <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* PAINEL DE STATUS */}
        <aside className={styles.statusPanel}>
          <div className={styles.statusCard}>
            <h3 className={styles.statusTitle}>Status Quiz</h3>
            
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Pontos</span>
              <span className={styles.statusValueCyan}>{points}</span>
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Vidas</span>
              <div className={styles.livesContainer}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart 
                    key={i} 
                    size={20} 
                    fill={i < lives ? "#ef4444" : "transparent"} 
                    color={i < lives ? "#ef4444" : "var(--color-surface)"} 
                  />
                ))}
              </div>
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Progresso</span>
              <span className={styles.statusValueWhite}>{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}