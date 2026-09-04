import { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar, Users, BarChart2, Medal, ChevronRight, Home, Download, Maximize2, X } from 'lucide-react';
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
  const [rankingCompleto, setRankingCompleto] = useState<TopParticipante[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRecente[]>([]);

  // Estados de Controle de Expansão e Modal
  const [mostrarTodosParticipantes, setMostrarTodosParticipantes] = useState(false);
  const [modalRankingAberto, setModalRankingAberto] = useState(false);

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true);
        
        const [resQuizzes, resRelatorio] = await Promise.allSettled([
          api.get('/quiz/'),
          api.get('/relatorios/geral')
        ]);

        if (resQuizzes.status === 'fulfilled') {
          const data = resQuizzes.value.data;
          const listaQuizzes = Array.isArray(data) ? data : (data?.quizzes || []);
          setQuizzes(listaQuizzes);
        } else {
          console.error("Erro ao carregar quizzes do dashboard:", resQuizzes.reason);
        }

        if (resRelatorio.status === 'fulfilled') {
          const data = resRelatorio.value.data;
          const resumoBanco = data?.resumo || {};
          
          setResumo({
            total_colaboradores: Number(resumoBanco.total_cadastros || 0), 
            taxa_engajamento: Number(resumoBanco.taxa_engajamento || 0),
            total_online: Number(resumoBanco.total_online || 0),
            total_presenciais: Number(resumoBanco.total_presencial || 0),
          });

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

          const rankingOrdenado = rankingFinal.sort((a, b) => b.total_pontos - a.total_pontos);
          setRankingCompleto(rankingOrdenado);

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
  
  const handleExportDashboard = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>Resumo Geral da SIPAT</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Métrica</th>
            <th style="padding: 8px;">Valor</th>
          </tr>
          <tr><td style="padding: 6px;">Total de Colaboradores</td><td style="padding: 6px;">${resumo?.total_colaboradores || 0}</td></tr>
          <tr><td style="padding: 6px;">Participação Online</td><td style="padding: 6px;">${resumo?.total_online || 0}</td></tr>
          <tr><td style="padding: 6px;">Presenças Físicas</td><td style="padding: 6px;">${resumo?.total_presenciais || 0}</td></tr>
          <tr><td style="padding: 6px;">Taxa de Engajamento</td><td style="padding: 6px;">${resumo?.taxa_engajamento ? Number(resumo.taxa_engajamento).toFixed(1) : 0}%</td></tr>
        </table>
        <br/>
        
        <h2>Ranking - Participantes</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Posição</th>
            <th style="padding: 8px;">Colaborador</th>
            <th style="padding: 8px;">Quizzes Respondidos</th>
            <th style="padding: 8px;">Pontuação Total</th>
          </tr>
          ${rankingCompleto.map((part, index) => {
            const nomeParticipante = part.nome_colaborador || part.nome || part.nome_completo || part.colaborador || `CPF ${part.cpf}`;
            return `
              <tr>
                <td style="padding: 6px; text-align: center;">${index + 1}º</td>
                <td style="padding: 6px; text-transform: capitalize;">${nomeParticipante.toLowerCase()}</td>
                <td style="padding: 6px; text-align: center;">${part.quizzes_respondidos || 0}</td>
                <td style="padding: 6px; text-align: center;">${part.total_pontos || 0}</td>
              </tr>
            `;
          }).join('')}
        </table>
        <br/>

        <h2>Quizzes Ativos</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Dia / ID</th>
            <th style="padding: 8px;">Tema</th>
            <th style="padding: 8px;">Descrição</th>
          </tr>
          ${quizzes.map(quiz => `
            <tr>
              <td style="padding: 6px; text-align: center;">Dia ${String(quiz.id).padStart(2, '0')}</td>
              <td style="padding: 6px;">${quiz.tema || 'Sem tema'}</td>
              <td style="padding: 6px;">${quiz.descricao || 'Sem descrição cadastrada'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    link.download = `Relatorio_Dashboard_SIPAT_${dataAtual}.xls`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
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
          
            <button 
              className={styles.btnOutline} 
              onClick={handleExportDashboard}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={20} /> Exportar Relatório
            </button>
            
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

              {/* PAINEL DE TOP PARTICIPANTES */}
              <div className={styles.panel} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className={styles.panelTitle}>Top Participantes</h3>
                    <p className={styles.panelSubtitle}>Ranking com maior pontuação</p>
                  </div>
                  
                  {/* BOTÕES DE AÇÃO DO RANKING */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <button 
                      onClick={() => setModalRankingAberto(true)}
                      title="Expandir em Tela Cheia"
                      style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: 'none',
                        color: 'var(--color-primary)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      <Maximize2 size={16} /> Expandir
                    </button>

                    {rankingCompleto.length > 5 && (
                      <button 
                        onClick={() => setMostrarTodosParticipantes(!mostrarTodosParticipantes)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          textDecoration: 'underline'
                        }}
                      >
                        {mostrarTodosParticipantes ? 'Ver Menos' : 'Ver Todos'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* LISTA DE PARTICIPANTES NO CARD */}
                <div 
                  className={styles.participantList}
                  style={{
                    maxHeight: mostrarTodosParticipantes ? '380px' : 'auto', 
                    overflowY: mostrarTodosParticipantes ? 'auto' : 'visible', 
                    paddingRight: mostrarTodosParticipantes ? '6px' : '0', 
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {rankingCompleto && rankingCompleto.length > 0 ? (
                    (mostrarTodosParticipantes ? rankingCompleto : rankingCompleto.slice(0, 5)).map((part, index) => (
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

      {/* MODAL / POPUP DE TELA CHEIA PARA O RANKING COMPLETO */}
      {modalRankingAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Cabeçalho do Modal */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>Ranking Completo de Participantes</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
                  Total de {rankingCompleto.length} colaborador(es) com pontuação registrada
                </p>
              </div>
              <button 
                onClick={() => setModalRankingAberto(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4b5563'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com Scroll do Modal */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {rankingCompleto.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {rankingCompleto.map((part, index) => (
                    <div 
                      key={part.cpf || index} 
                      className={styles.participantItem}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: index < 3 ? 'rgba(99, 102, 241, 0.05)' : '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6'
                      }}
                    >
                      <div className={styles.participantRank} style={{ fontWeight: 'bold' }}>{index + 1}º</div>
                      <div className={styles.participantInfo} style={{ flex: 1, marginLeft: '12px' }}>
                        <h4 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1rem', color: '#111827' }}>
                          {(
                            part.nome_colaborador || 
                            part.nome || 
                            part.nome_completo || 
                            part.colaborador || 
                            `CPF ${part.cpf}`
                          ).toLowerCase()}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {part.quizzes_respondidos || 0} Quizzes respondidos
                        </span>
                      </div>
                      <div className={styles.participantScore} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        <Medal size={18} className={styles.medalIcon} />
                        {part.total_pontos || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>
                  Nenhum registro encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}