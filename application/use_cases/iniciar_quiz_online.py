import random  # <-- NOVO IMPORT NECESSÁRIO
from domain.exceptions import (
    ColaboradorNaoEncontradoError,
    AcessoBloqueadoError,
    ParticipacaoDuplicadaError
)
from domain.repositories.participacao_repository import ParticipacaoRepository
from domain.repositories.colaborador_repository import ColaboradorRepository
from domain.repositories.quiz_repository import QuizRepository
from domain.entities.participacao import Participacao
import uuid
from datetime import datetime, timezone

class IniciarQuizOnlineUseCase:
    def __init__(
        self,
        participacao_repo: ParticipacaoRepository,
        colaborador_repo: ColaboradorRepository,
        quiz_repo: QuizRepository
    ):
        self.participacao_repo = participacao_repo
        self.colaborador_repo = colaborador_repo
        self.quiz_repo = quiz_repo

    def executar(self, cpf: str, dia_sipat_id: int) -> dict:
        # 1. Validar se o colaborador existe
        colaborador = self.colaborador_repo.buscar_por_cpf(cpf)
        if not colaborador:
            raise ColaboradorNaoEncontradoError("CPF não cadastrado na base de colaboradores.")

        # 2. Buscar o Quiz e aplicar a Trava de Agendamento ANTES de criar participação
        quiz_do_dia = self.quiz_repo.buscar_quiz_por_dia(dia_sipat_id)
        if not quiz_do_dia:
            raise Exception("Quiz não encontrado.")
            
        # --- TRAVA DE SEGURANÇA (AGENDAMENTO) ---
        status_quiz = getattr(quiz_do_dia, 'status', 'Publicado')
        data_liberacao_str = getattr(quiz_do_dia, 'data_liberacao', None)
        
        if status_quiz == 'Programado' and data_liberacao_str:
            data_liberacao = datetime.fromisoformat(data_liberacao_str.replace('Z', '+00:00'))
            agora = datetime.now(timezone.utc)
            
            if agora < data_liberacao:
                data_formatada = data_liberacao.strftime("%d/%m/%Y às %H:%M")
                raise AcessoBloqueadoError(f"Acesso antecipado bloqueado. Este quiz só estará disponível a partir de {data_formatada}.")
        # ---------------------------------------------

        # 3. Verificar bloqueios cruzados e tentativas (Regra de Ouro)
        participacao_existente = self.participacao_repo.buscar_por_colaborador_e_dia(
            colaborador.id, dia_sipat_id
        )
        
        if participacao_existente:
            if participacao_existente.modalidade == "PRESENCIAL":
                raise AcessoBloqueadoError(
                    "Acesso bloqueado. Você já registrou presença física na SIPAT hoje."
                )
            else:
                raise ParticipacaoDuplicadaError(
                    "Você já iniciou ou concluiu o Quiz Online de hoje. É permitida apenas uma tentativa."
                )

        # 4. Criar a sessão de participação ONLINE
        nova_participacao = Participacao(
            id=uuid.uuid4(),
            colaborador_id=colaborador.id,
            dia_sipat_id=dia_sipat_id,
            modalidade="ONLINE"
        )
        self.participacao_repo.salvar(nova_participacao)

        # 5. Buscar as perguntas vinculadas ao Quiz
        questoes = self.quiz_repo.buscar_questoes_por_quiz(quiz_do_dia.id)

        # --- NOVO: ALEATORIZAR QUESTÕES ---
        # Verifica no banco se a opção de aleatorizar as perguntas está ligada
        if getattr(quiz_do_dia, 'aleatorizar_questoes', True):
            random.shuffle(questoes)
        # ----------------------------------

        # 6. Retornar a estrutura inicial para o Front-end
        # Injetamos os feedbacks aqui para o Front-end exibir após a resposta do usuário
        questoes_sanitizadas = [
            {
                "id": q.id,
                "texto": q.texto,
                "opcoes": q.opcoes,
                "feedback_correto": getattr(q, 'feedback_correto', None),
                "feedback_incorreto": getattr(q, 'feedback_incorreto', None)
            } for q in questoes
        ]

        return {
            "participacao_id": nova_participacao.id,
            "colaborador_nome": colaborador.nome,
            "link_youtube": getattr(quiz_do_dia, 'link_youtube_palestra', ""),
            
            # --- NOVAS CONFIGURAÇÕES ENVIADAS AO FRONT-END ---
            "pontuacao_aprovacao": getattr(quiz_do_dia, 'pontuacao_aprovacao', 70),
            "aleatorizar_respostas": getattr(quiz_do_dia, 'aleatorizar_respostas', True),
            "resultado_imediato": getattr(quiz_do_dia, 'resultado_imediato', True),
            
            "questoes": questoes_sanitizadas
        }