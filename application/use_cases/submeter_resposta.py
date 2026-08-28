from domain.exceptions import (
    RegraNegocioError, 
    ParticipacaoNaoEncontradaError
)
from domain.repositories.participacao_repository import ParticipacaoRepository
from domain.repositories.quiz_repository import QuizRepository
from domain.entities.numero_sorte import NumeroSorte
import uuid

class SubmeterRespostaUseCase:
    def __init__(
        self, 
        participacao_repo: ParticipacaoRepository,
        quiz_repo: QuizRepository
    ):
        self.participacao_repo = participacao_repo
        self.quiz_repo = quiz_repo

    def executar(self, cpf: str, dia_sipat_id: int, questao_id: str, alternativa_escolhida: str) -> dict:
        participacao = self.participacao_repo.buscar_por_cpf_e_dia(cpf, dia_sipat_id)
        if not participacao or participacao.modalidade != "ONLINE":
            raise ParticipacaoNaoEncontradaError("Sessão de quiz inválida ou acesso bloqueado presencialmente.")

        if self.participacao_repo.questao_ja_respondida(participacao.id, questao_id):
            raise RegraNegocioError("Você já respondeu a esta questão. Não é permitido alterar a resposta.")

        questao = self.quiz_repo.buscar_questao(questao_id)
        acertou = (questao.resposta_correta == alternativa_escolhida)

        self.participacao_repo.salvar_resposta(participacao.id, questao_id, alternativa_escolhida, acertou)

        # 5. LÓGICA DINÂMICA (À PROVA DE FALHAS)
        respostas_dadas = self.participacao_repo.contar_respostas_dadas(participacao.id)
        questoes_do_quiz = self.quiz_repo.buscar_questoes_por_quiz(dia_sipat_id)
        total_questoes = len(questoes_do_quiz)
        
        quiz_finalizado = (respostas_dadas >= total_questoes)
        numero_sorte = None

        if quiz_finalizado:
            total_acertos = self.participacao_repo.contar_acertos(participacao.id)
            quiz_obj = self.quiz_repo.buscar_quiz_por_dia(dia_sipat_id)
            
            # Garantia 100% de que a nota de corte é interpretada como número
            pontuacao_aprovacao = getattr(quiz_obj, 'pontuacao_aprovacao', 70)
            if pontuacao_aprovacao is None:
                pontuacao_aprovacao = 70
            pontuacao_aprovacao = int(pontuacao_aprovacao)
            
            if total_questoes > 0:
                percentual_acerto = (total_acertos / total_questoes) * 100
                
                # Se passou da nota de corte, nós mesmos geramos a entidade aqui sem depender de outros lugares
                if percentual_acerto >= pontuacao_aprovacao:
                    num_str = f"SPT-{cpf[-4:]}-{dia_sipat_id}{total_acertos}"
                    numero_sorte = NumeroSorte(
                        id=uuid.uuid4(),
                        colaborador_id=participacao.colaborador_id,
                        dia_sipat_id=dia_sipat_id,
                        numero=num_str
                    )
                    self.participacao_repo.salvar_numero_sorte(numero_sorte)

        return {
            "acertou": acertou,
            "alternativa_correta": questao.resposta_correta if not acertou else None,
            "quiz_finalizado": quiz_finalizado,
            "numero_sorte": numero_sorte.numero if numero_sorte else None
        }