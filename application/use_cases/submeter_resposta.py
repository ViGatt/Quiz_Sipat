from domain.exceptions import (
    RegraNegocioError, 
    ParticipacaoNaoEncontradaError
)
from domain.repositories.participacao_repository import ParticipacaoRepository
from domain.repositories.quiz_repository import QuizRepository

class SubmeterRespostaUseCase:
    def __init__(
        self, 
        participacao_repo: ParticipacaoRepository,
        quiz_repo: QuizRepository
    ):
        self.participacao_repo = participacao_repo
        self.quiz_repo = quiz_repo

    def executar(self, cpf: str, dia_sipat_id: int, questao_id: str, alternativa_escolhida: str) -> dict:
        # 1. Recuperar participação iniciada
        participacao = self.participacao_repo.buscar_por_cpf_e_dia(cpf, dia_sipat_id)
        if not participacao or participacao.modalidade != "ONLINE":
            raise ParticipacaoNaoEncontradaError("Sessão de quiz inválida ou acesso bloqueado presencialmente.")

        # 2. Impedir retorno a perguntas já respondidas
        if self.participacao_repo.questao_ja_respondida(participacao.id, questao_id):
            raise RegraNegocioError("Você já respondeu a esta questão. Não é permitido alterar a resposta.")

        # 3. Validar a resposta com o gabarito
        questao = self.quiz_repo.buscar_questao(questao_id)
        acertou = (questao.resposta_correta == alternativa_escolhida)

        # 4. Registrar a resposta
        self.participacao_repo.salvar_resposta(participacao.id, questao_id, alternativa_escolhida, acertou)

        # 5. Lógica de conclusão e geração de Número da Sorte
        respostas_dadas = self.participacao_repo.contar_respostas_dadas(participacao.id)
        numero_sorte = None

        # Se for a 15ª questão, verificamos se tem direito ao número da sorte
        if respostas_dadas == 15:
            total_acertos = self.participacao_repo.contar_acertos(participacao.id)
            if total_acertos >= 8:
                numero_sorte = participacao.gerar_numero_sorte()
                self.participacao_repo.salvar_numero_sorte(numero_sorte)

        # 6. Retornar feedback imediato 
        return {
            "acertou": acertou,
            "alternativa_correta": questao.resposta_correta if not acertou else None,
            "quiz_finalizado": respostas_dadas == 15,
            "numero_sorte": numero_sorte.numero if numero_sorte else None
        }