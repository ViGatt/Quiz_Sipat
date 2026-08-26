import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, MapPin, Clock } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar'; 
import { api } from '../../services/api'; // Integração com sua API
import styles from './EventosAdmin.module.css';

interface Evento {
  id: number;
  data: string;
  diaNumero: string;
  mes: string;
  diaSemana: string;
  horario: string;
  tema: string;
  palestrante: string;
  cargo: string;
  bio: string;
  fotoUrl: string;
  responsaveis: string;
  local: string;
}

export function EventosAdmin() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  // Busca os eventos do banco de dados ao carregar a tela
  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eventos/');
      setEventos(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const emptyEvento: Evento = {
    id: 0, data: '', diaNumero: '', mes: '', diaSemana: '', horario: '', 
    tema: '', palestrante: '', cargo: '', bio: '', fotoUrl: '', responsaveis: '', local: ''
  };

  const handleOpenModal = (evento?: Evento) => {
    if (evento) {
      setEditingEvento({ ...evento });
    } else {
      setEditingEvento({ ...emptyEvento }); 
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvento(null);
  };

  const handleSave = async () => {
    if (!editingEvento) return;

    // 1. TRAVA DE OBRIGATORIEDADE (Todos os campos exceto fotoUrl e id)
    if (
      !editingEvento.diaNumero || !editingEvento.mes || !editingEvento.diaSemana ||
      !editingEvento.horario || !editingEvento.tema || !editingEvento.palestrante ||
      !editingEvento.cargo || !editingEvento.bio || !editingEvento.local || !editingEvento.responsaveis
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // 2. GERAÇÃO DE AVATAR COM INICIAIS (Caso não envie foto)
    let finalFotoUrl = editingEvento.fotoUrl;
    if (!finalFotoUrl || finalFotoUrl.trim() === '') {
      // Pega o nome do palestrante, troca espaços por '+' para a API de avatares gerar as 2 iniciais
      const formatName = editingEvento.palestrante.trim().replace(/\s+/g, '+');
      finalFotoUrl = `https://ui-avatars.com/api/?name=${formatName}&background=0D8ABC&color=fff&size=150`;
    }

    const payload = { ...editingEvento, fotoUrl: finalFotoUrl };

    try {
      if (editingEvento.id && editingEvento.id > 0) {
        // EDIÇÃO (PUT)
        await api.put(`/eventos/${editingEvento.id}`, payload);
        alert("Evento atualizado com sucesso!");
      } else {
        // CRIAÇÃO (POST)
        await api.post('/eventos/', payload);
        alert("Evento criado com sucesso!");
      }
      
      handleCloseModal();
      fetchEventos(); // Atualiza a lista com o banco
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar o evento. Verifique a conexão com o banco.");
    }
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Tem certeza que deseja excluir este evento definitivamente?')) {
      try {
        await api.delete(`/eventos/${id}`);
        alert("Evento excluído!");
        fetchEventos(); // Atualiza a lista
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir o evento.");
      }
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gerenciamento de Eventos</h1>
            <p className={styles.subtitle}>Crie e edite a programação visível para os participantes.</p>
          </div>
          
          <button className={styles.btnAdd} onClick={() => handleOpenModal()}>
            <Plus size={20} /> Novo Evento
          </button>
        </header>

        {loading ? (
          <p style={{ color: 'var(--color-text-dark)' }}>Carregando eventos do banco de dados...</p>
        ) : (
          <div className={styles.grid}>
            {eventos.map(evento => (
              <div key={evento.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.dateInfo}>
                    <span className={styles.day}>{evento.diaNumero}</span>
                    <div className={styles.dateDetails}>
                      <span>{evento.mes}</span>
                      <span>{evento.diaSemana}</span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleOpenModal(evento)} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => handleDelete(evento.id)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3>{evento.tema}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--color-text-dark)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Clock size={14} /> {evento.horario}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <MapPin size={14} /> {evento.local} | <strong>Org:</strong> {evento.responsaveis}
                    </div>
                  </div>

                  <div className={styles.speakerPreview}>
                    <img src={evento.fotoUrl} alt="Palestrante" className={styles.speakerPhoto} />
                    <div className={styles.speakerInfo}>
                      <h4>{evento.palestrante}</h4>
                      <span>{evento.cargo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {eventos.length === 0 && (
              <p style={{ color: 'var(--color-text-dark)' }}>Nenhum evento cadastrado no banco de dados ainda.</p>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && editingEvento && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingEvento.id ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button className={styles.btnClose} onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Data Numérica (Ex: 14) *</label>
                  <input type="text" value={editingEvento.diaNumero} onChange={e => setEditingEvento({...editingEvento, diaNumero: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Mês (Ex: SET) *</label>
                  <input type="text" value={editingEvento.mes} onChange={e => setEditingEvento({...editingEvento, mes: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Dia da Semana *</label>
                  <input type="text" value={editingEvento.diaSemana} onChange={e => setEditingEvento({...editingEvento, diaSemana: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Horário *</label>
                  <input type="text" value={editingEvento.horario} onChange={e => setEditingEvento({...editingEvento, horario: e.target.value})} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Tema da Palestra *</label>
                  <input type="text" value={editingEvento.tema} onChange={e => setEditingEvento({...editingEvento, tema: e.target.value})} />
                </div>

                <div className={styles.formGroup}>
                  <label>Local *</label>
                  <input type="text" value={editingEvento.local} onChange={e => setEditingEvento({...editingEvento, local: e.target.value})} />
                </div>
                
                {/* NOVO CAMPO ADICIONADO AQUI! */}
                <div className={styles.formGroup}>
                  <label>Organizadores (Responsaveis) *</label>
                  <input type="text" value={editingEvento.responsaveis} onChange={e => setEditingEvento({...editingEvento, responsaveis: e.target.value})} />
                </div>

                <hr style={{ gridColumn: '1 / -1', borderColor: 'var(--color-surface)', margin: '1rem 0' }} />

                <div className={styles.formGroup}>
                  <label>Nome do Palestrante *</label>
                  <input type="text" value={editingEvento.palestrante} onChange={e => setEditingEvento({...editingEvento, palestrante: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Cargo do Palestrante *</label>
                  <input type="text" value={editingEvento.cargo} onChange={e => setEditingEvento({...editingEvento, cargo: e.target.value})} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>URL da Foto (Deixe em branco para gerar avatar automático)</label>
                  <div className={styles.photoPreviewContainer}>
                    {editingEvento.fotoUrl ? (
                      <img src={editingEvento.fotoUrl} alt="Preview" />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={24} color="#94a3b8" />
                      </div>
                    )}
                    <input 
                      type="text" 
                      placeholder="Cole o link da imagem aqui..." 
                      style={{ flex: 1 }}
                      value={editingEvento.fotoUrl} 
                      onChange={e => setEditingEvento({...editingEvento, fotoUrl: e.target.value})} 
                    />
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Breve Currículo / Bio *</label>
                  <textarea 
                    rows={3} 
                    value={editingEvento.bio} 
                    onChange={e => setEditingEvento({...editingEvento, bio: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={handleCloseModal}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSave}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}