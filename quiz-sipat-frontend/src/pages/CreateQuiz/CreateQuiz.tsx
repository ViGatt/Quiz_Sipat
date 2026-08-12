import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Trash2, Plus, Circle, CheckCircle, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CreateQuiz.module.css';
import { api } from '../../services/api'; 

export function CreateQuiz() {
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Passo 1 (Configurações do Quiz)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Saúde');
  const [difficulty, setDifficulty] = useState('Médio');
  const [randomize, setRandomize] = useState(true);
  const [immediateResult, setImmediateResult] = useState(true);

  // --- NOVOS ESTADOS PARA INTEGRAÇÃO COM O BANCO ---
  const [tempoLimite, setTempoLimite] = useState(15);
  const [status, setStatus] = useState('Publicado');
  const [dataLiberacao, setDataLiberacao] = useState('');

  // Estados do Passo 2 (Carrossel de Questões)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      text: "",
      points: 10,
      type: "Multipla",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]
    }
  ]);

  // Atualiza texto da questão atual
  const updateQuestionText = (text: string) => {
    const updated = [...questions];
    updated[currentQuestionIndex].text = text;
    setQuestions(updated);
  };

  // Atualiza as opções (texto e resposta correta)
  const updateOption = (optIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[currentQuestionIndex].options[optIndex] = {
      ...updated[currentQuestionIndex].options[optIndex],
      [field]: value
    };

    // Se marcou como correta, desmarca as outras
    if (field === 'isCorrect' && value === true) {
      updated[currentQuestionIndex].options.forEach((opt, idx) => {
        if (idx !== optIndex) opt.isCorrect = false;
      });
    }
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      points: 10,
      type: "Multipla",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleDelete = () => {
    if (questions.length === 1) return;
    const updatedQuestions = questions.filter((_, idx) => idx !== currentQuestionIndex);
    setQuestions(updatedQuestions);
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const currentQuestion = questions[currentQuestionIndex];

  // --- O CORAÇÃO DO ENVIO PARA A API (ATUALIZADO) ---
  const handlePublish = async () => {
    if (!title || questions[0].text === "") {
      alert("Por favor, preencha o título e pelo menos uma questão!");
      return;
    }

    try {
      setIsSubmitting(true);

      // Formata os dados exatamente como o backend e o banco esperam
      const payload = {
        tema: title,
        descricao: description,
        // Adicionando as configurações reais de tempo e status
        tempo_limite: Number(tempoLimite) || 15,
        status: status,
        // Se for Programado, converte a data para o padrão ISO do banco (ex: 2026-08-12T10:00:00Z)
        data_liberacao: status === 'Programado' && dataLiberacao ? new Date(dataLiberacao).toISOString() : null,
        
        questoes: questions.map(q => {
          const opcoesObj: Record<string, string> = {};
          let respostaCorreta = 'A';
          const letras = ['A', 'B', 'C', 'D'];

          q.options.forEach((opt, idx) => {
            opcoesObj[letras[idx]] = opt.text || `Opção ${idx + 1}`; 
            if (opt.isCorrect) respostaCorreta = letras[idx];
          });

          return {
            texto: q.text,
            opcoes: opcoesObj,
            resposta_correta: respostaCorreta
          };
        })
      };

      await api.post('/quiz/', payload);
      
      setShowSuccess(true); 
      setTimeout(() => {
        navigate('/quizzes'); // Redirecionando para a Biblioteca de Quizzes ao invés do Dashboard
      }, 3000);

    } catch (err) {
      console.error("Erro ao publicar quiz:", err);
      alert("Erro ao salvar o Quiz. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successContent}>
          <div className={styles.iconPulse}>
            <CheckCircle size={80} color="var(--color-secondary)" />
          </div>
          <h2 className={styles.successTitle}>Quiz Criado com Sucesso!</h2>
          <p className={styles.successSubtitle}>Redirecionando para a biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/quizzes" className={styles.backButton}>
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
        {step === 1 && (
          <div className={styles.step1Grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Detalhe do Quiz</h2>
                <p>Informações Básicas</p>
              </div>

              <div className={styles.formGroup}>
                <label>Título / Tema do Quiz</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Ex: Quiz Dia 04 - Segurança do Trabalho" 
                  className={styles.inputField} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição</label>
                <textarea 
                  className={styles.textareaField} 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o propósito deste quiz..."
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select className={styles.selectField} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Saúde">Saúde</option>
                    <option value="EPI">EPI</option>
                    <option value="Ergonomia">Ergonomia</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Dificuldade</label>
                  <select className={styles.selectField} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Fácil">Fácil</option>
                    <option value="Médio">Médio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Configurações Quiz</h2>
                <p>Configure como seu Quiz funcionará</p>
              </div>

              {/* TEMPO LIMITE AGORA LIGADO AO ESTADO */}
              <div className={styles.formGroup}>
                <label>Tempo limite</label>
                <div className={styles.inputWrapper}>
                  <Clock size={18} className={styles.iconMuted} />
                  <input 
                    type="number" 
                    value={tempoLimite}
                    onChange={(e) => setTempoLimite(Number(e.target.value))} 
                    className={styles.inputTransparent} 
                  />
                  <span className={styles.suffix}>minutos</span>
                </div>
              </div>

              {/* NOVOS CAMPOS: STATUS E AGENDAMENTO */}
              <div className={styles.formGroup}>
                <label>Status de Publicação</label>
                <select className={styles.selectField} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Publicado">Publicar Imediatamente</option>
                  <option value="Programado">Programar para data futura</option>
                </select>
              </div>

              {status === 'Programado' && (
                <div className={styles.formGroup}>
                  <label>Data e Hora da Liberação</label>
                  <div className={styles.inputWrapper}>
                    <Calendar size={18} className={styles.iconMuted} />
                    <input 
                      type="datetime-local" 
                      value={dataLiberacao}
                      onChange={(e) => setDataLiberacao(e.target.value)} 
                      className={styles.inputTransparent} 
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup} style={{marginTop: '1rem'}}>
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

        {step === 2 && (
          <div className={styles.step2Container}>
            <div className={styles.card}>
              
              <div className={styles.cardHeaderWithCarousel}>
                <div>
                  <h2>Perguntas do Quiz</h2>
                  <p>Crie e Gerencie as perguntas</p>
                </div>
                
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

              <div className={styles.questionBlock}>
                <div className={styles.questionHeader}>
                  <h3>Pergunta {String(currentQuestionIndex + 1).padStart(2, '0')}</h3>
                  <div className={styles.questionSettings}>
                    <label>Pontos:</label>
                    <input type="number" value={currentQuestion.points} readOnly className={styles.pointsInput} />
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
                  <textarea 
                    className={styles.textareaField} 
                    rows={2}
                    value={currentQuestion.text}
                    onChange={(e) => updateQuestionText(e.target.value)}
                    placeholder="Digite sua pergunta aqui..."
                  />
                </div>

                <div className={styles.optionsSection}>
                  <label>Opções de Resposta</label>
                  
                  {currentQuestion.options.map((opt, index) => (
                    <div key={`opt-${index}`} className={`${styles.optionRow} ${opt.isCorrect ? styles.optionCorrect : ''}`}>
                      <button 
                        className={styles.radioBtn}
                        onClick={() => updateOption(index, 'isCorrect', true)}
                      >
                        {opt.isCorrect ? <CheckCircle size={20} className={styles.iconCyan} /> : <Circle size={20} className={styles.iconMuted} />}
                      </button>
                      <input 
                        type="text" 
                        value={opt.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        className={styles.optionInput} 
                        placeholder={`Digite a Opção ${['A', 'B', 'C', 'D'][index]}`}
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
            <button className={styles.btnOutline} onClick={() => setStep(1)} disabled={isSubmitting}>
              <ChevronLeft size={18} /> Anterior
            </button>
          ) : (
            <div style={{ width: '85px' }}></div>
          )}
          
          {step === 1 ? (
            <button className={styles.btnPrimary} onClick={() => setStep(2)}>
              Próximo Passo <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              className={styles.btnPrimary} 
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Finalizar e Salvar'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}