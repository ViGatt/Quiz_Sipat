import { useState } from 'react';
import { Mail, Lock, User, Building, Contact, Eye, EyeOff, ChevronDown, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Register.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png'; 

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [unidade, setUnidade] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const opcoesUnidade = [
        "Distrito Industrial", "São Miguel", "Rio Branco",
        "ETA CASCATA", "ETA PEIXE", "Operadores de Bomba",
        "Vigilantes", "PJ"
    ];
  return (
    <div className={styles.container}>
      {/* Lado Esquerdo - Branding Escuro */}
      <div className={styles.brandSide}>
        <div className={styles.brandContent}>
          <h1 className={styles.title}>
            SIPAT RIC<br />
            <span className={styles.titleHighlight}>AMBIENTAL</span>
          </h1>
          <img src={mascotImg} alt="Mascote SIPAT" className={styles.mascot} />
        </div>
      </div>

      {/* Lado Direito - Formulário Claro */}
          <div className={styles.formSide}>
              <Link to="/" className={styles.homeButton} title="Voltar ao Início">
          <Home size={28} />
        </Link>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Criar Conta</h2>
          <p className={styles.formSubtitle}>Crie sua conta e comece sua jornada conosco</p>

          <form className={styles.form}>
            {/* Grid para Nome e CPF */}
            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label>Nome Completo</label>
                <div className={styles.inputWrapper}>
                  <User size={20} className={styles.inputIcon} />
                  <input type="text" placeholder="John Doe" />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>CPF</label>
                <div className={styles.inputWrapper}>
                  <Contact size={20} className={styles.inputIcon} />
                  <input type="text" placeholder="000.000.000-00" />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup} style={{ position: 'relative' }}>
              <label>Unidade</label>
              
              {/* O Wrapper agora age como um botão para abrir a lista */}
              <div 
                className={styles.inputWrapper} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                <Building size={20} className={styles.inputIcon} />
                
                {/* Texto Selecionado ou Placeholder */}
                <span className={unidade ? styles.inputText : styles.placeholderText}>
                  {unidade || "Selecione sua unidade..."}
                </span>
                
                {/* Ícone da setinha */}
                <ChevronDown size={20} className={styles.inputIcon} style={{ marginLeft: 'auto', marginRight: 0 }} />
              </div>

              {/* A Lista Customizada que só aparece se isDropdownOpen for true */}
              {isDropdownOpen && (
                <ul className={styles.dropdownList}>
                  {opcoesUnidade.map((opcao) => (
                    <li 
                      key={opcao} 
                      className={styles.dropdownItem}
                      onClick={() => {
                        setUnidade(opcao); // Salva a escolha
                        setIsDropdownOpen(false); // Fecha a lista
                      }}
                    >
                      {opcao}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label>E-mail</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input type="email" placeholder="nome@exemplo.com" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                {/* O type muda dinamicamente baseado no estado */}
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********" 
                />
                {/* Botão do Olho */}
                <button 
                  type="button" 
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <p className={styles.termsText}>
              Ao registrar, concordo com o <a href="#" className={styles.link}>Termo de Participação</a>
            </p>

            <button type="button" className={styles.submitBtn}>Registrar</button>
          </form>

          <p className={styles.loginPrompt}>
            Já possui uma conta? <Link to="/login" className={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}