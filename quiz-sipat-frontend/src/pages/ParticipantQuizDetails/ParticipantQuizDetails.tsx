import { useState } from 'react';
import { ChevronLeft, PlayCircle, CheckCircle, Clock, BookOpen, Edit3, Save, X, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import { useAuth } from '../../context/AuthContext';
import styles from './ParticipantQuizDetails.module.css';

export function ParticipantQuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();

  // Estados dos dados da palestra (editáveis pelo Admin)
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lectureTitle, setLectureTitle] = useState('Treinamento sobre Equipamentos de Proteção Individual (EPI)');
  const [lectureDescription, setLectureDescription] = useState(
    'Nesta palestra, o especialista aborda a importância do uso correto, manutenção e descarte dos EPIs no ambiente de trabalho. Assista com atenção, pois as questões do quiz abaixo são baseadas neste conteúdo.'
  );

  // Estados de controle de edição
  const [isEditing, setIsEditing] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState(videoUrl);
  const [tempTitle, setTempTitle] = useState(lectureTitle);
  const [tempDescription, setTempDescription] = useState(lectureDescription);

  // Simulação de status do participante
  const [isCompleted] = useState(id === '2');
  const score = "14/15";

  // Função auxiliar para converter URLs normais do YouTube para formato Embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleSaveEdit = () => {
    setVideoUrl(tempVideoUrl);
    setLectureTitle(tempTitle);
    setLectureDescription(tempDescription);
    setIsEditing(false);
    // Futuramente aqui faremos o UPDATE no Supabase!
  };

  const handleCancelEdit = () => {
    setTempVideoUrl(videoUrl);
    setTempTitle(lectureTitle);
    setTempDescription(lectureDescription);
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <ParticipantSidebar />
      
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <button className={styles.backButton} onClick={() => navigate(usuario?.is_comissao ? '/dashboard' : '/meus-quizzes')}>
            <ChevronLeft size={20} /> Voltar
          </button>

          {/* Botão exclusivo para Administradores/Comissão */}
          {usuario?.is_comissao && !isEditing && (
            <button className={styles.btnEditAdmin} onClick={() => setIsEditing(true)}>
              <Edit3 size={18} /> Editar Palestra e Vídeo
            </button>
          )}
        </div>

        <div className={styles.contentGrid}>
          {/* Lado Esquerdo: Vídeo e Informações da Palestra */}
          <div className={styles.videoSection}>
            {isEditing ? (
              /* --- FORMULÁRIO DE EDIÇÃO (ADMIN) --- */
              <div className={styles.editCard}>
                <h3 className={styles.editTitle}><Edit3 size={20} /> Painel de Edição da CIPA</h3>
                
                <div className={styles.inputGroup}>
                  <label><Video size={16} /> Link do Vídeo (YouTube)</label>
                  <input 
                    type="text" 
                    value={tempVideoUrl} 
                    onChange={(e) => setTempVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Título da Palestra</label>
                  <input 
                    type="text" 
                    value={tempTitle} 
                    onChange={(e) => setTempTitle(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Descrição/Resumo do Dia</label>
                  <textarea 
                    rows={4} 
                    value={tempDescription} 
                    onChange={(e) => setTempDescription(e.target.value)}
                  />
                </div>

                <div className={styles.editActions}>
                  <button className={styles.btnSave} onClick={handleSaveEdit}>
                    <Save size={18} /> Salvar Alterações
                  </button>
                  <button className={styles.btnCancel} onClick={handleCancelEdit}>
                    <X size={18} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* --- EXIBIÇÃO NORMAL DO VÍDEO E TEXTO --- */
              <>
                <div className={styles.videoWrapper}>
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={getEmbedUrl(videoUrl)} 
                    title="Palestra SIPAT" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className={styles.lectureInfo}>
                  <h2 className={styles.lectureTitle}>{lectureTitle}</h2>
                  <p className={styles.lectureText}>{lectureDescription}</p>
                </div>
              </>
            )}
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

              {isCompleted ? (
                <div className={styles.completedBox}>
                  <CheckCircle size={40} color="#22c55e" />
                  <h4 className={styles.completedTitle}>Quiz Concluído!</h4>
                  <p className={styles.completedText}>Sua pontuação: <strong style={{color: 'var(--color-white)'}}>{score}</strong></p>
                  <p className={styles.completedRule}>Você já garantiu sua participação hoje.</p>
                </div>
              ) : (
                <div className={styles.actionBox}>
                  <p className={styles.warningText}>* Atenção: Você tem apenas uma tentativa por CPF.</p>
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