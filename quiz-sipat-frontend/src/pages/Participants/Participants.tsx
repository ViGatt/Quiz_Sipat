import { useState } from 'react';
import { 
  Search, Upload, UserCheck, Key, Ticket, 
  AlertCircle, CheckCircle, FileText
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Participants.module.css';

// --- MOCK DE DADOS PARA VISUALIZAÇÃO ---
const MOCK_PARTICIPANTS = [
  { id: '1', nome: 'Ana Silva', cpf: '111.222.333-44', statusHoje: 'PENDENTE', numeroSorte: '1042' },
  { id: '2', nome: 'Carlos Souza', cpf: '555.666.777-88', statusHoje: 'PRESENCIAL', numeroSorte: '2891' },
  { id: '3', nome: 'Marcos Ribeiro', cpf: '999.000.111-22', statusHoje: 'ONLINE', numeroSorte: '3301' },
];

export function Participants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  const filteredParticipants = participants.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.cpf.includes(searchQuery)
  );

  const handleCheckIn = (id: string, nome: string) => {
    if (window.confirm(`Confirmar presença presencial para ${nome} no dia de hoje?`)) {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, statusHoje: 'PRESENCIAL' } : p));
      alert('Presença registrada com sucesso!');
    }
  };

  const handleResetPassword = (nome: string, cpf: string) => {
    if (window.confirm(`Redefinir a senha de ${nome}? A nova senha será os 4 primeiros dígitos do CPF.`)) {
      const novaSenha = cpf.replace(/\D/g, '').substring(0, 4);
      alert(`Senha redefinida com sucesso! A nova senha provisória é: ${novaSenha}`);
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        
        {/* CABEÇALHO */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Recepção e Participantes</h1>
            <p className={styles.subtitle}>
              Gerencie presenças físicas, senhas e importe a base do RH.
            </p>
          </div>
          
          <button className={styles.btnPrimary} onClick={() => setShowImportModal(true)}>
            <Upload size={20} />
            Importar Planilha (RH)
          </button>
        </header>

        {/* BARRA DE PESQUISA */}
        <div className={styles.panel}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CPF ou Bipar Crachá..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* TABELA DE PARTICIPANTES */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Status Hoje</th>
                <th>Nº Sorte</th>
                <th style={{ textAlign: 'right' }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.colaboradorNome}>{p.nome}</div>
                    <div className={styles.colaboradorCpf}>{p.cpf}</div>
                  </td>
                  
                  <td>
                    {p.statusHoje === 'PENDENTE' && (
                      <span className={`${styles.badge} ${styles.badgePendente}`}>
                        <AlertCircle size={16}/> Pendente
                      </span>
                    )}
                    {p.statusHoje === 'PRESENCIAL' && (
                      <span className={`${styles.badge} ${styles.badgePresencial}`}>
                        <CheckCircle size={16}/> Recepção
                      </span>
                    )}
                    {p.statusHoje === 'ONLINE' && (
                      <span className={`${styles.badge} ${styles.badgeOnline}`}>
                        <CheckCircle size={16}/> App Online
                      </span>
                    )}
                  </td>

                  <td>
                    <div className={styles.numeroSorte}>
                      <Ticket size={18} color="var(--color-accent-purple)" />
                      {p.numeroSorte || '---'}
                    </div>
                  </td>

                  <td className={styles.actionsCell}>
                    {/* BOTÃO DE RESET DE SENHA */}
                    <button 
                      onClick={() => handleResetPassword(p.nome, p.cpf)}
                      className={styles.btnReset}
                      title="Resetar Senha para 4 primeiros dígitos do CPF"
                    >
                      <Key size={18} />
                    </button>

                    {/* BOTÃO DE CHECK-IN */}
                    <button 
                      onClick={() => handleCheckIn(p.id, p.nome)}
                      disabled={p.statusHoje !== 'PENDENTE'}
                      className={styles.btnCheckIn}
                    >
                      <UserCheck size={18} />
                      {p.statusHoje === 'PENDENTE' ? 'Check-in Físico' : 'Registrado'}
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Nenhum colaborador encontrado com esse termo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DE IMPORTAÇÃO DE EXCEL */}
      {showImportModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImportModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <FileText size={48} />
            </div>
            <h2 className={styles.modalTitle}>Importar Base do RH</h2>
            <p className={styles.modalDesc}>
              Faça o upload de uma planilha (.xlsx ou .csv) contendo as colunas <strong>NOME</strong> e <strong>CPF</strong> para liberar o acesso ao sistema.
            </p>

            <div className={styles.dropzone}>
              <p className={styles.dropzoneText}>Clique aqui para selecionar um arquivo</p>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowImportModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnPrimary}>
                Processar Arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}