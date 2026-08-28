import { useState, useEffect } from 'react';
import { ChevronLeft, Flag, ChevronRight, Clock, Heart, AlertCircle, Trophy, Target, BarChart2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './TakeQuiz.module.css';

interface Question {
  id: string | number;
  text: string;
  points: number;
  difficulty: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  options: { id: string; text: string }[];
}

interface FeedbackState {
  isCorrect: boolean;
  text: string;
  isGameOver: boolean;
  isLastQuestion: boolean;
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
  
  // Estados do Jogo
  const [points, setPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);

  // NOVOS ESTADOS VINDOS DO BACK-END
  const [passingScore, setPassingScore] = useState(70);
  const [immediateResult, setImmediateResult] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

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

        // Salva as configurações dinâmicas
        setPassingScore(data.pontuacao_aprovacao ?? 70);
        setImmediateResult(data.resultado_imediato ?? true);
        const shouldRandomizeAnswers = data.aleatorizar_respostas ?? true;

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
            }

            optionsList = optionsList.filter(opt => opt.text && opt.text.trim() !== '');

            // EMBARALHAR ALTERNATIVAS SE A CONFIGURAÇÃO ESTIVER ATIVA
            if (shouldRandomizeAnswers) {
              optionsList.sort(() => Math.random() - 0.5);
            }

            return {
              id: q.id,
              text: q.texto || q.enunciado || "Pergunta sem texto", 
              points: q.pontos || 100, 
              difficulty: 'Média',
              feedbackCorrect: q.feedback_correto || "",
              feedbackIncorrect: q.feedback_incorreto || "",
              options: optionsList
            };
          });
          
          setQuestions(questoesFormatadas);
        } else {
          alert("Nenhuma questão cadastrada para este dia.");
          navigate('/meus-quizzes');
        }

      } catch (err: any) {
        console.error("Erro ao iniciar quiz:", err);
        alert(err.response?.data?.detail || "Erro ao carregar o quiz.");
        navigate('/meus-quizzes');
      } finally {
        setLoading(false);
      }
    };

    iniciarEBuscarQuiz();
  }, [id, usuario, navigate, showInstructions]);

  // Cronômetro (pausa se o modal de feedback estiver aberto)
  useEffect(() => {
    if (timeLeft > 0 && !loading && !showInstructions && !quizFinished && !feedback && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, loading, showInstructions, quizFinished, feedback, questions]);

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

      // Se resultado imediato está ativo, abre o modal de feedback
      if (immediateResult) {
        setFeedback({
          isCorrect: acertou,
          text: acertou 
            ? (currentQuestion.feedbackCorrect || "Resposta Correta! Muito bem.")
            : (currentQuestion.feedbackIncorrect || "Resposta Incorreta. Fique atento!"),
          isGameOver,
          isLastQuestion
        });
      } else {
        // Se estiver desligado, pula direto
        proceedToNext(isGameOver, isLastQuestion);
      }

    } catch (err: any) {
      console.error("Erro ao submeter resposta:", err);
      alert(err.response?.data?.detail || "Erro ao registrar sua resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToNext = (isGameOver: boolean, isLastQuestion: boolean) => {
    setFeedback(null);
    if (isGameOver || isLastQuestion) {
      setQuizFinished(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(60); 
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showInstructions) {
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
              <p><span>👉</span> <span>Você tem um total de <strong>3 vidas</strong> (corações). Se errar 3 vezes, o jogo acaba.</span></p>
              <p><span>👉</span> <span>Você tem <strong>60 segundos</strong> para responder cada questão.</span></p>
              
              <div className={styles.instructionsWarning}>
                <strong>Regra do Sorteio:</strong><br/>
                Atenção! É necessário acertar no mínimo <strong>{passingScore}% das questões</strong> para ser elegível aos prêmios e sorteios da SIPAT.
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
    const userPercentage = (correctCount / questions.length) * 100;
    const isWinner = userPercentage >= passingScore; 
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
                  : `Você não atingiu a pontuação mínima de ${passingScore}% para o sorteio de hoje. Revise seus erros e amanhã tem mais!`}
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
      
      {/* MODAL DE FEEDBACK IMEDIATO */}
      {feedback && (
        <div className={styles.resultOverlay} style={{ zIndex: 2000 }}>
          <div className={styles.feedbackCard} style={{ borderTop: `4px solid ${feedback.isCorrect ? '#22c55e' : '#ef4444'}` }}>
            <div className={styles.feedbackHeader} style={{ color: feedback.isCorrect ? '#22c55e' : '#ef4444' }}>
              {feedback.isCorrect ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
              <h2>{feedback.isCorrect ? 'Resposta Certa!' : 'Resposta Errada!'}</h2>
            </div>
            <p className={styles.feedbackMessage}>{feedback.text}</p>
            <button 
              className={styles.btnPrimary} 
              onClick={() => proceedToNext(feedback.isGameOver, feedback.isLastQuestion)}
            >
              {feedback.isGameOver || feedback.isLastQuestion ? 'Ver Resultado Final' : 'Próxima Questão'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* CABEÇALHO */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>Quiz Dia {id?.padStart(2, '0') || '01'} - SIPAT</h1>
      </header>

      <main className={styles.mainContent}>
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
                  disabled={submitting || feedback !== null}
                >
                  <span className={styles.optionLetter}>{opt.id}</span>
                  <span className={styles.optionText}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.actionFooter}>
            <button className={styles.btnSkip} disabled={submitting || feedback !== null}>
              <Flag size={18} /> Pular
            </button>
            <button 
              className={styles.btnNext} 
              onClick={handleNextQuestion}
              disabled={selectedOption === null || submitting || feedback !== null}
            >
              {submitting ? 'Enviando...' : 'Confirmar Resposta'} <ChevronRight size={18} />
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