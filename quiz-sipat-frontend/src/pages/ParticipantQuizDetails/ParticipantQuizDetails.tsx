import { useState } from 'react';
import { ChevronLeft, PlayCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import styles from './ParticipantQuizDetails.module.css';

export function ParticipantQuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Simulação de dados que virão da API
  const [isCompleted, setIsCompleted] = useState(id === '2'); // Simulando que o quiz 2 já foi feito
  const score = "14/15";

  return (
    <div className={styles.container}>
      <ParticipantSidebar />
      
      <main className={styles.mainContent}>
        <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
          <ChevronLeft size={20} /> Voltar aos Quizzes
        </button>

        <div className={styles.contentGrid}>
          {/* Lado Esquerdo: Vídeo da Palestra */}
          <div className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              {/* Exemplo de iFrame de vídeo (YouTube) */}
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Palestra SIPAT" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className={styles.lectureInfo}>
              <h2 className={styles.lectureTitle}>Treinamento sobre Equipamentos de Proteção Individual (EPI)</h2>
              <p className={styles.lectureText}>
                Nesta palestra, o especialista aborda a importância do uso correto, manutenção e descarte dos EPIs no ambiente de trabalho. 
                Assista com atenção, pois as 15 questões do quiz abaixo são baseadas neste conteúdo.
              </p>
            </div>
          </div>

          {/* Lado Direito: Painel do Quiz */}
          <div className={styles.quizPanel}>
            <div className={styles.panelCard}>
              <h3 className={styles.panelTitle}>Sobre o Quiz Diário</h3>
              
              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <BookOpen size={20} className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Questões</span>
                    <span className={styles.metaValue}>15 de múltipla escolha</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <Clock size={20} className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Tempo Estimado</span>
                    <span className={styles.metaValue}>15 a 20 minutos</span>
                  </div>
                </div>
              </div>

              <div className={styles.divider}></div>

              {/* Lógica do Botão: Restringe a uma única tentativa */}
              {isCompleted ? (
                <div className={styles.completedBox}>
                  <CheckCircle size={40} color="#22c55e" />
                  <h4 className={styles.completedTitle}>Quiz Concluído!</h4>
                  <p className={styles.completedText}>Sua pontuação: <strong style={{color: 'var(--color-white)'}}>{score}</strong></p>
                  <p className={styles.completedRule}>Você já garantiu sua participação e gerou seu Número da Sorte hoje.</p>
                </div>
              ) : (
                <div className={styles.actionBox}>
                  <p className={styles.warningText}>* Atenção: Você tem apenas uma tentativa e não poderá voltar para alterar suas respostas.</p>
                  <button 
                    className={styles.btnStart} 
                    onClick={() => navigate(`/take-quiz/${id}`)}
                  >
                    <PlayCircle size={20} /> Iniciar Quiz Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}