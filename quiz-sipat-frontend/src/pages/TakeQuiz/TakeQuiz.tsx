import { useState, useEffect } from 'react';
import { ChevronLeft, Flag, ChevronRight, Clock, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import styles from './TakeQuiz.module.css';

// Tipagem para as questões vindas do backend
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

  // Estados do Jogo
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);

  // Busca as questões e inicia o Quiz no backend
  useEffect(() => {
    const iniciarEBuscarQuiz = async () => {
      if (!usuario || !id) return;

      try {
        setLoading(true);
        
        // 1. Tenta iniciar o quiz no backend (Isso valida a Regra de Ouro do DDD)
        await api.post('/quiz/iniciar', {
          cpf: usuario.cpf,
          dia_sipat_id: Number(id)
        });

        // 2. Se o backend liberou, buscamos as questões dinâmicas
        const response = await api.get(`/quiz/${id}`);
        const data = response.data;

        // Formata as questões do banco para o formato que o seu visual espera
        if (data.questoes && data.questoes.length > 0) {
          const questoesFormatadas = data.questoes.map((q: any) => ({
            id: q.id,
            text: q.enunciado,
            points: 100, // Pontuação base
            difficulty: 'Média', // Dificuldade padrão
            options: [
              { id: 'A', text: q.opcao_a },
              { id: 'B', text: q.opcao_b },
              { id: 'C', text: q.opcao_c },
              { id: 'D', text: q.opcao_d }
            ].filter(opt => opt.text) // Ignora opções que vierem vazias do banco
          }));
          
          setQuestions(questoesFormatadas);
        } else {
          alert("Nenhuma questão cadastrada para este dia.");
          navigate('/meus-quizzes');
        }

      } catch (err: any) {
        console.error("Erro ao iniciar quiz:", err);
        // O backend vai retornar 403 (bloqueado) ou 409 (já participou)
        alert(err.response?.data?.detail || "Erro ao carregar o quiz. Você já participou hoje?");
        navigate('/meus-quizzes');
      } finally {
        setLoading(false);
      }
    };

    iniciarEBuscarQuiz();
  }, [id, usuario, navigate]);

  // Cronômetro
  useEffect(() => {
    if (timeLeft > 0 && !loading && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, loading, questions]);

  const handleNextQuestion = async () => {
    if (!selectedOption || submitting) return;
    const currentQuestion = questions[currentQuestionIndex];

    try {
      setSubmitting(true);

      // 1. Envia a resposta selecionada para o backend
      const res = await api.post('/quiz/responder', {
        cpf: usuario?.cpf,
        dia_sipat_id: Number(id),
        questao_id: String(currentQuestion.id),
        alternativa_escolhida: selectedOption
      });

      // 2. O backend processa e nos diz se a resposta estava correta (Feedback imediato)
      // Assumimos que o backend retorna { acertou: true/false }
      const acertou = res.data?.acertou; 

      if (acertou) {
        setPoints(prev => prev + currentQuestion.points); // Acertou, ganha pontos
      } else {
        setLives(prev => prev - 1); // Errou, perde vida
        
        if (lives - 1 === 0) {
          alert("Fim de Jogo! Você perdeu todas as vidas.");
          navigate('/meus-quizzes');
          return; 
        }
      }
      
      // 3. Avança para a próxima questão
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

  // Telas de Carregamento
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
      {/* --- CABEÇALHO --- */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>Quiz Dia {id?.padStart(2, '0') || '01'} - SIPAT</h1>
      </header>

      <main className={styles.mainContent}>
        {/* --- ÁREA PRINCIPAL DO QUIZ --- */}
        <section className={styles.quizArea}>
          
          {/* Barra de Progresso */}
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

          {/* Cartão da Questão */}
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

          {/* Grid de Opções (2x2) */}
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

          {/* Ações Inferiores */}
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

        {/* --- PAINEL DE STATUS (LATERAL) --- */}
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