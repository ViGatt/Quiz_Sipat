import { useState, useRef, useEffect } from 'react';
import { 
  Search, Upload, UserCheck, Ticket, 
  AlertCircle, CheckCircle, FileText, Loader2
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Participants.module.css';
import { api } from '../../services/api';


export function Participants() {
  const [searchQuery, setSearchQuery] = useState('');
  // Agora a lista começa vazia e vai ser preenchida pelo Banco de Dados!
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // --- PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Estados do Modal de Importação
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- NOVA FUNÇÃO: BUSCAR DADOS REAIS ---
  const fetchParticipants = async () => {
    setIsLoadingList(true);
    try {
      // O Axios usa a baseURL configurada, então passamos apenas o caminho final
      const response = await api.get('/recepcao/status/1');
      
      // O Axios armazena o resultado convertido em JSON dentro de "response.data"
      setParticipants(response.data.participantes || []);
      
    } catch (error) {
      // Qualquer erro de servidor ou rede cai automaticamente aqui
      console.error("Erro ao buscar a lista do backend:", error);
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

  const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE);

  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Sempre que a busca mudar, volta pra página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Se a lista encolher (ex: filtro ou reimportação) e a página atual não existir mais, corrige
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // --- LÓGICA DO CHECK-IN PRESENCIAL ---
  const handleCheckIn = async (id: string, nome: string, cpf: string) => {
    if (!window.confirm(`Confirmar presença presencial para ${nome} no dia de hoje?`)) {
      return;
    }

    try {
      // O Axios já transforma o objeto em JSON automaticamente
      const response = await api.post('/recepcao/registrar', {
        cpf: cpf.replace(/\D/g, ''), 
        nome_completo: nome,
        dia_sipat_id: 1 
      });

      // Se a requisição chegou até aqui, foi sucesso (status 200+)
      // O Axios guarda o retorno do Back-end dentro de "response.data"
      setParticipants(prev => prev.map(p => 
        p.id === id 
          ? { ...p, statusHoje: 'PRESENCIAL', numeroSorte: String(response.data.numero_sorte) } 
          : p
      ));
      alert(`Sucesso! O Número da Sorte gerado foi: ${response.data.numero_sorte}`);
      
    } catch (error: any) {
      console.error(error);
      // Pega a mensagem de erro específica do Back-end, se houver
      const errorMessage = error.response?.data?.detail || "Erro de conexão com o servidor ao tentar fazer o check-in.";
      alert(`Erro: ${errorMessage}`);
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
      // Basta passar a rota e o formData. O Axios cuida do resto!
      const response = await api.post('/recepcao/importar-rh', formData);

      // Sucesso!
      alert(response.data.message); 
      setShowImportModal(false); 
      setSelectedFile(null); 
      
      // --- ATUALIZA A LISTA NA HORA APÓS IMPORTAR! ---
      fetchParticipants();
      
    } catch (error: any) {
      console.error(error);
      // Captura o erro customizado do backend ou exibe o padrão
      const errorMessage = error.response?.data?.detail || "Erro de conexão com o servidor. Verifique se a API está rodando.";
      alert(`Erro na importação: ${errorMessage}`);
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
              placeholder="Buscar por Nome ou CPF..." 
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
              ) : paginatedParticipants.length > 0 ? (
                paginatedParticipants.map((p) => (
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

          {!isLoadingList && filteredParticipants.length > 0 && (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredParticipants.length)} de {filteredParticipants.length}
              </span>

              <div className={styles.paginationControls}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                <span className={styles.pageIndicator}>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
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
