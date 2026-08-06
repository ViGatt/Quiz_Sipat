import { useState } from 'react';
import { ChevronLeft, Share2, BookOpen, Calendar, Users, BarChart2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './QuizDetails.module.css';

export function QuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showCompletionsModal, setShowCompletionsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  const recentCompletions = [
    { id: 1, name: 'Alex Johnson', score: '85%', time: '15:24', date: '2 hours ago' },
    { id: 2, name: 'Emma Wilson', score: '92%', time: '18:24', date: '2 hours ago' },
    { id: 3, name: 'Michael Cohen', score: '92%', time: '18:24', date: '2 hours ago' },
    { id: 4, name: 'Sophia Garcia', score: '92%', time: '18:24', date: '2 hours ago' },
    { id: 5, name: 'Lucas Mendes', score: '100%', time: '10:12', date: '3 hours ago' },
    { id: 6, name: 'Ana Souza', score: '70%', time: '20:00', date: '4 hours ago' },
    { id: 7, name: 'Pedro Costa', score: '65%', time: '14:30', date: '5 hours ago' },
  ];

  const questionPerformance = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    question: `${index + 1}. Pergunta de avaliação sobre o tema abordado?`,
    correctRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60 
  }));

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        {/* --- CABEÇALHO --- */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={() => navigate('/quizzes')}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className={styles.title}>Quiz Dia 01 - Tema EPI</h1>
              <p className={styles.subtitle}>Conceitos básicos sobre o uso de EPIs</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            {/* Botão EDITAR removido por prudência de integridade de dados! */}
            <button className={styles.btnOutline} onClick={() => navigate(`/share-quiz/${id || '1'}`)}>
              <Share2 size={16} /> Compartilhar
            </button>
            <button className={styles.btnPrimary}>Prévia</button>
          </div>
        </header>

        {/* --- MÉTRICAS GERAIS --- */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Completos</span>
              <BookOpen size={20} className={styles.iconPurple} />
            </div>
            <div className={styles.statValue}>28</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Tempo de Conclusão</span>
              <Calendar size={20} className={styles.iconGreen} />
            </div>
            <div className={styles.statValue}>12:45</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Pontuação Média</span>
              <Users size={20} className={styles.iconBlue} />
            </div>
            <div className={styles.statValue}>78.5%</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Maior Pontuação</span>
              <BarChart2 size={20} className={styles.iconOrange} />
            </div>
            <div className={styles.statValue}>95%</div>
          </div>
        </div>

        {/* --- GRIDS INTERMEDIÁRIOS --- */}
        <div className={styles.middleGrid}>
          
          {/* Tabela de Conclusão Recente */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Conclusão Recente</h3>
                <p className={styles.panelSubtitle}>Participantes que concluíram esse quiz</p>
              </div>
              {/* O Click do botão agora abre o Modal! */}
              <button 
                className={styles.btnOutlineSmall}
                onClick={() => setShowCompletionsModal(true)}
              >
                Ver Resultados
              </button>
            </div>
            
            <div className={styles.tableContainer}>
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
                  {/* Na tela principal, mostramos apenas os 4 primeiros */}
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
          </div>

          {/* Desempenho dos Participantes */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Desempenho</h3>
                <p className={styles.panelSubtitle}>Acertos por questão</p>
              </div>
              {/* Novo Botão para abrir as 15 questões */}
              <button 
                className={styles.btnOutlineSmall}
                onClick={() => setShowPerformanceModal(true)}
              >
                Ver Todas
              </button>
            </div>
            
            <div className={styles.performanceList}>
              {/* Na tela principal, mostramos apenas as 5 primeiras */}
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
          </div>
          
        </div>

        {/* --- COMPARTILHAMENTO --- */}
        <div className={styles.shareBanner}>
          <div>
            <h3 className={styles.panelTitle}>Compartilhe esse Quiz</h3>
            <p className={styles.panelSubtitle}>Compartilhe esse Quiz com colegas de equipe</p>
          </div>
          <button 
            className={styles.btnPrimaryShare} 
            onClick={() => navigate(`/share-quiz/${id || '1'}`)}
          >
            <Share2 size={18} /> Compartilhar
          </button>
        </div>

      </main>

      {/* MODAL 1: TODOS OS PARTICIPANTES (CONCLUSÃO RECENTE) */}
      {showCompletionsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCompletionsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Todos os Resultados</h2>
              <button className={styles.closeBtn} onClick={() => setShowCompletionsModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
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
                  {recentCompletions.map((user) => (
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
          </div>
        </div>
      )}

      {/* MODAL 2: TODAS AS 15 QUESTÕES (DESEMPENHO)          */}
      {showPerformanceModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPerformanceModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Desempenho Detalhado (15 Questões)</h2>
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

    </div>
  );
}