import { useState, useEffect } from 'react';
import { Mail, Lock, Home, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Se chegou aqui deslogado automaticamente por sessão expirada, avisa o motivo
  useEffect(() => {
    try {
      if (sessionStorage.getItem('@sipat:sessao_expirada')) {
        sessionStorage.removeItem('@sipat:sessao_expirada');
        setErro('Sua sessão expirou. Faça login novamente.');
      }
    } catch {
      // Sem acesso ao sessionStorage, apenas segue sem o aviso.
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    // Limpa o CPF digitado (remove pontos e traços) para garantir que ache no banco
    const cpfLimpo = cpf.replace(/\D/g, '');

    try {
      // Login validado no backend (o front nunca consulta a tabela de colaboradores diretamente)
      const { data } = await api.post('/auth/login', { cpf: cpfLimpo, senha });

      // Sucesso! Passamos os dados reais para o AuthContext salvar na sessão
      login({
        id: data.id,
        cpf: data.cpf,
        nome: data.nome,
        is_comissao: data.is_comissao,
        token: data.token
      });

      // Redireciona com base no perfil
      if (data.is_comissao) {
        navigate('/dashboard');
      } else {
        navigate('/meus-quizzes');
      }

    } catch (err: any) {
      console.error('Erro no login:', err);
      setErro(err.response?.data?.detail || 'Ocorreu um erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
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
          <h2 className={styles.formTitle}>Bem Vindo</h2>
          <p className={styles.formSubtitle}>Coloque suas credenciais para acesso</p>

          <form className={styles.form} onSubmit={handleLogin}>
            {erro && (
              <div className={styles.errorMessage} style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                {erro}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>CPF</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  inputMode="numeric"
                  placeholder="********"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  maxLength={4}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* DICA DE UX PARA A SENHA */}
              <small style={{ display: 'block', marginTop: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                💡 Dica: Sua senha são os <strong>4 primeiros dígitos</strong> do seu CPF.
              </small>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Verificando...' : 'Acessar SIPAT'}
            </button>
          </form>

          <p className={styles.registerPrompt}>
            Primeiro acesso? <Link to="/register" className={styles.registerLink}>Ative sua conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}