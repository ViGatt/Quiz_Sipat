import { useState } from 'react';
import { ChevronLeft, Copy, Check, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './ShareQuiz.module.css';

export function ShareQuiz() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID do quiz na URL (ex: /share-quiz/1)
  
  const [copied, setCopied] = useState(false);

  const quizLink = `https://quizmaster.com/quizzes/q${id || '1'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Função para baixar o QR Code como imagem PNG
  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `sipat-quiz-${id || '1'}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        
        {/* CABEÇALHO */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className={styles.title}>Compartilhar Quiz</h1>
            <p className={styles.subtitle}>Compartilhe o Quiz com seus colegas de equipe</p>
          </div>
        </header>

        {/* ÁREA DO LINK */}
        <div className={styles.section}>
          <label className={styles.label}>Link Compartilhável</label>
          <div className={styles.linkWrapper}>
            <input 
              type="text" 
              readOnly 
              value={quizLink} 
              className={styles.linkInput} 
            />
            <button 
              className={styles.copyButton} 
              onClick={handleCopyLink}
              title="Copiar Link"
            >
              {copied ? <Check size={20} color="var(--color-secondary)" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        {/* ÁREA DO QR CODE */}
        <div className={styles.section}>
          <label className={styles.label}>QR Code</label>
          <div className={styles.qrCard}>
            <div className={styles.qrWrapper}>
              {/* Gerador Real de QR Code! */}
              <QRCodeCanvas 
                id="qr-code-canvas"
                value={quizLink} 
                size={200} 
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"} // Alta precisão para leitura fácil em telas
                includeMargin={true}
              />
            </div>
          </div>
          
          <div className={styles.actionRow}>
            <button className={styles.btnOutline} onClick={handleDownloadQR}>
              <Download size={18} />
              Baixar QR Code
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}