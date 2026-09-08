import { useState, useEffect } from 'react';
import { ChevronLeft, PlayCircle, CheckCircle, Clock, BookOpen, Edit3, Save, X, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ParticipantSidebar } from '../../components/ParticipantSidebar/ParticipantSidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import styles from './ParticipantQuizDetails.module.css';

export function ParticipantQuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario } = useAuth();
  const { showSuccess, showError } = useToast();

  // Estados de Carregamento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos dados da palestra
  const [videoUrl, setVideoUrl] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [qtdQuestoes, setQtdQuestoes] = useState(15);
  
  // --- NOVOS ESTADOS PARA A TRAVA DE AGENDAMENTO ---
  const [quizStatus, setQuizStatus] = useState('Publicado');
  const [dataLiberacao, setDataLiberacao] = useState<string | null>(null);

  // Estados de controle de edição (Para o Admin)
  const [isEditing, setIsEditing] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // Simulação de status do participante (Em breve puxaremos isso do banco também)
  const [isCompleted] = useState(false);
  const score = "0/15";

  // --- CONTROLE DE VÍDEO ASSISTIDO (libera o botão só após o vídeo terminar) ---
  const [assistiuVideoCompleto, setAssistiuVideoCompleto] = useState(false);

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
        
        // Puxa as configurações de agendamento
        setQuizStatus(data.status || 'Publicado');
        setDataLiberacao(data.data_liberacao || null);
        
        if (data.questoes) {
          setQtdQuestoes(data.questoes.length);
        }

        // Alimenta também os campos temporários de edição
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

  // Extrai só o ID do vídeo (necessário para o YouTube IFrame Player API)
  const getVideoId = (url: string): string => {
    if (!url) return '';
    if (url.includes('embed/')) {
      return url.split('embed/')[1]?.split('?')[0] || '';
    }

    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        const v = urlObj.searchParams.get('v');
        if (v) return v;
        if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2] || '';
      } else if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      console.error("URL de vídeo inválida:", e);
    }
    return '';
  };

  // Carrega o player oficial do YouTube (em vez de um <iframe> simples) para
  // conseguir detectar quando o vídeo chega ao fim e então liberar o quiz.
  useEffect(() => {
    setAssistiuVideoCompleto(false);

    const videoId = getVideoId(videoUrl);
    if (!videoId || isEditing) return;

    const criarPlayer = () => {
      const YT = (window as any).YT;
      if (!YT || !document.getElementById('yt-player-quiz')) return;
      new YT.Player('yt-player-quiz', {
        videoId,
        events: {
          onStateChange: (event: any) => {
            if (event.data === YT.PlayerState.ENDED) {
              setAssistiuVideoCompleto(true);
            }
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      criarPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = criarPlayer;
    }
  }, [videoUrl, isEditing]);

  const handleSaveEdit = async () => {
    try {
      await api.put(`/quiz/${id}`, {
        tema: tempTitle,
        descricao: tempDescription,
        link_youtube_palestra: tempVideoUrl
      });

      setVideoUrl(tempVideoUrl);
      setLectureTitle(`Dia ${id} - ${tempTitle}`);
      setLectureDescription(tempDescription);
      setIsEditing(false);
      
      showSuccess("Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      showError("Ocorreu um erro ao tentar salvar as alterações.");
    }
  };

  const handleCancelEdit = () => {
    setTempVideoUrl(videoUrl);
    setTempTitle(lectureTitle);
    setTempDescription(lectureDescription);
    setIsEditing(false);
  };

  // --- LÓGICA DE BLOQUEIO VISUAL (FRONT-END) ---
  const semVideoCadastrado = !videoUrl;
  let isLocked = semVideoCadastrado;
  let dataFormatada = '';

  if (!isLocked && quizStatus === 'Programado' && dataLiberacao) {
    const dataLibObj = new Date(dataLiberacao);
    if (dataLibObj > new Date()) {
      isLocked = true;
      dataFormatada = dataLibObj.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  }

  // Só exige "assistir até o fim" quando já existe vídeo e o quiz não está travado por outro motivo
  const precisaAssistirVideo = !isLocked && !assistiuVideoCompleto;
  const botaoDesabilitado = isLocked || precisaAssistirVideo;

  // Telas de Feedback
  if (loading) {
    return (
      <div className={styles.container}>
        <ParticipantSidebar />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
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
          <div className={styles.errorState}>
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

          {usuario?.is_comissao && !isEditing && (
            <button className={styles.btnEditAdmin} onClick={() => setIsEditing(true)}>
              <Edit3 size={18} /> Editar Palestra e Vídeo
            </button>
          )}
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.videoSection}>
            {isEditing ? (
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
              <>
                <div className={styles.videoWrapper}>
                  {videoUrl ? (
                    <div id="yt-player-quiz" className={styles.videoPlayerBox}></div>
                  ) : (
                    <div className={styles.videoPlaceholder}>
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
                  <p className={styles.completedText}>Sua pontuação: <strong className={styles.completedScoreValue}>{score}</strong></p>
                  <p className={styles.completedRule}>Você já garantiu sua participação hoje.</p>
                </div>
              ) : (
                <div className={styles.actionBox}>
                  <p className={styles.warningText}>* Atenção: Você tem apenas uma tentativa por CPF.</p>
                  
                  {/* --- BOTÃO COM APLICAÇÃO VISUAL DA TRAVA --- */}
                  <button
                    className={`${styles.btnStart} ${botaoDesabilitado ? styles.btnStartDisabled : ''}`}
                    onClick={() => { if (!botaoDesabilitado) navigate(`/take-quiz/${id}`) }}
                    disabled={botaoDesabilitado}
                  >
                    <PlayCircle size={20} /> Iniciar Quiz Agora
                  </button>

                  {/* --- BANNER: SEM VÍDEO CADASTRADO --- */}
                  {semVideoCadastrado && (
                    <div className={`${styles.infoBanner} ${styles.infoBannerOrange}`}>
                      <Video size={22} className={styles.infoBannerIcon} />
                      <span className={styles.infoBannerTitle}>Vídeo Ainda Não Disponível</span>
                      <span className={styles.infoBannerSubtitle}>A palestra deste dia ainda não foi publicada. Volte em breve.</span>
                    </div>
                  )}

                  {/* --- BANNER ALARANJADO: AGENDAMENTO --- */}
                  {!semVideoCadastrado && isLocked && (
                    <div className={`${styles.infoBanner} ${styles.infoBannerOrange}`}>
                      <Clock size={22} className={styles.infoBannerIcon} />
                      <span className={styles.infoBannerTitle}>Acesso Antecipado Bloqueado</span>
                      <span className={styles.infoBannerSubtitle}>Disponível em: {dataFormatada}</span>
                    </div>
                  )}

                  {/* --- BANNER AZUL: PRECISA ASSISTIR O VÍDEO ATÉ O FIM --- */}
                  {precisaAssistirVideo && (
                    <div className={`${styles.infoBanner} ${styles.infoBannerBlue}`}>
                      <PlayCircle size={22} className={styles.infoBannerIcon} />
                      <span className={styles.infoBannerTitle}>Assista o vídeo até o final</span>
                      <span className={styles.infoBannerSubtitle}>O botão de iniciar o quiz libera automaticamente quando o vídeo terminar.</span>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}