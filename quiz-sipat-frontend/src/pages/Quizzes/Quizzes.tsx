import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Clock, Users, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { api } from '../../services/api';
import styles from './Quizzes.module.css';

export function Quizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DOS FILTROS ---
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const carregarQuizzes = async () => {
      try {
        setLoading(true);
        // 1. Removida a barra do final
        const response = await api.get('/quiz'); 
        
        // 2. Verifica se é array direto ou se está dentro de uma propriedade "quizzes"
        const fetchedQuizzes = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.quizzes || []);
        
        const formattedQuizzes = fetchedQuizzes.map((q: any) => {
          // --- LÓGICA DO STATUS DINÂMICO ---
          let statusReal = q.status || 'Publicado';
          const agora = new Date();
          
          if (statusReal === 'Programado' && q.data_liberacao) {
            const dataLiberacao = new Date(q.data_liberacao);
            if (dataLiberacao <= agora) {
              statusReal = 'Publicado'; // O horário já passou, então já está valendo!
            }
          }

          return {
            id: q.id,
            title: `Quiz Dia ${String(q.id).padStart(2, '0')} - ${q.tema || 'Sem Tema'}`,
            desc: q.descricao || 'Sem descrição cadastrada',
            status: statusReal, // Usa o status inteligente
            questions: q.questoes ? q.questoes.length : (q.total_questoes || 0), 
            time: q.tempo_limite || 15, 
            participants: q.total_participantes || 0,
            data_criacao: q.criado_em ? new Date(q.criado_em + 'T12:00:00').toLocaleDateString('pt-BR') : 'Recentemente'
          };
        });

        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error("Erro ao buscar biblioteca de quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarQuizzes();
  }, []);

  // --- LÓGICA DE FILTRAGEM (ABA + BARRA DE BUSCA) ---
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesTab = activeTab === 'Todos' || quiz.status === activeTab;
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      quiz.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

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

          {/* Barra de Controles (Abas e Busca) */}
          <div className={styles.controlsRow}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'Todos' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('Todos')}
              >
                Todos
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'Publicado' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('Publicado')}
              >
                Publicados
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'Programado' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('Programado')}
              >
                Programados
              </button>
            </div>

            <div className={styles.filters}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.iconMuted} />
                <input 
                  type="text" 
                  placeholder="Buscar quizzes..." 
                  className={styles.searchInput} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Lista de Quizzes */}
          <div className={styles.quizList}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Carregando seus quizzes...
              </div>
            ) : filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className={styles.quizItem}>
                  <div className={styles.quizIconWrapper}>
                    <BookOpen size={24} className={styles.quizIcon} />
                  </div>
                  
                  <div className={styles.quizInfo}>
                    <div className={styles.quizTitleRow}>
                      <h3>{quiz.title}</h3>
                      <span className={`${styles.badge} ${quiz.status === 'Publicado' ? styles.badgePublished : styles.badgeDraft}`}>
                        {quiz.status}
                      </span>
                    </div>
                    <p className={styles.quizDesc}>{quiz.desc}</p>
                    
                    <div className={styles.quizMeta}>
                      <span><BookOpen size={14} /> {quiz.questions} questões</span>
                      <span><Clock size={14} /> {quiz.time} min</span>
                      <span><Users size={14} /> {quiz.participants} participações</span>
                      <span>{quiz.data_criacao}</span>
                    </div>
                  </div>

                  <div className={styles.quizActions} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Botão 1: Vai para a tela de Detalhes e Métricas (QuizDetails) */}
                    <button 
                      className={styles.btnOutline}
                      onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    >
                      Métricas
                    </button>

                    {/* Botão 2: Vai para a tela de Responder o Quiz */}
                    <button 
                      className={styles.btnOutline}
                      onClick={() => navigate(`/meus-quizzes/${quiz.id}`)}
                      title="Abrir o Quiz para responder"
                    >
                      Testar Quiz
                    </button>
                    
                    <button className={styles.btnIcon} onClick={() => navigate(`/share-quiz/${quiz.id}`)}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Nenhum quiz encontrado com esses filtros.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}