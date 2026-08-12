from fastapi import APIRouter, Depends, HTTPException
from application.use_cases.listar_quizzes import ListarQuizzesUseCase
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from presentation.dependencias import (
    get_iniciar_quiz_uc, 
    get_submeter_resposta_uc, 
    get_listar_quizzes_uc,
    get_quiz_repo # <-- Importamos o getter do repositório
)
from infrastructure.database.supabase_repository import SupabaseQuizRepository
from application.use_cases.iniciar_quiz_online import IniciarQuizOnlineUseCase
from application.use_cases.submeter_resposta import SubmeterRespostaUseCase
from domain.exceptions import (
    ColaboradorNaoEncontradoError,
    AcessoBloqueadoError,
    ParticipacaoDuplicadaError,
    ParticipacaoNaoEncontradaError,
    RegraNegocioError
)
from typing import List

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

    # DTO para atualizar o quiz (Admin)
class AtualizarQuizRequest(BaseModel):
    tema: str
    descricao: str
    link_youtube_palestra: str

from typing import List

# DTO para a Questão que vem do Front-end
class NovaQuestaoRequest(BaseModel):
    texto: str
    opcoes: dict
    resposta_correta: str

# DTO principal para a Criação do Quiz (ADICIONAMOS OS NOVOS CAMPOS AQUI)
class CriarQuizRequest(BaseModel):
    tema: str
    descricao: str
    tempo_limite: int = 15
    status: str = "Publicado"
    data_liberacao: Optional[datetime] = None
    questoes: List[NovaQuestaoRequest]

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

# -----------------------------------------------------------------
# NOVA ROTA POST - Criação de Novo Quiz
# -----------------------------------------------------------------
@router.post("/")
def criar_novo_quiz(request: CriarQuizRequest, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    """
    Cria um novo dia de SIPAT e vincula as questões a ele.
    """
    # AGORA ENVIAMOS OS NOVOS CAMPOS PARA O REPOSITÓRIO
    sucesso = repo.criar_quiz_com_questoes(
        tema=request.tema,
        descricao=request.descricao,
        tempo_limite=request.tempo_limite,
        status=request.status,
        data_liberacao=request.data_liberacao,
        questoes=request.questoes
    )
    
    if not sucesso:
        raise HTTPException(status_code=500, detail="Erro ao salvar o Quiz no banco de dados.")
        
    return {"message": "Quiz criado com sucesso!"}

# -----------------------------------------------------------------
# 1. ROTA GET - Disparada quando o usuário ABRE a tela
# -----------------------------------------------------------------
@router.get("/{quiz_id}")
def obter_quiz(quiz_id: int, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    """
    Retorna os detalhes de um quiz específico junto com suas opções de questões.
    """
    quiz = repo.obter_por_id(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz

@router.get("/concluidos/{cpf}")
def listar_quizzes_concluidos(cpf: str, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    """
    Retorna os IDs dos quizzes que o usuário já respondeu ou tem presença.
    """
    try:
        dias_concluidos = repo.obter_dias_concluidos(cpf)
        return {"concluidos": dias_concluidos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar status: {str(e)}")

# -----------------------------------------------------------------
# 2. ROTA PUT - Disparada quando o Admin clica em SALVAR ALTERAÇÕES
# -----------------------------------------------------------------
@router.put("/{quiz_id}")
def atualizar_quiz_admin(
    quiz_id: int,
    request: AtualizarQuizRequest,
    repo: SupabaseQuizRepository = Depends(get_quiz_repo)
):
    """
    Atualiza as informações de um quiz (tema, descrição e vídeo) - Ação de Administrador.
    """
    sucesso = repo.atualizar_quiz(
        quiz_id=quiz_id,
        tema=request.tema,
        descricao=request.descricao,
        link_youtube_palestra=request.link_youtube_palestra
    )
    
    if not sucesso:
        raise HTTPException(status_code=400, detail="Erro ao atualizar o quiz no banco de dados.")
    
    return {"message": "Quiz atualizado com sucesso!"}
# ---------------------------------

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