import { useState, useEffect } from 'react';
import { ChevronLeft, PlayCircle, CheckCircle, Clock, BookOpen, Edit3, Save, X, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api'; // Importando a nossa API
import styles from './ParticipantQuizDetails.module.css';

export function ParticipantQuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();

  // Estados de Carregamento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos dados da palestra (Agora começam vazios e são preenchidos pela API)
  const [videoUrl, setVideoUrl] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [qtdQuestoes, setQtdQuestoes] = useState(15);

  // Estados de controle de edição (Para o Admin)
  const [isEditing, setIsEditing] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // Simulação de status do participante (Em breve puxaremos isso do banco também)
  const [isCompleted] = useState(false); 
  const score = "0/15";

  // Busca os dados reais no FastAPI ao abrir a tela
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/quiz/${id}`);
        const data = response.data;

        // Atualiza a tela com os dados do banco
        setVideoUrl(data.link_youtube_palestra || '');
        setLectureTitle(`Dia ${data.id} - ${data.tema}`);
        setLectureDescription(data.descricao || 'Assista ao vídeo e prepare-se para o quiz.');
        
        // Se a API retornar as questões, podemos mostrar a quantidade exata
        if (data.questoes) {
          setQtdQuestoes(data.questoes.length);
        }

        // Alimenta também os campos temporários de edição (caso um Admin queira editar)
        setTempVideoUrl(data.link_youtube_palestra || '');
        setTempTitle(data.tema || '');
        setTempDescription(data.descricao || '');

      } catch (err) {
        console.error("Erro ao buscar detalhes do quiz:", err);
        setError('Não foi possível carregar os detalhes desta palestra.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuizData();
  }, [id]);

  // Função auxiliar para converter URLs normais do YouTube para formato Embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const handleSaveEdit = () => {
    // Atualiza a visualização local
    setVideoUrl(tempVideoUrl);
    setLectureTitle(tempTitle);
    setLectureDescription(tempDescription);
    setIsEditing(false);
    
    // Futuramente aqui faremos o UPDATE no Supabase usando um POST/PUT na API!
    alert("Alterações salvas visualmente. No futuro, isso será gravado no banco!");
  };

  const handleCancelEdit = () => {
    setTempVideoUrl(videoUrl);
    setTempTitle(lectureTitle);
    setTempDescription(lectureDescription);
    setIsEditing(false);
  };

  // Telas de Feedback (Carregando / Erro)
  if (loading) {
    return (
      <div className={styles.container}>
        <ParticipantSidebar />
        <main className={styles.mainContent}>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-primary)' }}>
            Carregando a sala de palestra...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ParticipantSidebar />
        <main className={styles.mainContent}>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
            {error}
            <br/><br/>
            <button className={styles.backButton} onClick={() => navigate('/meus-quizzes')}>
              <ChevronLeft size={20} /> Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

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
                  {videoUrl ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={getEmbedUrl(videoUrl)} 
                      title="Palestra SIPAT" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#1e293b', color: '#64748b'}}>
                      <PlayCircle size={48} />
                      <p>Vídeo não cadastrado para este dia.</p>
                    </div>
                  )}
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
                    <span className={styles.metaValue}>{qtdQuestoes} de múltipla escolha</span>
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