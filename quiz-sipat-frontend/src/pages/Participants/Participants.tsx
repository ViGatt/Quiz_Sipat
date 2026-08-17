import { useState, useRef, useEffect } from 'react';
import { 
  Search, Upload, UserCheck, Key, Ticket, 
  AlertCircle, CheckCircle, FileText, Loader2
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Participants.module.css';

export function Participants() {
  const [searchQuery, setSearchQuery] = useState('');
  // Agora a lista começa vazia e vai ser preenchida pelo Banco de Dados!
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Estados do Modal de Importação
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- NOVA FUNÇÃO: BUSCAR DADOS REAIS ---
  const fetchParticipants = async () => {
    setIsLoadingList(true);
    try {
      // Usando o dia 1 fixo por enquanto para testes
      const response = await fetch("http://127.0.0.1:8000/recepcao/status/1");
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participantes || []);
      } else {
        console.error("Erro ao buscar a lista do backend.");
      }
    } catch (error) {
      console.error("Erro de conexão com a API:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Dispara a busca assim que a tela abre
  useEffect(() => {
    fetchParticipants();
  }, []);

  const filteredParticipants = participants.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.cpf.includes(searchQuery)
  );

  // --- LÓGICA DO CHECK-IN PRESENCIAL ---
  const handleCheckIn = async (id: string, nome: string, cpf: string) => {
    if (!window.confirm(`Confirmar presença presencial para ${nome} no dia de hoje?`)) {
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/recepcao/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''), 
          nome_completo: nome,
          dia_sipat_id: 1 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setParticipants(prev => prev.map(p => 
          p.id === id 
            ? { ...p, statusHoje: 'PRESENCIAL', numeroSorte: String(data.numero_sorte) } 
            : p
        ));
        alert(`Sucesso! O Número da Sorte gerado foi: ${data.numero_sorte}`);
      } else {
        alert(`Erro: ${data.detail}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor ao tentar fazer o check-in.");
    }
  };

  // --- LÓGICA DE RESET DE SENHA (Apenas visual por enquanto) ---
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
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/recepcao/importar-rh", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); 
        setShowImportModal(false); 
        setSelectedFile(null); 
        
        // --- ATUALIZA A LISTA NA HORA APÓS IMPORTAR! ---
        fetchParticipants();
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
              {isLoadingList ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                    <p style={{ marginTop: '10px' }}>Carregando colaboradores...</p>
                  </td>
                </tr>
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    Nenhum colaborador encontrado. Se a base estiver vazia, importe uma planilha do RH.
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