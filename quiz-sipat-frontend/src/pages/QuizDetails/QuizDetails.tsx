import { ChevronLeft, Edit, Share2, BookOpen, Calendar, Users, BarChart2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './QuizDetails.module.css';

export function QuizDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const recentCompletions = [
    { id: 1, name: 'Alex Johnson', score: '85%', time: '15:24', date: '2 hours ago' },
    { id: 2, name: 'Emma Wilson', score: '92%', time: '18:24', date: '2 hours ago' },
    { id: 3, name: 'Michael Cohen', score: '92%', time: '18:24', date: '2 hours ago' },
    { id: 4, name: 'Sophia Garcia', score: '92%', time: '18:24', date: '2 hours ago' },
  ];

  const questionPerformance = [
    { id: 1, question: '1. O que é EPI?', correctRate: 92 },
    { id: 2, question: '2. O que o EPI promove?', correctRate: 92 },
    { id: 3, question: '3. Qual dos abaixo não é EPI?', correctRate: 92 },
    { id: 4, question: '4. Quem fornece o EPI?', correctRate: 92 },
    { id: 5, question: '5. Quando fazer troca e manutenção de EPI?', correctRate: 92 },
  ];

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
              <p className={styles.subtitle}>Basic concepts of biology for beginners</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnOutline}>
              <Edit size={16} /> Editar
            </button>
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
              <button className={styles.btnOutlineSmall}>Ver Resultados</button>
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

          {/* Desempenho dos Participantes */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Quiz Dia 01 - Tema EPI</h3>
            <p className={styles.panelSubtitle}>Desempenho dos participantes</p>
            
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
    </div>
  );
}