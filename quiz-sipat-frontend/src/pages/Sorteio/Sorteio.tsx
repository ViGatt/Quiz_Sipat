import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gift, Sparkles, Trophy, Undo2, Loader2, AlertCircle, Ticket, Users
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Sorteio.module.css';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Quiz {
  id: number;
  tema: string;
}

interface Participante {
  numero_sorte_id: string;
  colaborador_id: string;
  dia_sipat_id: number;
  numero_gerado: string;
  colaborador_nome: string;
  cpf: string;
  elegivel: boolean;
}

interface Vencedor {
  id: string;
  numero_sorte_id: string;
  colaborador_id: string;
  colaborador_nome: string;
  cpf: string;
  numero_gerado: string;
  dia_sipat_id: number | null;
  escopo: string;
  premio: string | null;
  criado_em: string;
}

const OPCAO_TODOS = 'todos';
const DURACAO_ANIMACAO_MS = 1400;
const INTERVALO_ANIMACAO_MS = 90;

export function Sorteio() {
  const { showSuccess, showError } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<string>(OPCAO_TODOS);
  const [premio, setPremio] = useState('');
  const [impedirRepeticao, setImpedirRepeticao] = useState(true);

  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [vencedores, setVencedores] = useState<Vencedor[]>([]);
  const [carregandoGrupo, setCarregandoGrupo] = useState(true);
  const [carregandoBase, setCarregandoBase] = useState(true);

  const [sorteando, setSorteando] = useState(false);
  const [nomeRolando, setNomeRolando] = useState<string | null>(null);
  const [vencedorAtual, setVencedorAtual] = useState<Vencedor | null>(null);

  const intervaloRef = useRef<number | null>(null);

  const diaSipatIdAtual = diaSelecionado === OPCAO_TODOS ? null : Number(diaSelecionado);

  const fetchParticipantes = useCallback(async (diaId: number | null) => {
    setCarregandoGrupo(true);
    try {
      const params = diaId !== null ? { dia_sipat_id: diaId } : {};
      const response = await api.get('/sorteio/participantes', { params });
      setParticipantes(response.data.participantes || []);
    } catch (error) {
      console.error('Erro ao buscar participantes do sorteio:', error);
      showError('Não foi possível carregar os participantes do sorteio.');
    } finally {
      setCarregandoGrupo(false);
    }
  }, [showError]);

  const fetchVencedores = useCallback(async () => {
    try {
      const response = await api.get('/sorteio/vencedores');
      setVencedores(response.data.vencedores || []);
    } catch (error) {
      console.error('Erro ao buscar vencedores:', error);
    }
  }, []);

  const carregarBase = useCallback(async () => {
    setCarregandoBase(true);
    try {
      const response = await api.get('/quiz/');
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Erro ao buscar dias da SIPAT:', error);
      showError('Não foi possível carregar a lista de dias da SIPAT.');
    } finally {
      setCarregandoBase(false);
    }
  }, [showError]);

  useEffect(() => {
    carregarBase();
    fetchVencedores();
  }, [carregarBase, fetchVencedores]);

  useEffect(() => {
    fetchParticipantes(diaSipatIdAtual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaSelecionado]);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) window.clearInterval(intervaloRef.current);
    };
  }, []);

  const elegiveis = participantes.filter(p => p.elegivel);
  const totalBilhetes = participantes.length;
  const totalElegiveis = elegiveis.length;

  const nomeDoGrupoAtual = diaSelecionado === OPCAO_TODOS
    ? 'Sorteio Geral (todos os dias)'
    : quizzes.find(q => q.id === Number(diaSelecionado))?.tema || `Dia ${diaSelecionado}`;

  const handleSortear = async () => {
    if (totalElegiveis === 0) {
      showError('Não há participantes elegíveis nesse grupo para sortear.');
      return;
    }

    setSorteando(true);
    setVencedorAtual(null);

    try {
      // 1) Já garante o vencedor real no backend antes de qualquer animação,
      // para a roleta na tela nunca poder "errar" ou divergir do que foi salvo.
      const response = await api.post('/sorteio/realizar', {
        dia_sipat_id: diaSipatIdAtual,
        premio: premio.trim() || null,
        impedir_repeticao: impedirRepeticao,
      });
      const vencedor: Vencedor = response.data;

      // 2) Roleta visual: alterna nomes do grupo elegível por um tempo curto
      // e só então revela o vencedor real retornado pelo servidor.
      const nomesParaRolar = elegiveis.length > 0
        ? elegiveis.map(p => p.colaborador_nome)
        : [vencedor.colaborador_nome];

      const inicio = Date.now();
      intervaloRef.current = window.setInterval(() => {
        const aleatorio = nomesParaRolar[Math.floor(Math.random() * nomesParaRolar.length)];
        setNomeRolando(aleatorio);

        if (Date.now() - inicio >= DURACAO_ANIMACAO_MS) {
          if (intervaloRef.current) window.clearInterval(intervaloRef.current);
          setNomeRolando(null);
          setVencedorAtual(vencedor);
          setSorteando(false);
          showSuccess(`🎉 Vencedor: ${vencedor.colaborador_nome} — Nº ${vencedor.numero_gerado}`);

          setVencedores(prev => [vencedor, ...prev]);
          fetchParticipantes(diaSipatIdAtual);
        }
      }, INTERVALO_ANIMACAO_MS);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Erro de conexão ao tentar realizar o sorteio.';
      showError(msg);
      setSorteando(false);
    }
  };

  const handleDesfazer = async (vencedor: Vencedor) => {
    if (!window.confirm(`Desfazer a vitória de ${vencedor.colaborador_nome}? O bilhete dela volta a concorrer.`)) {
      return;
    }
    try {
      await api.delete(`/sorteio/vencedores/${vencedor.id}`);
      showSuccess('Sorteio desfeito. O bilhete voltou a concorrer.');
      setVencedores(prev => prev.filter(v => v.id !== vencedor.id));
      if (vencedorAtual?.id === vencedor.id) setVencedorAtual(null);
      fetchParticipantes(diaSipatIdAtual);
    } catch (error: any) {
      console.error(error);
      showError(error.response?.data?.detail || 'Erro ao desfazer o sorteio.');
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Sorteio dos Números da Sorte</h1>
            <p className={styles.subtitle}>
              Sorteie os vencedores da SIPAT com base nos números da sorte gerados por presença física e por quiz online aprovado.
            </p>
          </div>
        </header>

        <div className={styles.grid}>
          {/* PAINEL DE CONTROLE */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Configurar sorteio</h2>

            <label className={styles.label}>Grupo do sorteio</label>
            <select
              className={styles.select}
              value={diaSelecionado}
              onChange={(e) => setDiaSelecionado(e.target.value)}
              disabled={carregandoBase || sorteando}
            >
              <option value={OPCAO_TODOS}>Todos os dias (Sorteio Geral)</option>
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>{q.tema}</option>
              ))}
            </select>

            <label className={styles.label}>Prêmio (opcional)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex: 1º Prêmio - Bicicleta"
              value={premio}
              onChange={(e) => setPremio(e.target.value)}
              disabled={sorteando}
            />

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={impedirRepeticao}
                onChange={(e) => setImpedirRepeticao(e.target.checked)}
                disabled={sorteando}
              />
              Impedir que o mesmo colaborador ganhe mais de uma vez
            </label>

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <Users size={18} />
                <div>
                  <strong>{carregandoGrupo ? '...' : totalElegiveis}</strong>
                  <span>Elegíveis agora</span>
                </div>
              </div>
              <div className={styles.statBox}>
                <Ticket size={18} />
                <div>
                  <strong>{carregandoGrupo ? '...' : totalBilhetes}</strong>
                  <span>Bilhetes no grupo</span>
                </div>
              </div>
            </div>

            {!carregandoGrupo && totalElegiveis === 0 && (
              <div className={styles.avisoVazio}>
                <AlertCircle size={18} />
                <span>Nenhum participante elegível neste grupo. Verifique se a presença/quiz gerou números da sorte, ou se todos já venceram algo.</span>
              </div>
            )}

            <button
              className={styles.btnSortear}
              onClick={handleSortear}
              disabled={sorteando || carregandoGrupo || totalElegiveis === 0}
            >
              {sorteando ? (
                <> <Loader2 size={22} className="spin" /> Sorteando... </>
              ) : (
                <> <Sparkles size={22} /> Sortear vencedor </>
              )}
            </button>
          </div>

          {/* PAINEL DE RESULTADO */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>{nomeDoGrupoAtual}</h2>

            <div className={styles.resultadoBox}>
              {sorteando && nomeRolando && (
                <div className={styles.roleta}>
                  <Gift size={40} className={styles.rolandoIcon} />
                  <span className={styles.nomeRolando}>{nomeRolando}</span>
                </div>
              )}

              {!sorteando && vencedorAtual && (
                <div className={styles.vencedorCard}>
                  <Trophy size={40} className={styles.trophyIcon} />
                  <h3>{vencedorAtual.colaborador_nome}</h3>
                  <p className={styles.vencedorCpf}>CPF: {vencedorAtual.cpf}</p>
                  <p className={styles.vencedorNumero}>
                    <Ticket size={16} /> {vencedorAtual.numero_gerado}
                  </p>
                  {vencedorAtual.premio && (
                    <p className={styles.vencedorPremio}>🎁 {vencedorAtual.premio}</p>
                  )}
                </div>
              )}

              {!sorteando && !vencedorAtual && (
                <div className={styles.placeholder}>
                  <Gift size={40} />
                  <p>Configure o sorteio ao lado e clique em "Sortear vencedor".</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HISTÓRICO DE VENCEDORES */}
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <h2 className={styles.panelTitle}>Histórico de vencedores</h2>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Nº Sorte</th>
                <th>Grupo</th>
                <th>Prêmio</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vencedores.length > 0 ? (
                vencedores.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className={styles.colaboradorNome}>{v.colaborador_nome}</div>
                      <div className={styles.colaboradorCpf}>{v.cpf}</div>
                    </td>
                    <td>
                      <div className={styles.numeroSorte}>
                        <Ticket size={16} color="var( --color-secondary )" />
                        {v.numero_gerado}
                      </div>
                    </td>
                    <td>
                      {v.escopo === 'GERAL'
                        ? 'Geral'
                        : (quizzes.find(q => q.id === v.dia_sipat_id)?.tema || `Dia ${v.dia_sipat_id}`)}
                    </td>
                    <td>{v.premio || '—'}</td>
                    <td>{new Date(v.criado_em).toLocaleString('pt-BR')}</td>
                    <td className={styles.actionsCell}>
                      <button className={styles.btnDesfazer} onClick={() => handleDesfazer(v)}>
                        <Undo2 size={16} /> Desfazer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Nenhum sorteio realizado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
