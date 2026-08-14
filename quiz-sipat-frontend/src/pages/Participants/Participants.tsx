import { useState, useRef } from 'react';
import { 
  Search, Upload, UserCheck, Key, Ticket, 
  AlertCircle, CheckCircle, FileText, Loader2
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Participants.module.css';

// --- MOCK DE DADOS PARA VISUALIZAÇÃO (Ainda manteremos mockado até fazermos o GET) ---
const MOCK_PARTICIPANTS = [
  { id: '1', nome: 'Claudete', cpf: '999.999.999-99', statusHoje: 'PENDENTE', numeroSorte: '' },
  { id: '2', nome: 'Carlos Souza', cpf: '555.666.777-88', statusHoje: 'PRESENCIAL', numeroSorte: '2891' },
  { id: '3', nome: 'Marcos Ribeiro', cpf: '999.000.111-22', statusHoje: 'ONLINE', numeroSorte: '3301' },
  { id: '4', nome: 'Joãozinho', cpf: '123.123.123-12', statusHoje: 'PENDENTE', numeroSorte: '' },
];

export function Participants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);

  // Estados do Modal de Importação
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredParticipants = participants.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.cpf.includes(searchQuery)
  );

  // --- FUNÇÕES DA TABELA ---
  const handleCheckIn = async (id: string, nome: string, cpf: string) => {
    if (!window.confirm(`Confirmar presença presencial para ${nome} no dia de hoje?`)) {
      return;
    }

    try {
      // Faz a chamada para a nossa rota do FastAPI
      const response = await fetch("http://127.0.0.1:8000/recepcao/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''), // Manda o CPF limpo (só números)
          nome_completo: nome,
          dia_sipat_id: 1 // TODO: Tornar dinâmico futuramente
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualiza a tabela na tela com o status verde e o Número da Sorte real do banco!
        setParticipants(prev => prev.map(p => 
          p.id === id 
            ? { ...p, statusHoje: 'PRESENCIAL', numeroSorte: String(data.numero_sorte) } 
            : p
        ));
        
        alert(`Sucesso! O Número da Sorte gerado foi: ${data.numero_sorte}`);
      } else {
        // Mostra o erro exato que o Python devolveu (ex: "Participação já registrada")
        alert(`Erro: ${data.detail}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor ao tentar fazer o check-in.");
    }
  };

  const handleResetPassword = (nome: string, cpf: string) => {
    if (window.confirm(`Redefinir a senha de ${nome}? A nova senha será os 4 primeiros dígitos do CPF.`)) {
      const novaSenha = cpf.replace(/\D/g, '').substring(0, 4);
      alert(`Senha redefinida com sucesso! A nova senha provisória é: ${novaSenha}`);
    }
  };

  // --- LÓGICA DE IMPORTAÇÃO DE ARQUIVO ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      alert("Por favor, selecione uma planilha (.xlsx ou .csv) primeiro.");
      return;
    }

    setIsUploading(true);

    // Prepara o arquivo para envio no formato "multipart/form-data"
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Dispara para a nossa rota do FastAPI
      const response = await fetch("http://127.0.0.1:8000/recepcao/importar-rh", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Mostra a mensagem de sucesso do Python
        setShowImportModal(false); // Fecha o modal
        setSelectedFile(null); // Limpa o arquivo
      } else {
        alert(`Erro na importação: ${data.detail}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor. Verifique se a API está rodando.");
    } finally {
      setIsUploading(false);
    }
  };

  const fecharModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
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
                    <button 
                      onClick={() => handleResetPassword(p.nome, p.cpf)}
                      className={styles.btnReset}
                      title="Resetar Senha para 4 primeiros dígitos do CPF"
                    >
                      <Key size={18} />
                    </button>

                    <button 
                      onClick={() => handleCheckIn(p.id, p.nome, p.cpf)}
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
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <FileText size={48} />
            </div>
            <h2 className={styles.modalTitle}>Importar Base do RH</h2>
            <p className={styles.modalDesc}>
              Faça o upload de uma planilha (.xlsx ou .csv) contendo as colunas <strong>NOME</strong> e <strong>CPF</strong> para liberar o acesso ao sistema.
            </p>

            {/* ÁREA DE CLIQUE PARA ARQUIVO */}
            <div 
              className={styles.dropzone} 
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: selectedFile ? 'var(--color-primary)' : '' }}
            >
              {selectedFile ? (
                <div style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  <CheckCircle size={24} style={{ marginBottom: '8px' }} />
                  <p>{selectedFile.name}</p>
                </div>
              ) : (
                <p className={styles.dropzoneText}>Clique aqui para selecionar um arquivo</p>
              )}
              
              {/* Input escondido que faz a mágica acontecer */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }} 
              />
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.btnOutline} 
                onClick={fecharModal}
                disabled={isUploading}
              >
                Cancelar
              </button>
              
              <button 
                className={styles.btnPrimary} 
                onClick={handleUploadFile}
                disabled={isUploading || !selectedFile}
                style={{ opacity: (isUploading || !selectedFile) ? 0.5 : 1 }}
              >
                {isUploading ? (
                  <> <Loader2 size={18} className="spin" /> Processando... </>
                ) : (
                  'Processar Arquivo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}