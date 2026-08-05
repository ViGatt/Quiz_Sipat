import { Plus, BookOpen, Calendar, Users, BarChart2, Medal } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Dashboard.module.css';

export function Dashboard() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        {/* Cabeçalho */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Bem vindo(a) de volta! Veja o que está acontecendo nos Quizzes</p>
          </div>
          <button className={styles.btnPrimary}>
            <Plus size={18} />
            Criar Novo Quiz
          </button>
        </header>

        {/* Cards de Estatísticas */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Total Respostas</span>
              <BookOpen size={20} className={styles.statIconPurple} />
            </div>
            <div className={styles.statValue}>2,543 <span className={styles.positive}>+12.5%</span></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Eventos Ativos</span>
              <Calendar size={20} className={styles.statIconGreen} />
            </div>
            <div className={styles.statValue}>2,543 <span className={styles.positive}>+12.5%</span></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Funcionários</span>
              <Users size={20} className={styles.statIconBlue} />
            </div>
            <div className={styles.statValue}>2,543 <span className={styles.positive}>+12.5%</span></div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Informação Complementar</span>
              <BarChart2 size={20} className={styles.statIconOrange} />
            </div>
            <div className={styles.statValue}>2,543 <span className={styles.negative}>-12.5%</span></div>
          </div>
        </div>

        {/* Área Central: Eventos e Participantes */}
        <div className={styles.middleGrid}>
          {/* Eventos Recentes */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Eventos Recentes</h3>
            <p className={styles.panelSubtitle}>Organize o que está por vir e eventos vigentes</p>
            
            <div className={styles.eventList}>
              <div className={styles.eventCard}>
                <Calendar size={24} className={styles.eventIcon} />
                <div className={styles.eventInfo}>
                  <h4>Quiz Dia 01 - Tema EPI</h4>
                  <span>Hoje, 2:30 PM • 32 participants</span>
                </div>
                <button className={styles.btnActionPrimary}>Visualizar</button>
              </div>
              
              <div className={styles.eventCard}>
                <Calendar size={24} className={styles.eventIcon} />
                <div className={styles.eventInfo}>
                  <h4>Quiz Dia 02 - Tema Saúde</h4>
                  <span>30/07, 10:00 AM • 28 participants</span>
                </div>
                <button className={styles.btnActionSecondary}>Gerenciar</button>
              </div>
            </div>
          </div>

          {/* Top Participantes */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Top Participantes</h3>
            <p className={styles.panelSubtitle}>Participantes com maior pontuação</p>
            
            <div className={styles.participantList}>
              {[1, 2, 3, 4, 5].map((pos) => (
                <div key={pos} className={styles.participantItem}>
                  <div className={styles.participantRank}>{pos}</div>
                  <div className={styles.participantAvatar}></div>
                  <div className={styles.participantInfo}>
                    <h4>Participante 0{pos}</h4>
                    <span>Quiz Total</span>
                  </div>
                  <div className={styles.participantScore}>
                    <Medal size={16} className={styles.medalIcon} />
                    950
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}