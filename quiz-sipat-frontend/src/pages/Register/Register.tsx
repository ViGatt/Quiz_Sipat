import { useState } from 'react';
import { Mail, Home, ChevronDown, Building, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [cpf, setCpf] = useState('');
  const [unidade, setUnidade] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const unidades = [
    'Distrito Industrial', 'São Miguel', 'Rio Branco', 
    'ETA CASCATA', 'ETA PEIXE', 'Operadores de Bomba', 
    'Vigilantes', 'PJ'
  ];

  const handleAtivacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      setErro('Digite um CPF válido com 11 números.');
      return;
    }

    if (!unidade) {
      setErro('Por favor, selecione sua Unidade de Trabalho.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verifica se o funcionário está na planilha do RH (no banco)
      const { data: colaborador, error: fetchError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('cpf', cpfLimpo)
        .single();

      if (fetchError || !colaborador) {
        setErro('CPF não encontrado na base de colaboradores da RIC Ambiental.');
        setLoading(false);
        return;
      }

      // 2. Verifica se a conta já foi ativada antes
      if (colaborador.senha) {
        setErro('Esta conta já está ativada. Por favor, vá para a tela de Login.');
        setLoading(false);
        return;
      }

      // 3. A MÁGICA: Gera a senha como os 4 primeiros dígitos do CPF
      const senhaAutomatica = cpfLimpo.substring(0, 4);

      // Atualiza o banco com a nova senha automática e unidade escolhida
      const { data: updatedData, error: updateError } = await supabase
        .from('colaboradores')
        .update({ senha: senhaAutomatica, unidade: unidade })
        .eq('id', colaborador.id)
        .select()
        .single();

      if (updateError || !updatedData) {
        setErro('Erro ao salvar suas informações. Tente novamente.');
        setLoading(false);
        return;
      }

      // 4. Exibe a tela de sucesso para o usuário ler a informação
      setSucesso(true);

      // Aguarda 3.5 segundos para ele ler a mensagem e então faz o login automático
      setTimeout(() => {
        login({
          id: updatedData.id,
          cpf: updatedData.cpf,
          nome: updatedData.nome,
          is_comissao: updatedData.is_comissao
        });

        if (updatedData.is_comissao) {
          navigate('/dashboard');
        } else {
          navigate('/take-quiz/1');
        }
      }, 3500);

    } catch (err) {
      setErro('Erro de conexão com o banco de dados.');
    } finally {
      if (!sucesso) setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.brandSide}>
        <div className={styles.brandContent}>
          <h1 className={styles.title}>
            SIPAT RIC<br />
            <span className={styles.titleHighlight}>AMBIENTAL</span>
          </h1>
          <img src={mascotImg} alt="Mascote SIPAT" className={styles.mascot} />
        </div>
      </div>

      <div className={styles.formSide}>
        <Link to="/" className={styles.homeButton} title="Voltar ao Início">
          <Home size={28} />
        </Link>
        <div className={styles.formContainer}>
          
          {/* TELA DE SUCESSO (Aparece após ativar) */}
          {sucesso ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.5s ease-in-out' }}>
              <CheckCircle size={64} color="var(--color-primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <h2 className={styles.formTitle}>Cadastro Ativado!</h2>
              <p className={styles.formSubtitle} style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                Sua senha de acesso são os <strong>4 primeiros dígitos do seu CPF</strong>.
              </p>
              <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Iniciando o quiz automaticamente...
              </p>
            </div>
          ) : (
            
            /* TELA DE FORMULÁRIO NORMAL */
            <>
              <h2 className={styles.formTitle}>Primeiro Acesso</h2>
              <p className={styles.formSubtitle}>Ative sua conta para participar da SIPAT</p>

              {/* CAIXA DE DICA VISUAL (UX) */}
              <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '12px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>💡</span>
                  <strong>Não precisa criar senha!</strong><br/>
                  Sua senha de acesso será gerada automaticamente usando os <strong>4 primeiros dígitos do seu CPF</strong>.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleAtivacao}>
                {erro && <div className={styles.errorMessage} style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>{erro}</div>}

                <div className={styles.inputGroup}>
                  <label>CPF</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={20} className={styles.inputIcon} />
                    <input 
                      type="text" 
                      placeholder="Ex: 111.111.111-11" 
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Unidade de Trabalho</label>
                  <div className={styles.customDropdownContainer}>
                    <div 
                      className={styles.inputWrapper} 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Building size={20} className={styles.inputIcon} />
                      <span 
                        className={styles.dropdownSelectedText} 
                        style={{ flex: 1, color: unidade ? 'var(--color-black)' : '#999999' }}
                      >
                        {unidade || "Selecione a Unidade..."}
                      </span>
                      <ChevronDown size={20} className={styles.inputIcon} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    
                    {isDropdownOpen && (
                      <ul className={styles.dropdownList}>
                        {unidades.map((uni) => (
                          <li 
                            key={uni} 
                            className={styles.dropdownItem}
                            onClick={() => {
                              setUnidade(uni);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {uni}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* CAMPO DE SENHA REMOVIDO DAQUI */}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Processando...' : 'Ativar Meu Cadastro'}
                </button>
              </form>

              <p className={styles.registerPrompt}>
                Já ativou sua conta? <Link to="/login" className={styles.registerLink}>Faça Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}