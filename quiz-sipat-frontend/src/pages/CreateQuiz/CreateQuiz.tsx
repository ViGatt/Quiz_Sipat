import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Trash2, Plus, Circle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './CreateQuiz.module.css';

export function CreateQuiz() {
  const [step, setStep] = useState(1);
  const [randomize, setRandomize] = useState(true);
  const [immediateResult, setImmediateResult] = useState(true);
  const [correctOption, setCorrectOption] = useState(2); // Simula a opção correta selecionada no Passo 2

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
        {/* CONTEÚDO DO PASSO 1 */}
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

        {/* CONTEÚDO DO PASSO 2 */}
        {step === 2 && (
          <div className={styles.step2Container}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Perguntas do Quiz</h2>
                <p>Crie e Gerencie as perguntas</p>
              </div>

              {/* Bloco de Pergunta */}
              <div className={styles.questionBlock}>
                <div className={styles.questionHeader}>
                  <h3>Pergunta 01</h3>
                  <div className={styles.questionSettings}>
                    <label>Pontos:</label>
                    <input type="number" defaultValue="10" className={styles.pointsInput} />
                    <select className={styles.selectFieldSmall} defaultValue="Multipla">
                      <option value="Multipla">Múltipla Escolha</option>
                      <option value="VF">Verdadeiro/Falso</option>
                    </select>
                    <button className={styles.btnIconDanger}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Texto da Pergunta</label>
                  <textarea 
                    className={styles.textareaField} 
                    rows={2}
                    defaultValue="Colocar sacola na geladeira pode causar...."
                  />
                </div>

                <div className={styles.optionsSection}>
                  <label>Opções de Resposta</label>
                  
                  {/* Lista de Opções (Simulando 4 opções) */}
                  {['Nada, só enfeita', 'Ocupar espaço', 'Contaminação Cruzada', 'Conter umidade'].map((opt, index) => (
                    <div key={index} className={`${styles.optionRow} ${correctOption === index ? styles.optionCorrect : ''}`}>
                      <button 
                        className={styles.radioBtn} 
                        onClick={() => setCorrectOption(index)}
                      >
                        {correctOption === index ? <CheckCircle size={20} className={styles.iconCyan} /> : <Circle size={20} className={styles.iconMuted} />}
                      </button>
                      <input type="text" defaultValue={opt} className={styles.optionInput} />
                    </div>
                  ))}
                </div>

                <button className={styles.btnAddQuestion}>
                  <Plus size={18} /> Adicionar Questão
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
            <div style={{ width: '85px' }}></div> /* Espaçador para manter o botão "Prox" à direita */
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