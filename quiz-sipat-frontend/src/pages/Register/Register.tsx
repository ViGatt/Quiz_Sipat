import { useState } from 'react';
import { Mail, Home, ChevronDown, Building, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png';
import { api } from '../../services/api';
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
      // Ativação validada no backend (o front nunca consulta/atualiza a tabela
      // de colaboradores diretamente, evitando expor dados de RH via chave anon)
      const { data: updatedData } = await api.post('/auth/ativar', { cpf: cpfLimpo, unidade });

      // Exibe a tela de sucesso para o usuário ler a informação
      setSucesso(true);

      // Aguarda 3.5 segundos para ele ler a mensagem e então faz o login automático
      setTimeout(() => {
        login({
          id: updatedData.id,
          cpf: updatedData.cpf,
          nome: updatedData.nome,
          is_comissao: updatedData.is_comissao,
          token: updatedData.token
        });

        if (updatedData.is_comissao) {
          navigate('/dashboard');
        } else {
          navigate('/meus-quizzes')
        }
      }, 3500);

    } catch (err: any) {
      setErro(err.response?.data?.detail || 'Erro de conexão com o banco de dados.');
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
            <div className={styles.successBox}>
              <CheckCircle size={64} color="var(--color-primary)" className={styles.successIcon} />
              <h2 className={styles.formTitle}>Cadastro Ativado!</h2>
              <p className={`${styles.formSubtitle} ${styles.successSubtitle}`}>
                Sua senha de acesso são os <strong>4 primeiros dígitos do seu CPF</strong>.
              </p>
              <p className={styles.successHint}>
                Iniciando o quiz automaticamente...
              </p>
            </div>
          ) : (
            
            /* TELA DE FORMULÁRIO NORMAL */
            <>
              <h2 className={styles.formTitle}>Primeiro Acesso</h2>
              <p className={styles.formSubtitle}>Ative sua conta para participar da SIPAT</p>

              {/* CAIXA DE DICA VISUAL (UX) */}
              <div className={styles.tipBox}>
                <p className={styles.tipText}>
                  <span className={styles.tipEmoji}>💡</span>
                  <strong>Não precisa criar senha!</strong><br/>
                  Sua senha de acesso será gerada automaticamente usando os <strong>4 primeiros dígitos do seu CPF</strong>.
                </p>
              </div>

              <form className={styles.form} onSubmit={handleAtivacao}>
                {erro && <div className={styles.errorMessage}>{erro}</div>}

                <div className={styles.inputGroup}>
                  <label>CPF</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={20} className={styles.inputIcon} />
                    <input
                      type="text"
                      inputMode="numeric"
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
                      className={`${styles.inputWrapper} ${styles.dropdownTrigger}`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <Building size={20} className={styles.inputIcon} />
                      <span
                        className={`${styles.dropdownSelectedText} ${unidade ? styles.dropdownSelectedTextFilled : ''}`}
                      >
                        {unidade || "Selecione a Unidade..."}
                      </span>
                      <ChevronDown size={20} className={`${styles.inputIcon} ${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ''}`} />
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