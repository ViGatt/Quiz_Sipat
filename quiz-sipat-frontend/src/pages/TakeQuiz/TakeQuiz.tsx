import { useState, useEffect } from 'react';
import { ChevronLeft, Flag, ChevronRight, Clock, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './TakeQuiz.module.css';

export function TakeQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos por questão, por exemplo

  // Mock de Questões (respeitando a regra de 1 alternativa correta)
  const questions = [
    {
      id: 1,
      points: 100,
      difficulty: 'Média',
      text: 'Colocar sacola na geladeira pode causar....',
      options: [
        { id: 1, text: 'Nada, só enfeita' },
        { id: 2, text: 'Ocupar Espaço' },
        { id: 3, text: 'Contaminação Cruzada', isCorrect: true},
        { id: 4, text: 'Conter Umidade' },
      ]
    },
    {
      id: 2,
      points: 150,
      difficulty: 'Difícil',
      text: 'Qual o EPI correto para o manuseio de produtos químicos corrosivos?',
      options: [
        { id: 1, text: 'Luva de algodão' },
        { id: 2, text: 'Óculos de proteção e luvas de nitrila', isCorrect: true },
        { id: 3, text: 'Apenas capacete' },
        { id: 4, text: 'Bota de couro' },
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      // Verifica se a opção selecionada é a correta
      const optionSelected = currentQuestion.options.find(opt => opt.id === selectedOption);
      
      if (optionSelected?.isCorrect) {
        setPoints(prev => prev + currentQuestion.points); // Acertou, ganha pontos
      } else {
        // ERROU! Usa o setLives para tirar uma vida
        setLives(prev => prev - 1);
        
        // Verifica se perdeu a última vida (Game Over)
        if (lives - 1 === 0) {
          alert("Fim de Jogo! Você perdeu todas as vidas.");
          navigate('/dashboard');
          return; // Para a função aqui
        }
      }
    }
    
    // Avança para a próxima questão se ainda tiver vidas
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(60); 
    } else {
      alert("Quiz finalizado! Você marcou " + points + " pontos.");
      navigate('/dashboard');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.layout}>
      {/* --- CABEÇALHO --- */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>Quiz Dia {id?.padStart(2, '0') || '01'} - Tema Saúde</h1>
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
            {currentQuestion.options.map((opt, index) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedOption === opt.id;
              
              return (
                <button 
                  key={opt.id} 
                  className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''}`}
                  onClick={() => setSelectedOption(opt.id)}
                >
                  <span className={styles.optionLetter}>{letters[index]}</span>
                  <span className={styles.optionText}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Ações Inferiores */}
          <div className={styles.actionFooter}>
            <button className={styles.btnSkip}>
              <Flag size={18} /> Pular
            </button>
            <button 
              className={styles.btnNext} 
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
            >
              Próxima Questão <ChevronRight size={18} />
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

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Posição</span>
              <span className={styles.statusValueCyan}>2nd</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}