import { useState, useEffect } from 'react';
import { Info, Clock, MapPin, Users } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar'; 
import { Footer } from '../../components/Footer/Footer'; 
import { BackgroundGlow } from '../../components/BackgroundGlow/BackgroundGlow';
import { api } from '../../services/api'; // Import da API para buscar do banco
import styles from './Programacao.module.css';

interface Evento {
  id: number;
  data: string;
  diaNumero: string;
  mes: string;
  diaSemana: string;
  horario: string;
  tema: string;
  palestrante: string;
  cargo: string;
  bio: string;
  fotoUrl: string;
  responsaveis: string;
  local: string;
}

export function Programacao() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os eventos direto do banco de dados!
  useEffect(() => {
    const fetchEventosPublicos = async () => {
      try {
        const response = await api.get('/eventos/');
        setEventos(response.data);
      } catch (error) {
        console.error("Erro ao carregar a programação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventosPublicos();
  }, []);

  return (
    <div className={styles.layout}>
      
      <BackgroundGlow />
      <Navbar />

      <main className={styles.mainContent}>
        
        <header className={styles.header}>
          <h1 className={styles.title}>Programação Oficial SIPAT</h1>
          <p className={styles.subtitle}>Confira o cronograma de palestras e eventos.</p>

          <div className={styles.legalBox}>
            <Info size={32} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '5px' }} />
            <p className={styles.legalText}>
              A SIPAT é uma obrigação legal, conforme definido na Portaria N° 3.214, NR 5, item 5.16 letra “O”. 
              É dever da CIPA <strong>“Promover, anualmente, em conjunto com o SESMT, a Semana Interna de Prevenção de Acidentes do Trabalho (SIPAT)”</strong>.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-dark)' }}>
            Carregando cronograma oficial...
          </div>
        ) : (
          <section className={styles.timeline}>
            {eventos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-dark)' }}>Em breve a programação será divulgada!</p>
            ) : (
              eventos.map((evento) => (
                <article key={evento.id} className={styles.eventCard}>
                  <div className={styles.dateBox}>
                    <span className={styles.dayNumber}>{evento.diaNumero}</span>
                    <span className={styles.month}>{evento.mes}</span>
                    <span className={styles.weekDay}>{evento.diaSemana}</span>
                  </div>

                  <div className={styles.contentBox}>
                    <h2 className={styles.themeTitle}>{evento.tema}</h2>
                    
                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{evento.horario}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={16} />
                        <span>{evento.local}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span><strong>Org:</strong> {evento.responsaveis}</span>
                      </div>
                    </div>

                    <div className={styles.speakerProfile}>
                      <div className={styles.photoWrapper}>
                        <img src={evento.fotoUrl} alt={`Foto de ${evento.palestrante}`} className={styles.speakerPhoto} />
                      </div>
                      <div className={styles.speakerDetails}>
                        <span className={styles.speakerRole}>Palestrante • {evento.cargo}</span>
                        <span className={styles.speakerName}>{evento.palestrante}</span>
                        <p className={styles.speakerBio}>{evento.bio}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}