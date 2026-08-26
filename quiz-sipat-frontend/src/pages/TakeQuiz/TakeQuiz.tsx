import { useState, useEffect } from 'react';
import { ChevronLeft, Flag, ChevronRight, Clock, Heart, AlertCircle } from 'lucide-react';
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
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);

  // Busca as questões e inicia o Quiz no backend SOMENTE APÓS fechar as instruções
  useEffect(() => {
    const iniciarEBuscarQuiz = async () => {
      if (!usuario || !id || showInstructions) return;

      try {
        setLoading(true);
        
        // 1. Inicia o quiz E já aproveita as questões que o backend devolve!
        const response = await api.post('/quiz/iniciar', {
          cpf: usuario.cpf,
          dia_sipat_id: Number(id)
        });

        const data = response.data;

        if (data.questoes && data.questoes.length > 0) {
          const questoesFormatadas = data.questoes.map((q: any) => {
            let optionsList: {id: string, text: string}[] = [];

            // Tratamento Inteligente para as Opções
            if (Array.isArray(q.opcoes)) {
              // Se vier como Lista: ["Opcao A", "Opcao B"]
              const letters = ['A', 'B', 'C', 'D'];
              optionsList = q.opcoes.map((opt: string, idx: number) => ({
                id: letters[idx] || String(idx),
                text: opt
              }));
            } else if (typeof q.opcoes === 'object' && q.opcoes !== null) {
              // Se vier como JSON: {"A": "Certa", "B": "Errada"}
              ['A', 'B', 'C', 'D'].forEach(letter => {
                const optText = q.opcoes[letter] || q.opcoes[letter.toLowerCase()];
                if (optText) {
                  optionsList.push({ id: letter, text: optText });
                }
              });
            } else {
              // Fallback se vier da rota GET acidentalmente
              if (q.opcao_a) optionsList.push({ id: 'A', text: q.opcao_a });
              if (q.opcao_b) optionsList.push({ id: 'B', text: q.opcao_b });
              if (q.opcao_c) optionsList.push({ id: 'C', text: q.opcao_c });
              if (q.opcao_d) optionsList.push({ id: 'D', text: q.opcao_d });
            }

            return {
              id: q.id,
              // Tenta pegar o "texto" (do POST) ou "enunciado" (do GET)
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

  // Cronômetro
  useEffect(() => {
    if (timeLeft > 0 && !loading && !showInstructions && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, loading, showInstructions, questions]);

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

      if (acertou) {
        setPoints(prev => prev + currentQuestion.points);
      } else {
        setLives(prev => prev - 1);
        
        if (lives - 1 === 0) {
          alert("Fim de Jogo! Você perdeu todas as vidas.");
          navigate('/meus-quizzes');
          return; 
        }
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setTimeLeft(60); 
      } else {
        alert(`Quiz finalizado com sucesso! Você marcou ${points + (acertou ? currentQuestion.points : 0)} pontos.`);
        navigate('/meus-quizzes');
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

  // --- TELA DE INSTRUÇÕES (POP-UP / LOBBY) ---
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
              <p><span>👉</span> <span>Você terá que responder <strong>15 questões</strong> sobre o tema do dia.</span></p>
              <p><span>👉</span> <span>Você tem um total de <strong>3 vidas</strong> (corações). Se errar 3 vezes, o jogo acaba.</span></p>
              <p><span>👉</span> <span>Você tem <strong>60 segundos</strong> para responder cada questão.</span></p>
              
              <div className={styles.instructionsWarning}>
                <strong>Regra do Sorteio:</strong><br/>
                Atenção! É necessário acertar no mínimo <strong>10 das 15 questões</strong> para ser elegível aos prêmios e sorteios da SIPAT.
              </div>
            </div>

            <button 
              className={styles.btnStartQuiz} 
              onClick={() => setShowInstructions(false)}
            >
              Entendi, Começar Quiz!
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- TELAS DE CARREGAMENTO E JOGO NORMAL ---
  if (loading) {
    return (
      <div className={styles.layout}>
        <div style={{ margin: 'auto', padding: '3rem', color: 'white' }}>Carregando Jogo...</div>
      </div>
    );
  }

  if (questions.length === 0) return null;

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