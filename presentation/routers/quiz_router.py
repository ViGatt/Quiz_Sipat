from fastapi import APIRouter, Depends, HTTPException
from application.use_cases.listar_quizzes import ListarQuizzesUseCase
from pydantic import BaseModel
from typing import List, Optional
import time
from datetime import datetime
from presentation.dependencias import (
    get_iniciar_quiz_uc, 
    get_submeter_resposta_uc, 
    get_listar_quizzes_uc,
    get_quiz_repo
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

router = APIRouter(prefix="/quiz", tags=["Quiz Online"])

class IniciarQuizRequest(BaseModel):
    cpf: str
    dia_sipat_id: int

class SubmeterRespostaRequest(BaseModel):
    cpf: str
    dia_sipat_id: int
    questao_id: str
    alternativa_escolhida: str

class AtualizarQuizRequest(BaseModel):
    tema: str
    descricao: str
    link_youtube_palestra: str

class NovaQuestaoRequest(BaseModel):
    texto: str
    opcoes: dict
    resposta_correta: str

class CriarQuizRequest(BaseModel):
    tema: str
    descricao: str
    tempo_limite: int = 15
    status: str = "Publicado"
    data_liberacao: Optional[datetime] = None
    questoes: List[NovaQuestaoRequest]

@router.get("/")
def listar_quizzes(use_case: ListarQuizzesUseCase = Depends(get_listar_quizzes_uc)):
    # Amortecedor para Socket (10035) e Clock Drift (PGRST303)
    for tentativa in range(3):
        try:
            resultado = use_case.executar()
            return {"quizzes": resultado}
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str or "future" in erro_str) and tentativa < 2:
                time.sleep(1) # Espera 1 segundo para sincronizar e tenta de novo
                continue
            
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao buscar quizzes: {erro_str}")

@router.post("/")
def criar_novo_quiz(request: CriarQuizRequest, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
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

@router.get("/{quiz_id}")
def obter_quiz(quiz_id: int, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    quiz = repo.obter_por_id(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz não encontrado")
    return quiz

@router.get("/concluidos/{cpf}")
def listar_quizzes_concluidos(cpf: str, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    # Amortecedor
    for tentativa in range(3):
        try:
            dias_concluidos = repo.obter_dias_concluidos(cpf)
            return {"concluidos": dias_concluidos}
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str or "future" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
            
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao buscar status: {erro_str}")

@router.put("/{quiz_id}")
def atualizar_quiz_admin(quiz_id: int, request: AtualizarQuizRequest, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    sucesso = repo.atualizar_quiz(
        quiz_id=quiz_id,
        tema=request.tema,
        descricao=request.descricao,
        link_youtube_palestra=request.link_youtube_palestra
    )
    if not sucesso:
        raise HTTPException(status_code=400, detail="Erro ao atualizar o quiz no banco de dados.")
    return {"message": "Quiz atualizado com sucesso!"}

@router.post("/iniciar")
def iniciar_quiz(request: IniciarQuizRequest, use_case: IniciarQuizOnlineUseCase = Depends(get_iniciar_quiz_uc)):
    # Amortecedor
    for tentativa in range(3):
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
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str or "future" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
                
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro interno: {erro_str}")

@router.post("/responder")
def responder_questao(request: SubmeterRespostaRequest, use_case: SubmeterRespostaUseCase = Depends(get_submeter_resposta_uc)):
    # Amortecedor
    for tentativa in range(3):
        try:
            resultado = use_case.executar(
                request.cpf, request.dia_sipat_id, request.questao_id, request.alternativa_escolhida
            )
            return resultado
        except ParticipacaoNaoEncontradaError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except RegraNegocioError as e:
            raise HTTPException(status_code=400, detail=str(e)) 
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str or "future" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
                
            raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@router.delete("/{quiz_id}")
def deletar_quiz(quiz_id: int, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    sucesso = repo.excluir_quiz_definitivo(quiz_id)
    if not sucesso:
        raise HTTPException(
            status_code=500, 
            detail="Erro ao excluir. (Dica: verifique se as tabelas filhas no Supabase possuem 'ON DELETE CASCADE')."
        )
    return {"message": "Quiz e dados de teste excluídos permanentemente!"}