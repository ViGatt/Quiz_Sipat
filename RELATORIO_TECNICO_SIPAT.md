# Relatório Técnico — Plataforma Digital de Quiz da SIPAT

**Projeto:** Quiz SIPAT — RIC Ambiental
**Destinatário:** Comissão Interna de Prevenção de Acidentes (CIPA) / Comissão Organizadora da SIPAT
**Responsável técnico:** Vinicius Gatti Rodrigues
**Data:** 09/09/2026

---

## 1. Sumário Executivo

A Plataforma de Quiz da SIPAT é um sistema web desenvolvido para digitalizar o acompanhamento da Semana Interna de Prevenção de Acidentes do Trabalho da RIC Ambiental. O sistema substitui o controle manual de presença e participação por um fluxo digital único, permitindo que colaboradores participem tanto presencialmente (recepção do evento) quanto remotamente (unidades externas), respondendo quizzes diários vinculados às palestras.

O sistema cobre o ciclo completo do evento:

1. **Antes do evento** — importação da base de colaboradores, cadastro das palestras/quizzes e da programação.
2. **Durante o evento** — check-in presencial na recepção, liberação e resposta dos quizzes online, acompanhamento em tempo real pela comissão.
3. **Após o evento** — geração de relatórios consolidados e **sorteio oficial dos números da sorte** distribuídos durante a semana.

---

## 2. Arquitetura Técnica

### 2.1 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.13 + FastAPI |
| Frontend | React 19 + TypeScript + Vite |
| Banco de dados | Supabase (PostgreSQL gerenciado) |
| Autenticação | JWT (JSON Web Token) assinado no backend |
| Armazenamento de arquivos | Supabase Storage (fotos de palestrantes) |
| Hospedagem | Vercel (frontend + funções serverless da API) |

### 2.2 Padrão Arquitetural

O backend segue os princípios de **Domain-Driven Design (DDD)** em camadas, garantindo que as regras de negócio fiquem isoladas de detalhes de banco de dados ou framework web:

```
domain/          → Entidades e regras de negócio puras (Colaborador, Participacao,
                    NumeroSorte, Questao) e contratos de repositório (interfaces)
application/     → Casos de uso que orquestram o fluxo (RegistrarPresenca,
                    SubmeterResposta, GerarRelatorioFinal, etc.)
infrastructure/  → Implementação concreta de acesso ao Supabase
presentation/    → Rotas da API (FastAPI), autenticação e injeção de dependências
```

O fluxo de dependência aponta sempre de fora para dentro: a camada de domínio não conhece o banco de dados nem o framework web, o que facilita manutenção e testes.

### 2.3 Segurança e Controle de Acesso

- Autenticação por **CPF + senha**, com token **JWT** (HS256) emitido no login e enviado em todas as requisições administrativas via cabeçalho `Authorization: Bearer`.
- Rotas administrativas (criação de quiz, importação de RH, relatórios, sorteio, etc.) são protegidas por uma dependência (`exigir_comissao`) que valida o token e o papel do usuário (`is_comissao`), retornando `401`/`403` para acessos não autorizados.
- O frontend nunca consulta diretamente a tabela de colaboradores no Supabase: toda consulta de login passa pelo backend, evitando exposição de dados sensíveis pela chave pública do banco.
- Primeiro acesso do colaborador é autoatendido: o sistema confirma o CPF na base importada do RH e gera a senha inicial automaticamente (4 primeiros dígitos do CPF), exigindo apenas a seleção da unidade de trabalho.

---

## 3. Módulos Funcionais

### 3.1 Gestão de Colaboradores e Recepção (`/recepcao`)

- **Importação em massa via planilha (Excel/CSV):** upload de planilha do RH com normalização automática de cabeçalhos (remove acentuação/caixa), extração dinâmica de colunas opcionais (tipo de trabalhador, admissão, tempo de empresa, nascimento) e gravação via *upsert* (evita duplicidade por CPF).
- **Check-in presencial:** tela dedicada (aba **Participantes**) que lista todos os colaboradores importados, cruzando com as participações do dia para exibir o status (`Pendente`, `Presencial`, `Online`) e permitir o check-in físico com um clique.
- **Geração automática do Número da Sorte** no momento do check-in presencial.
- Busca por nome ou CPF, com paginação da listagem.

### 3.2 Quiz Online

**Criação (comissão):**
- Assistente em etapas (configurações gerais → cadastro de questões) com: tempo limite total, tempo por questão, nota mínima de aprovação (percentual configurável), opções de aleatorização de questões e de alternativas, exibição de resultado imediato, pontuação e *feedback* customizado por questão (acerto/erro).
- Compartilhamento do quiz por link direto ou **QR Code** gerado dinamicamente (com opção de download em PNG).

**Participação (colaborador):**
- Fluxo tipo *game*: tela de instruções, cronômetro por questão, sistema de pontos e feedback imediato a cada resposta.
- **Bloqueio cruzado:** um colaborador que já registrou presença física não pode iniciar o quiz online no mesmo dia (e vice-versa), prevenindo participação duplicada.
- Retomada de tentativa em caso de queda de conexão, sem perder o progresso já registrado.
- Ao final, o colaborador recebe automaticamente o **Número da Sorte** caso atinja a pontuação mínima de aprovação do quiz.

**Acompanhamento (comissão):**
- Tela de detalhes por quiz com métricas em tempo real: total de participantes, taxa de aprovação, tempo médio de conclusão, pontuação média/máxima, desempenho por questão (percentual de acerto) e lista de conclusões recentes com busca.
- Exclusão definitiva de um quiz (e dados vinculados) para limpeza de testes.

### 3.3 Números da Sorte

Regra de negócio central do engajamento da SIPAT — um número da sorte é emitido automaticamente em dois cenários, sem qualquer ação manual da comissão:

| Origem | Condição de emissão | Formato |
|---|---|---|
| Presença física | Check-in confirmado na recepção | `{dia}{aleatório 5 dígitos}` |
| Quiz online | Percentual de acertos ≥ nota de aprovação do quiz | `SPT-{4 últimos dígitos do CPF}-{dia}{acertos}-{código aleatório}` |

Cada número é vinculado ao colaborador e ao dia da SIPAT, persistido na tabela `numeros_sorte` e consultável pelo próprio colaborador em **Meu Desempenho** (pontuação total, elegibilidade e histórico de erros por quiz).

### 3.4 Sorteio Pós-Evento *(módulo novo)*

Módulo dedicado (aba **Sorteio**, abaixo de Participantes) para a comissão realizar o sorteio oficial dos prêmios após a SIPAT, com garantias de idoneidade e auditabilidade:

**Backend (`/sorteio`):**
- `GET /sorteio/participantes` — lista todos os bilhetes (números da sorte) do grupo escolhido, com *flag* de elegibilidade.
- `POST /sorteio/realizar` — sorteia um bilhete elegível usando `secrets.choice` (gerador aleatório criptograficamente seguro, adequado para sorteios), grava o resultado imediatamente no banco e retorna o vencedor.
- `GET /sorteio/vencedores` — histórico completo de sorteios já realizados.
- `DELETE /sorteio/vencedores/{id}` — desfaz um sorteio (ex.: vencedor ausente na hora do prêmio), devolvendo o bilhete ao grupo.

**Regras de negócio:**
- Persistência em tabela dedicada (`sorteios`), garantindo que o sorteio **sobreviva a um refresh de página ou queda de conexão** durante o evento ao vivo.
- Um mesmo bilhete nunca é sorteado duas vezes (restrição de unicidade no banco).
- Opção "impedir que o mesmo colaborador ganhe mais de uma vez": ao ativar, todos os bilhetes de quem já venceu saem do grupo de próximos sorteios, mesmo em dias/categorias diferentes.
- Sorteio pode ser realizado **por dia específico** da SIPAT ou de forma **geral** (somando os números de todos os dias).
- Campo opcional de prêmio associado a cada sorteio realizado.

**Experiência do usuário (frontend):**
- Pop-up dedicado com três fases, pensado para gerar expectativa e clareza durante a apresentação ao vivo:
  1. **Mistério** — animação de suspense com frases variando ("Quem será o sortudo?").
  2. **Roleta** — nomes dos concorrentes elegíveis alternando com desaceleração progressiva (efeito de roda-da-sorte), encerrando exatamente no vencedor já definido pelo backend (o resultado nunca é decidido no navegador, apenas exibido).
  3. **Revelação** — efeito de confete, troféu animado e nome do vencedor em destaque, com opção de pular a animação para agilidade durante o evento.
- Painel de configuração com contadores em tempo real de "bilhetes elegíveis" e "total de bilhetes" do grupo selecionado.
- Histórico de vencedores com opção de desfazer sorteio individual.

### 3.5 Relatórios Gerenciais (`/relatorios`)

- **Dashboard** com indicadores consolidados: total de colaboradores cadastrados, presenciais x online, taxa de engajamento e ranking de participantes por pontuação.
- Relatório consolidado exportável (participação diária, relação de números da sorte, desempenho online) para uso em planilhas/relatórios finais da comissão.
- Métricas detalhadas por quiz individual (ver item 3.2).
- Resumo individual do colaborador (pontuação, respostas erradas com gabarito, números da sorte).

### 3.6 Programação e Eventos

- Página pública de **Programação** com a grade de palestras/eventos da semana.
- Painel administrativo de eventos: cadastro, edição e exclusão de palestras (tema, palestrante, cargo, biografia, horário, local, responsáveis) com **upload de foto do palestrante** (validação de tipo e tamanho de arquivo, armazenamento em bucket público no Supabase Storage).

---

## 4. Fluxo de Dados — Resumo

```
Colaborador chega no evento
        │
        ├── Check-in presencial (recepção) ──► Número da Sorte emitido
        │
        └── Acessa o link/QR do quiz online
                    │
                    ├── Bloqueado se já tem presença registrada no dia
                    │
                    └── Responde ao quiz ──► Aprovado (nota ≥ mínima)?
                                                       │
                                                       └── Sim ──► Número da Sorte emitido

Após o evento
        │
        └── Comissão acessa aba Sorteio ──► Sorteia vencedores por dia ou geral
                                                       │
                                                       └── Resultado persistido e auditável
```

---

## 5. Considerações Finais

O sistema foi construído para operar de forma resiliente durante o evento ao vivo — com proteções contra duplicidade de participação, contra perda de progresso em caso de queda de conexão, e contra perda do resultado do sorteio em caso de refresh ou instabilidade de rede. Todas as funcionalidades descritas neste relatório foram implementadas, testadas ponta a ponta (incluindo testes reais contra a base de dados de produção) e estão disponíveis em produção para uso da comissão.

---

*Relatório gerado para fins de documentação técnica e prestação de contas à comissão organizadora da SIPAT.*
