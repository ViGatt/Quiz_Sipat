from fastapi import APIRouter, Depends, HTTPException
from application.use_cases.listar_quizzes import ListarQuizzesUseCase
from pydantic import BaseModel
from presentation.dependencias import get_iniciar_quiz_uc, get_submeter_resposta_uc, get_listar_quizzes_uc
from application.use_cases.iniciar_quiz_online import IniciarQuizOnlineUseCase
from application.use_cases.submeter_resposta import SubmeterRespostaUseCase
from domain.exceptions import (
    ColaboradorNaoEncontradoError,
    AcessoBloqueadoError,
    ParticipacaoDuplicadaError,
    ParticipacaoNaoEncontradaError,
    RegraNegocioError
)

router = APIRouter(prefix="/quiz", tags=["Quiz Online"])

# DTO para iniciar o quiz
class IniciarQuizRequest(BaseModel):
    cpf: str
    dia_sipat_id: int

# DTO para submeter uma resposta
class SubmeterRespostaRequest(BaseModel):
    cpf: str
    dia_sipat_id: int
    questao_id: str
    alternativa_escolhida: str

@router.get("/")
def listar_quizzes(
    use_case: ListarQuizzesUseCase = Depends(get_listar_quizzes_uc)
):
    """
    Retorna a lista de todos os quizzes (dias da SIPAT) disponíveis no banco de dados.
    """
    try:
        resultado = use_case.executar()
        return {"quizzes": resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar quizzes: {str(e)}")

@router.post("/iniciar")
def iniciar_quiz(
    request: IniciarQuizRequest,
    use_case: IniciarQuizOnlineUseCase = Depends(get_iniciar_quiz_uc)
):
    """
    Inicia a sessão do Quiz Online, validando bloqueios e retornando as questões do dia.
    """
    try:
        resultado = use_case.executar(request.cpf, request.dia_sipat_id)
        return resultado
        
    except ColaboradorNaoEncontradoError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AcessoBloqueadoError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ParticipacaoDuplicadaError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@router.get("/")
def listar_quizzes(
    # Aqui você pode injetar um repositório genérico ou um caso de uso simples de leitura
    # Exemplo: repo: QuizRepository = Depends(get_quiz_repository)
):
    """
    Retorna a lista de todos os quizzes (dias da SIPAT) disponíveis com suas descrições.
    """
    # Como não tenho a sua injeção exata de repositório para listar os dias aqui, 
    # a lógica base seria pedir ao repositório para fazer um SELECT na tabela dias_sipat.
    # resultado = repo.listar_dias_sipat()
    # return resultado
    pass

@router.post("/responder")
def responder_questao(
    request: SubmeterRespostaRequest,
    use_case: SubmeterRespostaUseCase = Depends(get_submeter_resposta_uc)
):
    """
    Submete a resposta de uma questão, retorna feedback imediato e gera o Número da Sorte se finalizado com sucesso.
    """
    try:
        resultado = use_case.executar(
            request.cpf, 
            request.dia_sipat_id, 
            request.questao_id, 
            request.alternativa_escolhida
        )
        return resultado
        
    except ParticipacaoNaoEncontradaError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RegraNegocioError as e:
        # Retorna erro 400 se o usuário tentar responder uma questão já respondida
        raise HTTPException(status_code=400, detail=str(e)) 
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

        