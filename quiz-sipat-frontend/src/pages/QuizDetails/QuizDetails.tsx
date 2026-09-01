import { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, BookOpen, Calendar, Users, BarChart2, X, 
  Download, Search, Inbox, Trash2, AlertTriangle, Clock, Award 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { api } from '../../services/api';
import styles from './QuizDetails.module.css';

export function QuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [showCompletionsModal, setShowCompletionsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Estados das métricas reais da API
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    desc: '',
    totalCompletos: '0',
    taxaAprovacao: '0%',
    tempoLimite: '15 min',
    tempoMedio: '--:--',
    pontuacaoMedia: '0%',
    maiorPontuacao: '0%'
  });

  const [recentCompletions, setRecentCompletions] = useState<any[]>([]);
  const [questionPerformance, setQuestionPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/relatorios/quiz/${id}`);
        const data = response.data;

        setQuizInfo({
          title: `Quiz Dia ${String(data.quiz_id).padStart(2, '0')} - ${data.tema || 'Sem Tema'}`,
          desc: data.descricao || 'Sem descrição cadastrada',
          totalCompletos: data.total_completos || '0',
          taxaAprovacao: data.taxa_aprovacao || '0%',
          tempoLimite: data.tempo_limite || '15 min',
          tempoMedio: data.tempo_medio || '--:--',
          pontuacaoMedia: data.pontuacao_media || '0%',
          maiorPontuacao: data.maior_pontuacao || '0%'
        });

        setRecentCompletions(data.conclusoes_recentes || []);
        setQuestionPerformance(data.desempenho_questoes || []);
      } catch (error) {
        console.error("Erro ao carregar métricas do quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMetrics();
  }, [id]);

  const filteredCompletions = recentCompletions.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

// =========================================
  // FUNÇÃO DE EXPORTAÇÃO PARA CSV
  // =========================================
  const handleExportData = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>Métricas Gerais do Quiz</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Métrica</th>
            <th style="padding: 8px;">Valor</th>
          </tr>
          <tr><td style="padding: 6px;">Título</td><td style="padding: 6px;">${quizInfo.title}</td></tr>
          <tr><td style="padding: 6px;">Descrição</td><td style="padding: 6px;">${quizInfo.desc}</td></tr>
          <tr><td style="padding: 6px;">Total Completos</td><td style="padding: 6px;">${quizInfo.totalCompletos}</td></tr>
          <tr><td style="padding: 6px;">Taxa de Aprovação</td><td style="padding: 6px;">${quizInfo.taxaAprovacao}</td></tr>
          <tr><td style="padding: 6px;">Tempo Limite</td><td style="padding: 6px;">${quizInfo.tempoLimite}</td></tr>
          <tr><td style="padding: 6px;">Tempo Médio</td><td style="padding: 6px;">${quizInfo.tempoMedio}</td></tr>
          <tr><td style="padding: 6px;">Pontuação Média</td><td style="padding: 6px;">${quizInfo.pontuacaoMedia}</td></tr>
          <tr><td style="padding: 6px;">Maior Pontuação</td><td style="padding: 6px;">${quizInfo.maiorPontuacao}</td></tr>
        </table>
        <br/>
        <h2>Desempenho por Questão</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Questão</th>
            <th style="padding: 8px;">Taxa de Acerto</th>
          </tr>
          ${questionPerformance.map(q => `
            <tr>
              <td style="padding: 6px;">${q.question}</td>
              <td style="padding: 6px;">${q.correctRate}%</td>
            </tr>
          `).join('')}
        </table>
        <br/>
        <h2>Resultados dos Participantes</h2>
        <table border="1" style="border-collapse: collapse;">
          <tr style="background-color: #6366f1; color: white; font-weight: bold;">
            <th style="padding: 8px;">Nome</th>
            <th style="padding: 8px;">Pontuação</th>
            <th style="padding: 8px;">Tempo Gasto</th>
            <th style="padding: 8px;">Data de Conclusão</th>
          </tr>
          ${recentCompletions.map(u => `
            <tr>
              <td style="padding: 6px;">${u.name}</td>
              <td style="padding: 6px;">${u.score}</td>
              <td style="padding: 6px;">${u.time}</td>
              <td style="padding: 6px;">${u.date}</td>
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
    link.download = `Relatorio_${quizInfo.title.replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Carregando métricas do quiz...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        {/* CABEÇALHO */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate('/quizzes')}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className={styles.title}>{quizInfo.title}</h1>
              <p className={styles.subtitle}>{quizInfo.desc}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.btnOutline} 
              style={{ color: '#ef4444', borderColor: '#ef4444' }} 
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} /> Excluir Quiz
            </button>

            <button className={styles.btnOutline} onClick={() => navigate(`/share-quiz/${id || '1'}`)}>
              <Share2 size={16} /> Compartilhar
            </button>
            
            <button className={styles.btnPrimary} onClick={handleExportData}>
            <Download size={16} /> Exportar Dados
            </button>
          </div>
        </header>

        {/* MÉTRICAS GERAIS - GRID 3 COLUNAS X 2 FILEIRAS */}
        <div className={styles.statsGrid}>
          {/* Fileira 1 - Card 1 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Completos</span>
              <BookOpen size={20} className={styles.iconPurple} />
            </div>
            <div className={styles.statValue}>{quizInfo.totalCompletos}</div>
          </div>

          {/* Fileira 1 - Card 2 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Taxa de Aprovação</span>
              <Award size={20} className={styles.iconGreen} />
            </div>
            <div className={styles.statValue}>{quizInfo.taxaAprovacao}</div>
          </div>

          {/* Fileira 1 - Card 3 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Tempo Limite</span>
              <Calendar size={20} className={styles.iconPurple} />
            </div>
            <div className={styles.statValue}>{quizInfo.tempoLimite}</div>
          </div>

          {/* Fileira 2 - Card 4 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Tempo Médio</span>
              <Clock size={20} className={styles.iconGreen} />
            </div>
            <div className={styles.statValue}>{quizInfo.tempoMedio}</div>
          </div>

          {/* Fileira 2 - Card 5 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Pontuação Média</span>
              <Users size={20} className={styles.iconBlue} />
            </div>
            <div className={styles.statValue}>{quizInfo.pontuacaoMedia}</div>
          </div>

          {/* Fileira 2 - Card 6 */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Maior Pontuação</span>
              <BarChart2 size={20} className={styles.iconOrange} />
            </div>
            <div className={styles.statValue}>{quizInfo.maiorPontuacao}</div>
          </div>
        </div>

        {/* GRIDS INTERMEDIÁRIOS */}
        <div className={styles.middleGrid}>
          {/* Tabela de Conclusão Recente */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Conclusão Recente</h3>
                <p className={styles.panelSubtitle}>Participantes que concluíram esse quiz</p>
              </div>
              <button 
                className={styles.btnOutlineSmall}
                onClick={() => setShowCompletionsModal(true)}
                disabled={recentCompletions.length === 0}
              >
                Ver Resultados
              </button>
            </div>
            
            {recentCompletions.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Pontuação</th>
                      <th>Tempo Gasto</th>
                      <th>Concluído em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCompletions.slice(0, 4).map((user) => (
                      <tr key={user.id}>
                        <td className={styles.userName}>{user.name}</td>
                        <td>{user.score}</td>
                        <td>{user.time}</td>
                        <td className={styles.textMuted}>{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Inbox size={40} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>Nenhum dado ainda</h4>
                <p className={styles.emptyDesc}>Nenhum colaborador concluiu este quiz ainda.</p>
              </div>
            )}
          </div>

          {/* Desempenho por Questão */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Desempenho</h3>
                <p className={styles.panelSubtitle}>Acertos por questão</p>
              </div>
              <button 
                className={styles.btnOutlineSmall}
                onClick={() => setShowPerformanceModal(true)}
                disabled={questionPerformance.length === 0}
              >
                Ver Todas
              </button>
            </div>
            
            {questionPerformance.length > 0 ? (
              <div className={styles.performanceList}>
                {questionPerformance.slice(0, 5).map((item) => (
                  <div key={item.id} className={styles.performanceItem}>
                    <div className={styles.performanceLabel}>
                      <span className={styles.questionText}>{item.question}</span>
                      <span className={styles.percentageText}>{item.correctRate}%</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${item.correctRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <BarChart2 size={40} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>Sem Estatísticas</h4>
                <p className={styles.emptyDesc}>Os gráficos aparecerão assim que as primeiras respostas chegarem.</p>
              </div>
            )}
          </div>
        </div>

        {/* COMPARTILHAMENTO */}
        <div className={styles.shareBanner}>
          <div>
            <h3 className={styles.panelTitle}>Compartilhe esse Quiz</h3>
            <p className={styles.panelSubtitle}>Compartilhe este Quiz com colaboradores de equipe</p>
          </div>
          <button 
            className={styles.btnPrimaryShare} 
            onClick={() => navigate(`/share-quiz/${id || '1'}`)}
          >
            <Share2 size={18} /> Compartilhar
          </button>
        </div>

      </main>

      {/* MODAL 1: TODOS OS PARTICIPANTES */}
      {showCompletionsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCompletionsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Todos os Resultados</h2>
              <button className={styles.closeBtn} onClick={() => setShowCompletionsModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalSearchArea}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Buscar colaborador..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalBody}>
              {filteredCompletions.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Pontuação</th>
                      <th>Tempo Gasto</th>
                      <th>Concluído</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletions.map((user) => (
                      <tr key={user.id}>
                        <td className={styles.userName}>{user.name}</td>
                        <td>{user.score}</td>
                        <td>{user.time}</td>
                        <td className={styles.textMuted}>{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>
                  <Search size={40} className={styles.emptyIcon} />
                  <h4 className={styles.emptyTitle}>Colaborador não encontrado</h4>
                  <p className={styles.emptyDesc}>Ninguém com esse nome respondeu a este quiz ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TODAS AS QUESTÕES */}
      {showPerformanceModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPerformanceModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Desempenho Detalhado por Questão</h2>
              <button className={styles.closeBtn} onClick={() => setShowPerformanceModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.performanceList}>
                {questionPerformance.map((item) => (
                  <div key={item.id} className={styles.performanceItem}>
                    <div className={styles.performanceLabel}>
                      <span className={styles.questionText}>{item.question}</span>
                      <span className={styles.percentageText}>{item.correctRate}%</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${item.correctRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '450px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertTriangle size={64} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Excluir este Quiz?</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Tem certeza que deseja apagar este quiz? Esta ação é <b>irreversível</b> e ele desaparecerá da biblioteca.
              <br/><br/>
              <i>Nota: Todos os dados e respostas atrelados a este quiz também serão removidos do banco para limpar as métricas do sistema.</i>
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className={styles.btnOutline} 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnPrimary} 
                style={{ backgroundColor: '#ef4444' }}
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await api.delete(`/quiz/${id}`);
                    setShowDeleteModal(false);
                    navigate('/quizzes');
                  } catch (error) {
                    console.error("Erro ao excluir quiz:", error);
                    alert("Não foi possível excluir o quiz.");
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Quero Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}