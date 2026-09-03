import { ShieldCheck, HeartPulse, HardHat, Car, Activity, Leaf, Award, Users, BookOpen, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar/Navbar';
import { Footer } from '../../components/Footer/Footer';
import styles from './Sobre.module.css';
import { BackgroundGlow } from '../../components/BackgroundGlow/BackgroundGlow';



export function Sobre() {
  
  const pilares = [
    {
      icon: <ShieldCheck size={26} />,
      titulo: 'Prevenção de Acidentes',
      descricao: 'Identificação antecipada de riscos operacionais e adoção de comportamentos preventivos para zerar acidentes de trabalho.'
    },
    {
      icon: <HeartPulse size={26} />,
      titulo: 'Saúde & Bem-Estar',
      descricao: 'Ações contínuas de conscientização sobre saúde física e mental, alimentação equilibrada e prevenção de ISTs.'
    },
    {
      icon: <HardHat size={26} />,
      titulo: 'Cultura do Uso de EPIs',
      descricao: 'Reforço do valor inegociável dos Equipamentos de Proteção Individual e Coletiva em todas as unidades de trabalho.'
    },
    {
      icon: <Car size={26} />,
      titulo: 'Segurança no Trânsito',
      descricao: 'Treinamento sobre Direção Defensiva e prudência no deslocamento diário, protegendo vidas dentro e fora da empresa.'
    },
    {
      icon: <Activity size={26} />,
      titulo: 'Ergonomia no Trabalho',
      descricao: 'Orientações de postura e alongamento para prevenir lesões musculares nas rotinas operacionais e administrativas.'
    },
    {
      icon: <Leaf size={26} />,
      titulo: 'Meio Ambiente & Sustentabilidade',
      descricao: 'Práticas de preservação ambiental, descarte correto de resíduos e consumo consciente alinhados à missão da RIC Ambiental.'
    }
  ];

  return (
    <div className={styles.layout}>
      <BackgroundGlow />
      {/* NAVBAR SUPERIOR */}
      <Navbar />

      {/* CONTEÚDO PRINCIPAL */}
      <main className={styles.mainContent}>

        {/* HERO SECTION */}
        <header className={styles.heroSection}>
          <span className={styles.badge}>SIPAT RIC AMBIENTAL</span>
          <h1 className={styles.title}>
            Não existe tarefa tão urgente que valha o <br />
            <span className={styles.titleHighlight}>risco de não voltar para casa.</span>
          </h1>
          <p className={styles.subtitle}>
            A Semana Interna de Prevenção de Acidentes do Trabalho é mais do que um compromisso legal: é a garantia de que cada colaborador volte para casa em segurança todos os dias.
          </p>
        </header>

        {/* ESTATÍSTICAS / INDICADORES */}
        <section className={styles.statsContainer}>
          <div className={styles.statBox}>
            <Users size={32} className={styles.statIcon} />
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Engajamento dos Colaboradores</div>
          </div>
          <div className={styles.statBox}>
            <Award size={32} className={styles.statIcon} />
            <div className={styles.statNumber}>5 Dias</div>
            <div className={styles.statLabel}>De Aprendizado & Palestras</div>
          </div>
          <div className={styles.statBox}>
            <BookOpen size={32} className={styles.statIcon} />
            <div className={styles.statNumber}>Quiz Digital</div>
            <div className={styles.statLabel}>Interação & Prêmios Exclusivos</div>
          </div>
        </section>

        {/* O QUE É A SIPAT */}
        <section className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>O que é a SIPAT?</h2>
            <p className={styles.sectionSubtitle}>Entenda a missão do evento e o impacto na nossa rotina</p>
          </div>

          <div className={styles.aboutCard}>
            <p>
              A <strong>SIPAT (Semana Interna de Prevenção de Acidentes do Trabalho)</strong> é um evento anual organizado em conjunto pela <strong>CIPA (Comissão Interna de Prevenção de Acidentes e Assédio)</strong> e pelo <strong>SESMT (Serviço Especializado em Segurança e Medicina do Trabalho)</strong> da <strong>RIC Ambiental</strong>.
            </p>
            <p>
              O objetivo principal é orientar, conscientizar e educar os funcionários sobre a importância da prevenção de acidentes, saúde no ambiente corporativo, uso de equipamentos de segurança e qualidade de vida.
            </p>
            <p>
              Por meio de palestras dinâmicas, treinamentos e o nosso <strong>Quiz Digital SIPAT</strong>, buscamos fortalecer uma cultura onde a segurança não é uma obrigação, mas um valor compartilhado por todos.
            </p>
          </div>
        </section>

        {/* OS PILARES DA PREVENÇÃO (6 CARDS SIMÉTRICOS) */}
        <section className={styles.infoSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Os Pilares da Prevenção</h2>
            <p className={styles.sectionSubtitle}>Temas centrais abordados durante a nossa semana de conscientização</p>
          </div>

          <div className={styles.pillarsGrid}>
            {pilares.map((pilar, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarHeader}>
                  <div className={styles.pillarIconWrapper}>
                    {pilar.icon}
                  </div>
                  <h3 className={styles.pillarTitle}>{pilar.titulo}</h3>
                </div>
                <p className={styles.pillarDesc}>{pilar.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EMBASAMENTO LEGAL */}
        <section className={styles.legalBox}>
          <FileText size={36} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
          <p className={styles.legalText}>
            A realização da SIPAT é respaldada pela legislação brasileira, conforme a <strong>Portaria Nº 3.214, Norma Regulamentadora 5 (NR-5), item 5.16, letra “O”</strong>, estabelecendo como atribuição da CIPA: 
            <br />
            <em>“Promover, anualmente, em conjunto com o SESMT, a Semana Interna de Prevenção de Acidentes do Trabalho - SIPAT.”</em>
          </p>
        </section>

        {/* CALL TO ACTION PARA O QUIZ */}
        <section className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Pronto para testar seus conhecimentos?</h2>
          <p className={styles.ctaDesc}>
            Assista às palestras do dia, participe dos Quizzes interativos, conquiste pontos e concorra aos prêmios oficiais da SIPAT RIC Ambiental!
          </p>
          <Link to="/meus-quizzes" className={styles.ctaBtn}>
            Ir para os Quizzes <ArrowRight size={18} />
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}