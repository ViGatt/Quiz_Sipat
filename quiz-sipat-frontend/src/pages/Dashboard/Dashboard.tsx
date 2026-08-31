import { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Users, BarChart2, Medal, ChevronRight, Home } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Dashboard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface RelatorioGeral {
  total_colaboradores: number;
  total_presenciais: number;
  total_online: number;
  taxa_engajamento: number;
}

interface TopParticipante {
  cpf: string;
  nome?: string;
  nome_colaborador?: string;
  nome_completo?: string;
  colaborador?: string;
  total_pontos: number;
  quizzes_respondidos: number;
}

interface QuizRecente {
  id: number;
  tema: string;
  descricao: string;
}

export function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<RelatorioGeral | null>(null);
  const [ranking, setRanking] = useState<TopParticipante[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRecente[]>([]);

  useEffect(() => {
  const carregarDashboard = async () => {
    try {
      setLoading(true);
      
      // Executa as duas requisições sem barra no final e de forma independente
      const [resQuizzes, resRelatorio] = await Promise.allSettled([
        api.get('/quiz'),
        api.get('/relatorios/geral')
      ]);

      // --- 1. PROCESSA QUIZZES (EXIBIDOS EM "EVENTOS RECENTES") ---
      if (resQuizzes.status === 'fulfilled') {
        const data = resQuizzes.value.data;
        // Verifica se a API retornou um array direto ou um objeto { quizzes: [...] }
        const listaQuizzes = Array.isArray(data) ? data : (data?.quizzes || []);
        setQuizzes(listaQuizzes);
      } else {
        console.error("Erro ao carregar quizzes do dashboard:", resQuizzes.reason);
      }

      // --- 2. PROCESSA RELATÓRIOS E RANKING ---
      if (resRelatorio.status === 'fulfilled') {
        const data = resRelatorio.value.data;
        const resumoBanco = data?.resumo || {};
        
        setResumo({
          total_colaboradores: Number(resumoBanco.total_cadastros || 0), 
          taxa_engajamento: Number(resumoBanco.taxa_engajamento || 0),
          total_online: Number(resumoBanco.total_online || 0),
          total_presenciais: Number(resumoBanco.total_presencial || 0),
        });

        // Lógica do Ranking (Mantida idêntica)
        const listaDesempenho = data?.desempenho || [];
        const rankingAgrupado: Record<string, any> = {};

        listaDesempenho.forEach((item: any) => {
          const nomePessoa = item.nome_completo || item.nome_colaborador || item.nome || item.colaborador || 'Participante';
          const chaveAgrupamento = item.cpf || nomePessoa;

          let valorBruto: any = 0;
          Object.keys(item).forEach(key => {
            const k = key.toLowerCase();
            if (k.includes('pont') || k.includes('nota') || k.includes('acert') || k.includes('score')) {
              valorBruto = item[key];
            }
          });
          
          let pontos = Number(valorBruto);
          if (isNaN(pontos)) {
            pontos = parseFloat(String(valorBruto).replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
          }
          
          const diaId = item.dia_sipat_id || item.quiz_id || null;

          if (!rankingAgrupado[chaveAgrupamento]) {
            rankingAgrupado[chaveAgrupamento] = {
              cpf: item.cpf || '',
              nome_colaborador: nomePessoa,
              total_pontos: 0,
              dias_respondidos: new Set() 
            };
          }

          rankingAgrupado[chaveAgrupamento].total_pontos += pontos;
          
          if (diaId) {
            rankingAgrupado[chaveAgrupamento].dias_respondidos.add(diaId);
          }
        });

        const rankingFinal: TopParticipante[] = Object.values(rankingAgrupado).map((part: any) => ({
          cpf: part.cpf,
          nome_colaborador: part.nome_colaborador,
          total_pontos: part.total_pontos,
          quizzes_respondidos: part.dias_respondidos.size > 0 ? part.dias_respondidos.size : 1
        }));

        const top5 = rankingFinal
          .sort((a, b) => b.total_pontos - a.total_pontos)
          .slice(0, 5);

        setRanking(top5);
      } else {
        console.error("Erro ao carregar relatórios do dashboard:", resRelatorio.reason);
      }

    } catch (err) {
      console.error("Erro crítico ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  carregarDashboard();
}, []);
  
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Bem vindo(a) de volta! Veja o que está acontecendo nos Quizzes</p>
          </div>
          
          <div className={styles.headerActions}>
            <Link to="/" className={styles.homeIconBtn} title="Voltar à Landing Page">
              <Home size={20} />
            </Link>
            
            <Link to="/create-quiz" className={styles.btnPrimary}>
              <Plus size={20} /> Criar Novo Quiz
            </Link>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-primary)' }}>
            Atualizando métricas em tempo real...
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Participação Online</span>
                  <BookOpen size={20} className={styles.statIconPurple} />
                </div>
                <div className={styles.statValue}>{resumo?.total_online || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Presenças Físicas</span>
                  <Calendar size={20} className={styles.statIconGreen} />
                </div>
                <div className={styles.statValue}>{resumo?.total_presenciais || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Total de Colaboradores</span>
                  <Users size={20} className={styles.statIconBlue} />
                </div>
                <div className={styles.statValue}>{resumo?.total_colaboradores || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Engajamento Geral</span>
                  <BarChart2 size={20} className={styles.statIconOrange} />
                </div>
                <div className={styles.statValue}>
                  {resumo?.taxa_engajamento ? Number(resumo.taxa_engajamento).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            {/* Área Central */}
            <div className={styles.middleGrid}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Eventos Recentes</h3>
                <p className={styles.panelSubtitle}>Seus últimos quizzes adicionados</p>
                
                <div className={styles.eventList}>
                  {quizzes && quizzes.length > 0 ? (
                    [...quizzes].reverse().slice(0, 3).map((quiz) => (
                      <div key={quiz.id} className={styles.eventCard}>
                        <Calendar size={24} className={styles.eventIcon} />
                        <div className={styles.eventInfo}>
                          <h4>Dia {quiz.id} - {quiz.tema || 'Sem tema'}</h4>
                          <span style={{ display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {quiz.descricao || "Sem descrição cadastrada"}
                          </span>
                        </div>
                        <button 
                          className={styles.btnOutline}
                          onClick={() => navigate(`/meus-quizzes/${quiz.id}`)}
                        >
                          Visualizar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666'}}>Nenhum evento ativo.</p>
                  )}
                </div>
              </div>

              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Top Participantes</h3>
                <p className={styles.panelSubtitle}>Ranking com maior pontuação</p>
                
                <div className={styles.participantList}>
                  {ranking && ranking.length > 0 ? (
                    ranking.map((part, index) => (
                      <div key={part.cpf || index} className={styles.participantItem}>
                        <div className={styles.participantRank}>{index + 1}</div>
                        <div className={styles.participantAvatar}></div>
                        <div className={styles.participantInfo}>
                        <h4 style={{ textTransform: 'capitalize' }}>
                          {(
                            part.nome_colaborador || 
                            part.nome || 
                            part.nome_completo || 
                            part.colaborador || 
                            `CPF ${part.cpf}`
                          ).toLowerCase()}
                        </h4>
  <span>{part.quizzes_respondidos || 0} Quizzes respondidos</span>
</div>
                        <div className={styles.participantScore}>
                          <Medal size={16} className={styles.medalIcon} />
                          {part.total_pontos || 0}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#666'}}>Nenhuma participação registrada.</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECÇÃO INFERIOR */}
            <div className={styles.bottomSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.panelTitle}>Quizzes Ativos</h3>
                <p className={styles.panelSubtitle}>Quizzes da SIPAT disponíveis</p>
              </div>

              <div className={styles.quizzesGrid}>
                {quizzes && quizzes.length > 0 && quizzes.map((quiz) => (
                  <div key={quiz.id} className={styles.quizCard} onClick={() => navigate(`/meus-quizzes/${quiz.id}`)} style={{cursor: 'pointer'}}>
                    <div className={styles.quizHeader}>
                      <h4>Quiz Dia {String(quiz.id).padStart(2, '0')}</h4>
                      <ChevronRight size={18} className={styles.arrowIcon} />
                    </div>
                    <div className={styles.quizDetails}>
                      <div className={styles.quizDetailItem}>
                        <BookOpen size={14} />
                        <span>{quiz.tema || 'Tema em branco'}</span>
                      </div>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressLabels}>
                        <span>Status</span>
                        <span style={{ color: 'var(--color-primary)' }}>Ativo</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div className={styles.progressBarFill} style={{ width: '100%', backgroundColor: 'var(--color-primary)' }}></div>
                      </div>
                    </div>
                  </div>
                ))}

                <Link 
                  to="/create-quiz" 
                  className={`${styles.quizCard} ${styles.createQuizCard}`}
                  style={{ textDecoration: 'none' }} 
                >
                  <div className={styles.createIconWrapper}>
                    <Plus size={20} />
                  </div>
                  <h4>Criar Novo Quiz</h4>
                  <p>Adicione questões, limite de tempo, entre outros</p>
                </Link>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}