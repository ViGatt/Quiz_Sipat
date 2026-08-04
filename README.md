# Plataforma de Quiz - SIPAT RIC Ambiental

## Descrição
Plataforma digital de Quiz desenvolvida para a Semana Interna de Prevenção de Acidentes do Trabalho (SIPAT) da RIC Ambiental. O sistema tem como objetivo ampliar o acesso aos conteúdos das palestras, estimular o engajamento dos colaboradores e viabilizar a participação remota daqueles que atuam em unidades externas.

## Arquitetura e Tecnologias
O projeto foi desenhado utilizando os princípios de **Domain-Driven Design (DDD)** para garantir o isolamento e a proteção das regras de negócio. 

As principais tecnologias adotadas incluem:
* **Linguagem:** Python 
* **Banco de Dados e Autenticação:** Supabase (PostgreSQL) 

---

## Estrutura de Diretórios
O fluxo de dependência ocorre de fora para dentro, garantindo que o Domínio seja independente de frameworks e bancos de dados:

* **domain/:** O coração do sistema. Contém as entidades (Participacao, Colaborador, Questao), regras de ouro e interfaces (repositórios).
* **application/:** Camada de orquestração. Contém os Casos de Uso que ditam o fluxo das operações (ex: Registrar Presença, Submeter Resposta).
* **infrastructure/:** Camada de integração externa. Contém a comunicação direta com o Supabase utilizando os contratos definidos no domínio.
* **presentation/:** Porta de entrada da aplicação. Gerencia as rotas da API e a injeção de dependências.

---

## Principais Funcionalidades
* **Controle de Acesso Integrado:** Tela única com validação via CPF, garantindo que cada colaborador tenha apenas uma participação válida por dia.
* **Bloqueio Cruzado:** Integração em tempo real que bloqueia o acesso ao Quiz Online caso o colaborador já tenha presença registrada no evento físico.
* **Motor de Quiz:** Formulário diário com 15 questões, fornecendo feedback imediato por resposta, sem permitir o retorno a perguntas anteriores ou novas tentativas.
* **Geração de Números da Sorte:** Emissão automática vinculada ao registro presencial ou condicionada à aprovação no Quiz Online (mínimo de 8 acertos).