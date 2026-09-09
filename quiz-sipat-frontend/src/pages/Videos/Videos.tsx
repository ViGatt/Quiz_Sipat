import { useState, useEffect } from 'react';
import { Play, X, ArrowRight, Clapperboard, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import { BackgroundGlow } from '../../components/BackgroundGlow/BackgroundGlow';
import { api } from '../../services/api';
import styles from './Videos.module.css';

interface VideoQuiz {
  id: number;
  tema: string;
  descricao: string;
  videoId: string;
}

// Aceita link comum (watch?v=), link curto (youtu.be), Shorts ou embed já pronto.
function extrairIdYoutube(url: string): string {
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
  } catch {
    // URL inválida/incompleta: sem vídeo pra mostrar nesse card.
  }
  return '';
}

export function Videos() {
  const [videos, setVideos] = useState<VideoQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoAberto, setVideoAberto] = useState<VideoQuiz | null>(null);

  useEffect(() => {
    const carregarVideos = async () => {
      try {
        const response = await api.get('/quiz/');
        const lista = Array.isArray(response.data) ? response.data : (response.data?.quizzes || []);

        const agora = new Date();
        const publicados = lista
          .map((q: any) => {
            let statusReal = q.status || 'Publicado';
            if (statusReal === 'Programado' && q.data_liberacao) {
              if (new Date(q.data_liberacao) <= agora) statusReal = 'Publicado';
            }
            return { ...q, statusReal };
          })
          .filter((q: any) => q.statusReal === 'Publicado')
          .map((q: any) => ({
            id: q.id,
            tema: q.tema || `Quiz Dia ${q.id}`,
            descricao: q.descricao || '',
            videoId: extrairIdYoutube(q.link_youtube_palestra || ''),
          }))
          .filter((q: VideoQuiz) => q.videoId)
          .sort((a: VideoQuiz, b: VideoQuiz) => a.id - b.id);

        setVideos(publicados);
      } catch (error) {
        console.error('Erro ao carregar vídeos das palestras:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarVideos();
  }, []);

  return (
    <div className={styles.layout}>
      <BackgroundGlow />
      <Navbar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <span className={styles.badge}><Clapperboard size={16} /> Palestras da SIPAT</span>
          <h1 className={styles.title}>Vídeos das Palestras</h1>
          <p className={styles.subtitle}>
            Reveja o conteúdo de cada dia da SIPAT sem precisar entrar no quiz — e, quando quiser testar
            o que aprendeu, é só clicar em "Ir para o Quiz".
          </p>
        </header>

        {loading ? (
          <div className={styles.loading}>Carregando vídeos...</div>
        ) : videos.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={40} />
            <p>Nenhum vídeo disponível no momento. Assim que a comissão publicar os quizzes com palestra, eles aparecem aqui.</p>
          </div>
        ) : (
          <section className={styles.grid}>
            {videos.map((video) => (
              <article key={video.id} className={styles.card}>
                <button
                  className={styles.thumbButton}
                  onClick={() => setVideoAberto(video)}
                  aria-label={`Assistir: ${video.tema}`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={`Capa do vídeo: ${video.tema}`}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                  <span className={styles.playOverlay}>
                    <Play size={22} fill="currentColor" />
                  </span>
                  <span className={styles.dayTag}>Dia {String(video.id).padStart(2, '0')}</span>
                </button>

                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{video.tema}</h2>
                  {video.descricao && <p className={styles.cardDesc}>{video.descricao}</p>}

                  <div className={styles.cardActions}>
                    <button className={styles.btnWatch} onClick={() => setVideoAberto(video)}>
                      <Play size={16} fill="currentColor" /> Assistir
                    </button>
                    <Link to={`/take-quiz/${video.id}`} className={styles.btnQuiz}>
                      Ir para o Quiz <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />

      {videoAberto && (
        <div className={styles.modalOverlay} onClick={() => setVideoAberto(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{videoAberto.tema}</h3>
              <button className={styles.modalClose} onClick={() => setVideoAberto(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalPlayerWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${videoAberto.videoId}?autoplay=1`}
                title={videoAberto.tema}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.modalFooter}>
              <Link to={`/take-quiz/${videoAberto.id}`} className={styles.btnQuiz}>
                Ir para o Quiz deste dia <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
