from domain.exceptions import (
    RegraNegocioError, 
    ParticipacaoNaoEncontradaError
)
from domain.repositories.participacao_repository import ParticipacaoRepository
from domain.repositories.quiz_repository import QuizRepository
from domain.entities.numero_sorte import NumeroSorte
import uuid
import random

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
            raise ParticipacaoNaoEncontradaError("Sessão de quiz inválida.")

        if self.participacao_repo.questao_ja_respondida(participacao.id, questao_id):
            raise RegraNegocioError("Você já respondeu a esta questão.")

        questao = self.quiz_repo.buscar_questao(questao_id)
        acertou = (questao.resposta_correta == alternativa_escolhida)

        # 1. Contamos o estado ANTES de salvar (Blindagem contra lentidão/lag do banco)
        respostas_dadas_antes = self.participacao_repo.contar_respostas_dadas(participacao.id)
        acertos_antes = self.participacao_repo.contar_acertos(participacao.id)

        # 2. Salva a resposta no banco
        self.participacao_repo.salvar_resposta(participacao.id, questao_id, alternativa_escolhida, acertou)

        # 3. Calculamos o estado ATUAL manualmente no Python (100% preciso)
        respostas_dadas = respostas_dadas_antes + 1
        total_acertos = acertos_antes + (1 if acertou else 0)

        questoes_do_quiz = self.quiz_repo.buscar_questoes_por_quiz(dia_sipat_id)
        total_questoes = len(questoes_do_quiz)
        
        quiz_finalizado = (respostas_dadas >= total_questoes)
        numero_sorte = None

        if quiz_finalizado:
            quiz_obj = self.quiz_repo.buscar_quiz_por_dia(dia_sipat_id)
            
            # Garantir que a nota de corte é lida com segurança
            try:
                pont_aprovacao = int(getattr(quiz_obj, 'pontuacao_aprovacao', 70))
            except:
                pont_aprovacao = 70
                
            if total_questoes > 0:
                percentual_acerto = (total_acertos / total_questoes) * 100
                
                if percentual_acerto >= pont_aprovacao:
                    # Adicionamos 2 dígitos aleatórios para NUNCA dar colisão no banco 
                    # caso você apague a participação e refaça o teste.
                    codigo_extra = str(random.randint(10, 99))
                    num_str = f"SPT-{cpf[-4:]}-{dia_sipat_id}{total_acertos}-{codigo_extra}"
                    
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