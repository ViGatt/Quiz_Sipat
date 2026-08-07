import { useState } from 'react';
import { Mail, Lock, Home, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. Busca o colaborador pelo CPF diretamente na tabela do Supabase
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (error || !data) {
        setErro('CPF não encontrado ou senha incorreta.');
        setLoading(false);
        return;
      }

      // 2. Compara a senha digitada com a senha salva no banco
      if (data.senha !== senha) {
        setErro('CPF não encontrado ou senha incorreta.');
        setLoading(false);
        return;
      }

      // 3. Sucesso! Passamos os dados reais para o AuthContext salvar na sessão
      login({
        id: data.id,
        cpf: data.cpf,
        nome: data.nome,
        is_comissao: data.is_comissao
      });

      // 4. Redireciona com base no perfil (is_comissao)
      if (data.is_comissao) {
        navigate('/dashboard'); // Administrador vai para o Dashboard
      } else {
        navigate('/meus-quizzes'); // Participante vai para a lista de quizzes
      }

    } catch (err) {
      console.error('Erro no login:', err);
      setErro('Ocorreu um erro ao tentar fazer login. Tente novamente.');
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
            {erro && <div className={styles.errorMessage} style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>{erro}</div>}

            <div className={styles.inputGroup}>
              <label>CPF</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="Ex: 123.456.789-00" 
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* O Campo de Senha Voltou! */}
            <div className={styles.inputGroup}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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