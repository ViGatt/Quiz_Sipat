import { Mail, Lock, Home} from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import mascotImg from '../../assets/MASCOTE-CIPA-MARI_2.png';

export function Login() {
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
          <h2 className={styles.formTitle}>Bem Vindo</h2>
          <p className={styles.formSubtitle}>Coloque suas credenciais para acesso</p>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label>E-mail ou CPF</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input type="text" placeholder="nome@exemplo.com ou 000.000.000-00" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input type="password" placeholder="********" />
              </div>
            </div>

            <button type="button" className={styles.submitBtn}>Login</button>
          </form>

          <p className={styles.registerPrompt}>
            Não possui uma conta? <Link to="/register" className={styles.registerLink}>Registre</Link>
          </p>
        </div>
      </div>
    </div>
  );
}