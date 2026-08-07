import { Search, Plus, BookOpen, Clock, Users, MoreVertical, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Quizzes.module.css';


export function Quizzes() {
  const navigate = useNavigate();
  // Simulando os dados que virão da API Python no futuro
  const quizzesList = [
    { 
      id: 1, 
      title: 'Quiz Dia 01 - Tema EPI', 
      desc: 'Conceitos basicos de saúde', 
      status: 'Published', 
      questions: 15, 
      time: 20, 
      participants: 32 
    },
    { 
      id: 2, 
      title: 'Quiz Dia 02 - Tema Saúde', 
      desc: 'Conceitos basicos de saúde', 
      status: 'Draft', 
      questions: 15, 
      time: 20, 
      participants: 32 
    },
    { 
      id: 3, 
      title: 'Quiz Dia 03 - Tema Ergonomia', 
      desc: 'Conceitos basicos de ergonomia', 
      status: 'Rascunho', 
      questions: 15, 
      time: 20, 
      participants: 32 
    },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        {/* Cabeçalho da Página */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Quizzes</h1>
            <p className={styles.subtitle}>Crie, gerencie e organize seus quizzes</p>
          </div>
          <Link to="/create-quiz" className={styles.btnPrimary}>
            <Plus size={18} />
            Criar Novo Quiz
          </Link>
        </header>

        {/* Cartão Principal: Biblioteca de Quiz */}
        <div className={styles.libraryCard}>
          <div className={styles.libraryHeader}>
            <div>
              <h2 className={styles.libraryTitle}>Biblioteca de Quiz</h2>
              <p className={styles.librarySubtitle}>Crie, gerencie e organize todos seus quizzes</p>
            </div>
          </div>

          {/* Barra de Controles (Abas, Busca e Filtro) */}
          <div className={styles.controlsRow}>
            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${styles.activeTab}`}>Quizzes</button>
              <button className={styles.tabBtn}>Publicados</button>
              <button className={styles.tabBtn}>Rascunho</button>
            </div>

            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.iconMuted} />
                <input type="text" placeholder="Buscar quizzes..." className={styles.searchInput} />
              </div>
              <button className={styles.filterBtn}>
                <Search size={16} className={styles.iconMuted} style={{ visibility: 'hidden', width: 0, padding: 0 }}/> {/* Placeholder para alinhamento se quiser colocar icone de filtro */}
                Categorias
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Lista de Quizzes */}
          <div className={styles.quizList}>
            {quizzesList.map((quiz) => (
              <div key={quiz.id} className={styles.quizItem}>
                <div className={styles.quizIconWrapper}>
                  <BookOpen size={24} className={styles.quizIcon} />
                </div>
                
                <div className={styles.quizInfo}>
                  <div className={styles.quizTitleRow}>
                    <h3>{quiz.title}</h3>
                    <span className={`${styles.badge} ${quiz.status === 'Published' ? styles.badgePublished : styles.badgeDraft}`}>
                      {quiz.status}
                    </span>
                  </div>
                  <p className={styles.quizDesc}>{quiz.desc}</p>
                  
                  <div className={styles.quizMeta}>
                    <span><BookOpen size={14} /> {quiz.questions} questões</span>
                    <span><Clock size={14} /> {quiz.time} min</span>
                    <span><Users size={14} /> {quiz.participants} complementos</span>
                    <span>Criado agora</span>
                  </div>
                </div>

                <div className={styles.quizActions}>
                  <button 
                    className={styles.btnOutline}
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                  >
                    Visualizar
                  </button>
                  
                  <button className={styles.btnIcon} onClick={() => navigate(`/share-quiz/${quiz.id}`)}>
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}