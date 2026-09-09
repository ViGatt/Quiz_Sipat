import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gift, Sparkles, Trophy, Undo2, Loader2, AlertCircle, Ticket, Users, X, Wand2, PartyPopper
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

interface ConfetePeca {
  id: number;
  left: number;
  delay: number;
  duracao: number;
  cor: string;
  largura: number;
  altura: number;
  giro: number;
}

type FaseModal = 'misterio' | 'rolando' | 'revelacao';

const OPCAO_TODOS = 'todos';
const DURACAO_MISTERIO_MS = 1600;
const DURACAO_ROLETA_MS = 2200;
const CORES_CONFETE = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent-blue)',
  'var(--color-accent-purple)',
  '#fbbf24',
];
const FRASES_MISTERIO = [
  'Embaralhando os bilhetes...',
  'A sorte está sendo decidida...',
  'Quem será o sortudo?',
];

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function gerarConfete(qtd = 34): ConfetePeca[] {
  return Array.from({ length: qtd }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duracao: 1.6 + Math.random() * 1.3,
    cor: CORES_CONFETE[Math.floor(Math.random() * CORES_CONFETE.length)],
    largura: 6 + Math.random() * 6,
    altura: 10 + Math.random() * 8,
    giro: Math.random() > 0.5 ? 1 : -1,
  }));
}

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
  const [vencedorAtual, setVencedorAtual] = useState<Vencedor | null>(null);

  // --- POP-UP DRAMÁTICO DO SORTEIO ---
  const [modalAberto, setModalAberto] = useState(false);
  const [faseModal, setFaseModal] = useState<FaseModal>('misterio');
  const [fraseMisterio, setFraseMisterio] = useState(FRASES_MISTERIO[0]);
  const [nomeRolando, setNomeRolando] = useState<string | null>(null);
  const [tickRoleta, setTickRoleta] = useState(0);
  const [vencedorModal, setVencedorModal] = useState<Vencedor | null>(null);
  const [confete, setConfete] = useState<ConfetePeca[]>([]);

  const pularRef = useRef(false);

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
      pularRef.current = true;
    };
  }, []);

  const elegiveis = participantes.filter(p => p.elegivel);
  const totalBilhetes = participantes.length;
  const totalElegiveis = elegiveis.length;

  const nomeDoGrupoAtual = diaSelecionado === OPCAO_TODOS
    ? 'Sorteio Geral (todos os dias)'
    : quizzes.find(q => q.id === Number(diaSelecionado))?.tema || `Dia ${diaSelecionado}`;

  // Espera interrompível: some em pedaços curtos para que "Pular" consiga
  // cortar a espera no meio, em vez de travar o admin numa animação longa
  // durante um evento ao vivo com tempo curto.
  const esperaInterruptivel = async (ms: number) => {
    const passo = 80;
    let restante = ms;
    while (restante > 0 && !pularRef.current) {
      await sleep(Math.min(passo, restante));
      restante -= passo;
    }
  };

  // Roleta com desaceleração: começa trocando de nome rapidamente e vai
  // ficando mais lenta (easing quadrático) até "encaixar" no vencedor real,
  // como uma roda da sorte parando.
  const rodarRoleta = async (nomes: string[], nomeVencedor: string) => {
    const inicio = Date.now();
    let contador = 0;
    while (Date.now() - inicio < DURACAO_ROLETA_MS && !pularRef.current) {
      const aleatorio = nomes[Math.floor(Math.random() * nomes.length)];
      contador += 1;
      setNomeRolando(aleatorio);
      setTickRoleta(contador);

      const progresso = (Date.now() - inicio) / DURACAO_ROLETA_MS;
      const atraso = 70 + progresso * progresso * 260;
      await sleep(atraso);
    }
    setNomeRolando(nomeVencedor);
    setTickRoleta((c) => c + 1);
    await sleep(350);
  };

  const handleSortear = async () => {
    if (totalElegiveis === 0) {
      showError('Não há participantes elegíveis nesse grupo para sortear.');
      return;
    }

    setSorteando(true);

    try {
      // Já garante o vencedor real no backend antes de qualquer animação,
      // para o pop-up nunca poder "errar" ou divergir do que foi salvo.
      const response = await api.post('/sorteio/realizar', {
        dia_sipat_id: diaSipatIdAtual,
        premio: premio.trim() || null,
        impedir_repeticao: impedirRepeticao,
      });
      const vencedor: Vencedor = response.data;

      pularRef.current = false;
      setVencedorModal(vencedor);
      setNomeRolando(null);
      setFraseMisterio(FRASES_MISTERIO[0]);
      setModalAberto(true);

      // Fase 1: mistério (suspense antes de revelar quem concorre)
      setFaseModal('misterio');
      let indiceFrase = 0;
      const trocaFrase = window.setInterval(() => {
        indiceFrase = (indiceFrase + 1) % FRASES_MISTERIO.length;
        setFraseMisterio(FRASES_MISTERIO[indiceFrase]);
      }, 550);
      await esperaInterruptivel(DURACAO_MISTERIO_MS);
      window.clearInterval(trocaFrase);

      // Fase 2: roleta desacelerando até o vencedor real
      setFaseModal('rolando');
      const nomesParaRolar = elegiveis.length > 0
        ? elegiveis.map(p => p.colaborador_nome)
        : [vencedor.colaborador_nome];
      await rodarRoleta(nomesParaRolar, vencedor.colaborador_nome);

      // Fase 3: revelação com confete e efeitos no nome
      setConfete(gerarConfete());
      setFaseModal('revelacao');
      setVencedorAtual(vencedor);
      showSuccess(`🎉 Vencedor: ${vencedor.colaborador_nome} — Nº ${vencedor.numero_gerado}`);
      setVencedores(prev => [vencedor, ...prev]);
      fetchParticipantes(diaSipatIdAtual);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || 'Erro de conexão ao tentar realizar o sorteio.';
      showError(msg);
    } finally {
      setSorteando(false);
    }
  };

  const pularAnimacao = () => {
    pularRef.current = true;
  };

  const fecharModal = () => {
    if (faseModal !== 'revelacao') return;
    setModalAberto(false);
    setVencedorModal(null);
    setNomeRolando(null);
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
              {sorteando && (
                <div className={styles.placeholder}>
                  <Loader2 size={40} className="spin" />
                  <p>O sorteio está rolando no pop-up...</p>
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

      {modalAberto && vencedorModal && (
        <div
          className={styles.modalOverlay}
          onClick={fecharModal}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            {faseModal === 'revelacao' && (
              <button className={styles.modalFechar} onClick={fecharModal} aria-label="Fechar">
                <X size={20} />
              </button>
            )}

            {faseModal === 'misterio' && (
              <div className={styles.faseMisterio}>
                <div className={styles.misterioAnel}>
                  <Wand2 size={40} className={styles.misterioIcone} />
                </div>
                <p className={styles.misterioTexto}>{fraseMisterio}</p>
                <p className={styles.misterioSub}>Preparando o sorteio de {nomeDoGrupoAtual}</p>
              </div>
            )}

            {faseModal === 'rolando' && (
              <div className={styles.faseRolando}>
                <Sparkles size={28} className={styles.rolandoIcon} />
                <div className={styles.rolandoJanela}>
                  <span key={tickRoleta} className={styles.rolandoNome}>
                    {nomeRolando || '...'}
                  </span>
                </div>
                <p className={styles.misterioSub}>Girando os bilhetes...</p>
              </div>
            )}

            {faseModal === 'revelacao' && (
              <div className={styles.faseRevelacao}>
                <div className={styles.confettiContainer}>
                  {confete.map((c) => (
                    <span
                      key={c.id}
                      className={styles.confettiPeca}
                      style={{
                        left: `${c.left}%`,
                        backgroundColor: c.cor,
                        width: c.largura,
                        height: c.altura,
                        animationDelay: `${c.delay}s`,
                        animationDuration: `${c.duracao}s`,
                        // @ts-expect-error custom property lida pela keyframe
                        '--giro': c.giro,
                      }}
                    />
                  ))}
                </div>

                <PartyPopper size={26} className={styles.popperIcone} />
                <Trophy size={48} className={styles.revelacaoTrofeu} />
                <span className={styles.revelacaoLabel}>Vencedor(a)</span>
                <h3 className={styles.revelacaoNome}>{vencedorModal.colaborador_nome}</h3>
                <p className={styles.vencedorCpf}>CPF: {vencedorModal.cpf}</p>
                <p className={styles.vencedorNumero}>
                  <Ticket size={16} /> {vencedorModal.numero_gerado}
                </p>
                {vencedorModal.premio && (
                  <p className={styles.vencedorPremio}>🎁 {vencedorModal.premio}</p>
                )}

                <button className={styles.btnSortear} onClick={fecharModal}>
                  Fechar
                </button>
              </div>
            )}

            {faseModal !== 'revelacao' && (
              <button className={styles.modalPular} onClick={pularAnimacao}>
                Pular animação →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
