import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Coluna 1: Marca */}
        <div className={styles.brandCol}>
          <h3 className={styles.brandName}>SIPAT RIC AMBIENTAL</h3>
          <p className={styles.brandDesc}>
            Teste seu conhecimento, consolide o aprendizado e concorra a prêmios.
          </p>
          <div className={styles.socialLinks}>
            <a href="#"><FaFacebook size={20} /></a>
            <a href="#"><FaTwitter size={20} /></a>
            <a href="#"><FaInstagram size={20} /></a>
            <a href="#"><FaLinkedin size={20} /></a>
            <a href="#"><FaYoutube size={20} /></a>
          </div>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Links Rápidos</h4>
          <a href="#">Página Inicial</a>
          <a href="#">Sobre nós</a>
          <a href="#">Funcionalidades</a>
          <a href="#">Contato</a>
        </div>

        {/* Coluna 3: Administrador */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Administrador</h4>
          <a href="#">Acesso</a>
          <a href="#">Contato</a>
          <a href="#">Informações</a>
        </div>

        {/* Coluna 4: Contatos */}
        <div className={styles.contactCol}>
          <h4 className={styles.colTitle}>Contatos </h4>
          <div className={styles.contactItem}>
            <Mail size={16} color="var(--color-primary)" />
            <span>sac@ricambiental.com.br</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={16} color="var(--color-primary)" />
            <span>(14) 3434-0220</span>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={16} color="var(--color-primary)" />
            <span>Av. Rio Branco, 173 - Marília</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>Copyright © 2026 SipaQuiz</p>
        <p>
          All Rights Reserved | <a href="#">Terms and Conditions</a> | <a href="#">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}