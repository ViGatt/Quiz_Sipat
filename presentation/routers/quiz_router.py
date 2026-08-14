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

# DTO para a Questão que vem do Front-end
class NovaQuestaoRequest(BaseModel):
    texto: str
    opcoes: dict
    resposta_correta: str

# DTO principal para a Criação do Quiz
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
    # Tenta até 3 vezes caso dê o erro de socket do Windows
    for tentativa in range(3):
        try:
            resultado = use_case.executar()
            return {"quizzes": resultado}
        except Exception as e:
            if "10035" in str(e) and tentativa < 2:
                time.sleep(0.2) # Espera 200 milissegundos e tenta de novo
                continue
            
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao buscar quizzes: {str(e)}")

# -----------------------------------------------------------------
# NOVA ROTA POST - Criação de Novo Quiz
# -----------------------------------------------------------------
@router.post("/")
def criar_novo_quiz(request: CriarQuizRequest, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    """
    Cria um novo dia de SIPAT e vincula as questões a ele.
    """
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
    # Tenta até 3 vezes caso dê o erro de socket do Windows
    for tentativa in range(3):
        try:
            dias_concluidos = repo.obter_dias_concluidos(cpf)
            return {"concluidos": dias_concluidos}
        except Exception as e:
            if "10035" in str(e) and tentativa < 2:
                time.sleep(0.2) # Espera 200 milissegundos e tenta de novo
                continue
            
            import traceback
            traceback.print_exc()
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
    # --- AQUI ESTÁ A BLINDAGEM DO POST INICIAR ---
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
            if "10035" in str(e) and tentativa < 2:
                time.sleep(0.3)
                continue
                
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.post("/responder")
def responder_questao(
    request: SubmeterRespostaRequest,
    use_case: SubmeterRespostaUseCase = Depends(get_submeter_resposta_uc)
):
    """
    Submete a resposta de uma questão, retorna feedback imediato e gera o Número da Sorte se finalizado com sucesso.
    """
    # --- AQUI ESTÁ A BLINDAGEM DO POST RESPONDER ---
    for tentativa in range(3):
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
            raise HTTPException(status_code=400, detail=str(e)) 
        except Exception as e:
            if "10035" in str(e) and tentativa < 2:
                time.sleep(0.3)
                continue
                
            raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

@router.delete("/{quiz_id}")
def deletar_quiz(quiz_id: int, repo: SupabaseQuizRepository = Depends(get_quiz_repo)):
    """
    Exclui um quiz de forma definitiva para não interferir nas métricas.
    """
    sucesso = repo.excluir_quiz_definitivo(quiz_id)
    if not sucesso:
        raise HTTPException(
            status_code=500, 
            detail="Erro ao excluir. (Dica: verifique se as tabelas filhas no Supabase possuem 'ON DELETE CASCADE')."
        )
    
    return {"message": "Quiz e dados de teste excluídos permanentemente!"}