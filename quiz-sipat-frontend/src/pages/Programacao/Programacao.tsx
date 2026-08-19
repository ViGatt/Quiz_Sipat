import { Info, Clock, MapPin, Users } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar'; 
import { Footer } from '../../components/Footer/Footer'; // Importação do seu Footer real ativada!
import styles from './Programacao.module.css';

interface Evento {
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
  const eventos: Evento[] = [
    {
      data: '2026-09-14',
      diaNumero: '14',
      mes: 'SET',
      diaSemana: 'Segunda-feira',
      horario: 'Abertura às 07:30 da manhã',
      tema: 'Percepção de riscos, acidentes de trabalho e noções básicas de primeiros socorros de acordo com a NR-07.',
      palestrante: 'Cleginaldo Pontes',
      cargo: 'Bombeiro Militar',
      bio: 'Especialista em resgate e atendimento pré-hospitalar, trazendo conhecimentos práticos vitais para emergências no ambiente corporativo.',
      fotoUrl: 'https://ui-avatars.com/api/?name=Cleginaldo+Pontes&background=0D8ABC&color=fff&size=150',
      responsaveis: 'SESMT',
      local: 'São Miguel - Santo Antônio'
    },
    {
      data: '2026-09-15',
      diaNumero: '15',
      mes: 'SET',
      diaSemana: 'Terça-feira',
      horario: 'Abertura às 07:30 da manhã',
      tema: 'IST - Infecções Sexualmente Transmissíveis.',
      palestrante: 'Lara Cristina Casadei Ubeda',
      cargo: 'Farmacêutica',
      bio: 'Profissional de saúde dedicada à conscientização, prevenção e bem-estar integral dos colaboradores.',
      fotoUrl: 'https://ui-avatars.com/api/?name=Lara+Cristina&background=0D8ABC&color=fff&size=150',
      responsaveis: 'Robson, Alessandro e Jéssica Gonçalves',
      local: 'São Miguel - Santo Antônio'
    },
    {
      data: '2026-09-16',
      diaNumero: '16',
      mes: 'SET',
      diaSemana: 'Quarta-feira',
      horario: 'Abertura às 07:30 da manhã',
      tema: 'Prevenção de acidentes no trânsito, direção defensiva e multas.',
      palestrante: 'Marcos Farto',
      cargo: 'Especialista em Trânsito',
      bio: 'Consultor renomado em segurança viária, focando na mudança de comportamento para um trânsito mais seguro e consciente.',
      fotoUrl: 'https://ui-avatars.com/api/?name=Marcos+Farto&background=0D8ABC&color=fff&size=150',
      responsaveis: 'Fabiano dos Santos Rodrigues, Willians e Emerson',
      local: 'São Miguel - Santo Antônio'
    },
    {
      data: '2026-09-17',
      diaNumero: '17',
      mes: 'SET',
      diaSemana: 'Quinta-feira',
      horario: 'Abertura às 07:30 da manhã',
      tema: 'Dr. Google não é médico: os riscos da automedicação.',
      palestrante: 'Cristiane Fátima Guarido',
      cargo: 'Farmacêutica',
      bio: 'Especialista no uso racional de medicamentos, desmistificando os perigos de diagnósticos feitos pela internet.',
      fotoUrl: 'https://ui-avatars.com/api/?name=Cristiane+Guarido&background=0D8ABC&color=fff&size=150',
      responsaveis: 'Robson, Alessandro e Jéssica Gonçalves',
      local: 'São Miguel - Santo Antônio'
    },
    {
      data: '2026-09-18',
      diaNumero: '18',
      mes: 'SET',
      diaSemana: 'Sexta-feira',
      horario: 'Abertura às 07:30 da manhã',
      tema: 'Cultura na utilização de EPIs.',
      palestrante: 'Paulo Alexandre Silva Oliveira',
      cargo: 'Téc. de Segurança - Grupo Jacto de Pompeia',
      bio: 'Especialista em criar e manter a cultura de segurança viva na operação diária, ressaltando o valor inegociável do EPI.',
      fotoUrl: 'https://ui-avatars.com/api/?name=Paulo+Alexandre&background=0D8ABC&color=fff&size=150',
      responsaveis: 'Suellen, Fabiano e Ramon',
      local: 'São Miguel - Santo Antônio'
    }
  ];

  return (
    <div className={styles.layout}>
      {/* CABEÇALHO */}
      <Navbar />

      {/* CONTEÚDO PRINCIPAL */}
      <main className={styles.mainContent}>
        
        <header className={styles.header}>
          <h1 className={styles.title}>Programação Oficial SIPAT</h1>
          <p className={styles.subtitle}>Confira o cronograma de palestras e eventos de 14 a 18 de Setembro.</p>

          <div className={styles.legalBox}>
            <Info size={32} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '5px' }} />
            <p className={styles.legalText}>
              A SIPAT é uma obrigação legal, conforme definido na Portaria N° 3.214, NR 5, item 5.16 letra “O”. 
              É dever da CIPA <strong>“Promover, anualmente, em conjunto com o SESMT, a Semana Interna de Prevenção de Acidentes do Trabalho (SIPAT)”</strong>.
            </p>
          </div>
        </header>

        <section className={styles.timeline}>
          {eventos.map((evento, index) => (
            <article key={index} className={styles.eventCard}>
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
          ))}
        </section>

      </main>

      {/* FOOTER REAL INTEGRADO */}
      <Footer />
      
    </div>
  );
}