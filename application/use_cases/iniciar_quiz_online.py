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

        # --- TRAVA DE VÍDEO (evita iniciar o quiz antes da palestra estar disponível) ---
        link_video = getattr(quiz_do_dia, 'link_youtube_palestra', None)
        if not link_video or not link_video.strip():
            raise AcessoBloqueadoError(
                "O vídeo da palestra deste dia ainda não foi disponibilizado. Aguarde a publicação para iniciar o quiz."
            )
        # ---------------------------------------------------------------------------

        # 3. Verificar bloqueios cruzados e tentativas (Regra de Ouro)
        participacao_existente = self.participacao_repo.buscar_por_colaborador_e_dia(
            colaborador.id, dia_sipat_id
        )

        todas_questoes = self.quiz_repo.buscar_questoes_por_quiz(dia_sipat_id)
        total_questoes = len(todas_questoes)

        if participacao_existente:
            if participacao_existente.modalidade == "PRESENCIAL":
                raise AcessoBloqueadoError(
                    "Acesso bloqueado. Você já registrou presença física na SIPAT hoje."
                )

            # --- RETOMADA: uma queda de conexão não pode travar o colaborador pro dia todo ---
            # Só permite retomar se ainda sobrar questão para responder E o jogador ainda
            # tiver vidas. Se já respondeu tudo ou já zerou as vidas, a tentativa acabou de
            # verdade e cai no bloqueio de sempre.
            respostas_dadas = self.participacao_repo.contar_respostas_dadas(participacao_existente.id)
            acertos = self.participacao_repo.contar_acertos(participacao_existente.id)
            erros = respostas_dadas - acertos
            vidas_restantes = max(0, 3 - erros)

            quiz_ja_encerrado = respostas_dadas >= total_questoes or vidas_restantes <= 0

            if quiz_ja_encerrado:
                raise ParticipacaoDuplicadaError(
                    "Você já iniciou ou concluiu o Quiz Online de hoje. É permitida apenas uma tentativa."
                )

            ids_respondidas = set(self.participacao_repo.listar_questoes_respondidas(participacao_existente.id))
            questoes_restantes = [q for q in todas_questoes if q.id not in ids_respondidas]

            if getattr(quiz_do_dia, 'aleatorizar_questoes', True):
                random.shuffle(questoes_restantes)

            questoes_sanitizadas = self._sanitizar_questoes(questoes_restantes)

            return {
                **self._dados_config_quiz(quiz_do_dia, colaborador),
                "participacao_id": participacao_existente.id,
                "questoes": questoes_sanitizadas,
                "total_questoes": total_questoes,
                "retomando": True,
                "pontos_acumulados": self.participacao_repo.somar_pontos(participacao_existente.id),
                "acertos_acumulados": acertos,
                "vidas_restantes": vidas_restantes,
            }

        # 4. Criar a sessão de participação ONLINE
        nova_participacao = Participacao(
            id=uuid.uuid4(),
            colaborador_id=colaborador.id,
            dia_sipat_id=dia_sipat_id,
            modalidade="ONLINE"
        )
        self.participacao_repo.salvar(nova_participacao)

        # 5. Aleatorizar questões, se configurado
        questoes = list(todas_questoes)
        if getattr(quiz_do_dia, 'aleatorizar_questoes', True):
            random.shuffle(questoes)

        # 6. Retornar a estrutura inicial para o Front-end
        questoes_sanitizadas = self._sanitizar_questoes(questoes)

        return {
            **self._dados_config_quiz(quiz_do_dia, colaborador),
            "participacao_id": nova_participacao.id,
            "questoes": questoes_sanitizadas,
            "total_questoes": total_questoes,
            "retomando": False,
        }

    def _dados_config_quiz(self, quiz_do_dia, colaborador) -> dict:
        return {
            "colaborador_nome": colaborador.nome,
            "link_youtube": getattr(quiz_do_dia, 'link_youtube_palestra', ""),
            "pontuacao_aprovacao": getattr(quiz_do_dia, 'pontuacao_aprovacao', 70),
            "aleatorizar_respostas": getattr(quiz_do_dia, 'aleatorizar_respostas', True),
            "resultado_imediato": getattr(quiz_do_dia, 'resultado_imediato', True),
            "tempo_por_questao": getattr(quiz_do_dia, 'tempo_por_questao', 60),
        }

    def _sanitizar_questoes(self, questoes: list) -> list[dict]:
        # Injetamos os feedbacks aqui para o Front-end exibir após a resposta do usuário
        return [
            {
                "id": q.id,
                "texto": q.texto,
                "opcoes": q.opcoes,
                "pontos": getattr(q, 'pontos', 10),
                "feedback_correto": getattr(q, 'feedback_correto', None),
                "feedback_incorreto": getattr(q, 'feedback_incorreto', None)
            } for q in questoes
        ]