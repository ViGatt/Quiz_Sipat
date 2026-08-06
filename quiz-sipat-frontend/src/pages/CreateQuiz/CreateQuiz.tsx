import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Trash2, Plus, Circle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './CreateQuiz.module.css';

export function CreateQuiz() {
  const [step, setStep] = useState(1);
  const [randomize, setRandomize] = useState(true);
  const [immediateResult, setImmediateResult] = useState(true);

  // --- LÓGICA DO CARROSSEL DE QUESTÕES ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "Colocar sacola na geladeira pode causar....",
      points: 10,
      type: "Multipla",
      options: [
        { text: "Nada, só enfeita", isCorrect: false },
        { text: "Ocupar espaço", isCorrect: false },
        { text: "Contaminação Cruzada", isCorrect: true },
        { text: "Conter umidade", isCorrect: false },
      ]
    }
  ]);

  // Função para adicionar nova questão em branco
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      points: 10,
      type: "Multipla",
      options: [
        { text: "", isCorrect: true }, // A primeira nasce correta por padrão
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length); // Pula para a nova questão criada
  };

  // Funções de navegação do carrossel
  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  // Função para deletar a questão atual
  const handleDelete = () => {
    if (questions.length === 1) return; // Impede deletar se só tiver 1
    const updatedQuestions = questions.filter((_, idx) => idx !== currentQuestionIndex);
    setQuestions(updatedQuestions);
    // Ajusta o índice para não bugar a tela
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  // Pega a questão que está visível no momento
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.layout}>
      {/* CABEÇALHO FIXO */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/dashboard" className={styles.backButton}>
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className={styles.title}>Criar Novo Quiz</h1>
            <p className={styles.subtitle}>Adicione questões, defina perguntas e configure o quiz</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnOutline}>Salvar Rascunho</button>
          <button className={styles.btnPrimary}>Prévia</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* --- PASSO 1 --- */}
        {step === 1 && (
          <div className={styles.step1Grid}>
            {/* Coluna Esquerda: Detalhes */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Detalhe do Quiz</h2>
                <p>Informações Básicas</p>
              </div>

              <div className={styles.formGroup}>
                <label>Título do Quiz</label>
                <input type="text" defaultValue="Quiz Dia 02 - Tema Saúde" className={styles.inputField} />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  className={styles.textareaField} 
                  rows={4}
                  defaultValue="Teste seu conhecimento sobre o tema de saúde, consolide o aprendizado e tenha oportunidade de aprender sobre novos assuntos"
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select className={styles.selectField} defaultValue="Saúde">
                    <option value="Saúde">Saúde</option>
                    <option value="EPI">EPI</option>
                    <option value="Ergonomia">Ergonomia</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Dificuldade</label>
                  <select className={styles.selectField} defaultValue="Médio">
                    <option value="Fácil">Fácil</option>
                    <option value="Médio">Médio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Configurações */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Configurações Quiz</h2>
                <p>Configure como seu Quiz funcionará</p>
              </div>

              <div className={styles.formGroup}>
                <label>Tempo limite</label>
                <div className={styles.inputWrapper}>
                  <Clock size={18} className={styles.iconMuted} />
                  <input type="number" defaultValue="15" className={styles.inputTransparent} />
                  <span className={styles.suffix}>minutos</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Pontuação para aprovação</label>
                <div className={styles.inputWrapper}>
                  <CheckCircle2 size={18} className={styles.iconMuted} />
                  <input type="number" defaultValue="70" className={styles.inputTransparent} />
                  <span className={styles.suffix}>%</span>
                </div>
              </div>

              <div className={styles.switchGroup}>
                <div>
                  <label>Aleatorizar questões</label>
                  <p>Mostre questões em ordens diferentes</p>
                </div>
                <div 
                  className={`${styles.toggleSwitch} ${randomize ? styles.toggleOn : ''}`}
                  onClick={() => setRandomize(!randomize)}
                >
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>

              <div className={styles.switchGroup}>
                <div>
                  <label>Resultado Imediato</label>
                  <p>Mostre o resultado de cada questão</p>
                </div>
                <div 
                  className={`${styles.toggleSwitch} ${immediateResult ? styles.toggleOn : ''}`}
                  onClick={() => setImmediateResult(!immediateResult)}
                >
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PASSO 2 (COM CARROSSEL) --- */}
        {step === 2 && (
          <div className={styles.step2Container}>
            <div className={styles.card}>
              
              {/* Header do Card + Controles do Carrossel */}
              <div className={styles.cardHeaderWithCarousel}>
                <div>
                  <h2>Perguntas do Quiz</h2>
                  <p>Crie e Gerencie as perguntas</p>
                </div>
                
                {/* Controles do Carrossel (< >) */}
                <div className={styles.carouselControls}>
                  <button 
                    className={styles.btnCarousel} 
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className={styles.questionCounter}>
                    {currentQuestionIndex + 1} de {questions.length}
                  </span>
                  <button 
                    className={styles.btnCarousel} 
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Bloco de Pergunta (Exibe apenas a questão atual) */}
              <div className={styles.questionBlock}>
                <div className={styles.questionHeader}>
                  <h3>Pergunta {String(currentQuestionIndex + 1).padStart(2, '0')}</h3>
                  <div className={styles.questionSettings}>
                    <label>Pontos:</label>
                    <input type="number" defaultValue={currentQuestion.points} className={styles.pointsInput} />
                    <select className={styles.selectFieldSmall} defaultValue={currentQuestion.type}>
                      <option value="Multipla">Múltipla Escolha</option>
                      <option value="VF">Verdadeiro/Falso</option>
                    </select>
                    <button 
                      className={styles.btnIconDanger} 
                      onClick={handleDelete}
                      disabled={questions.length === 1}
                      title={questions.length === 1 ? "Não é possível deletar a única questão" : "Deletar questão"}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Texto da Pergunta</label>
                  {/* O "key" força o React a limpar o campo quando mudamos de questão */}
                  <textarea 
                    key={`text-${currentQuestion.id}`}
                    className={styles.textareaField} 
                    rows={2}
                    defaultValue={currentQuestion.text}
                    placeholder="Digite sua pergunta aqui..."
                  />
                </div>

                <div className={styles.optionsSection}>
                  <label>Opções de Resposta</label>
                  
                  {/* Lista de Opções da questão atual */}
                  {currentQuestion.options.map((opt, index) => (
                    <div key={`opt-${currentQuestion.id}-${index}`} className={`${styles.optionRow} ${opt.isCorrect ? styles.optionCorrect : ''}`}>
                      <button className={styles.radioBtn}>
                        {opt.isCorrect ? <CheckCircle size={20} className={styles.iconCyan} /> : <Circle size={20} className={styles.iconMuted} />}
                      </button>
                      <input 
                        type="text" 
                        defaultValue={opt.text} 
                        className={styles.optionInput} 
                        placeholder={`Opção ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <button className={styles.btnAddQuestion} onClick={handleAddQuestion}>
                  <Plus size={18} /> Adicionar Nova Questão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO INFERIOR */}
        <div className={styles.footerActions}>
          {step === 2 ? (
            <button className={styles.btnOutline} onClick={() => setStep(1)}>
              <ChevronLeft size={18} /> Prev
            </button>
          ) : (
            <div style={{ width: '85px' }}></div>
          )}
          
          {step === 1 ? (
            <button className={styles.btnPrimary} onClick={() => setStep(2)}>
              Prox. <ChevronRight size={18} />
            </button>
          ) : (
            <button className={styles.btnPrimary}>
              Prévia e Publicar
            </button>
          )}
        </div>
      </main>
    </div>
  );
}