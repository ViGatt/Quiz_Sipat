import { useState } from 'react';
import { Mail, Lock, Home, Eye, EyeOff, ChevronDown, Building } from 'lucide-react';
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
  const [senha, setSenha] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const unidades = [
    'Distrito Industrial', 'São Miguel', 'Rio Branco', 
    'ETA CASCATA', 'ETA PEIXE', 'Operadores de Bomba', 
    'Vigilantes', 'PJ'
  ];

  const handleAtivacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!unidade) {
      setErro('Por favor, selecione sua Unidade de Trabalho.');
      return;
    }

    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

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

      // 3. Atualiza o banco com a nova senha e unidade que o funcionário escolheu
      const { data: updatedData, error: updateError } = await supabase
        .from('colaboradores')
        .update({ senha: senha, unidade: unidade })
        .eq('id', colaborador.id)
        .select()
        .single();

      if (updateError || !updatedData) {
        setErro('Erro ao salvar suas informações. Tente novamente.');
        setLoading(false);
        return;
      }

      // 4. Loga o usuário automaticamente após ativar a conta
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

    } catch (err) {
      setErro('Erro de conexão com o banco de dados.');
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
          <h2 className={styles.formTitle}>Primeiro Acesso</h2>
          <p className={styles.formSubtitle}>Ative sua conta para participar da SIPAT</p>

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

            <div className={styles.inputGroup}>
              <label>Crie uma Senha</label>
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
              {loading ? 'Ativando Conta...' : 'Ativar e Entrar'}
            </button>
          </form>

          <p className={styles.registerPrompt}>
            Já ativou sua conta? <Link to="/login" className={styles.registerLink}>Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}