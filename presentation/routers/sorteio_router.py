from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import time

from presentation.dependencias import get_sorteio_repo
from infrastructure.database.supabase_repository import SupabaseSorteioRepository
from presentation.auth_utils import exigir_comissao
from domain.exceptions import SorteioSemParticipantesError, RegraNegocioError

router = APIRouter(prefix="/sorteio", tags=["Sorteio Pós-Evento"])


class RealizarSorteioRequest(BaseModel):
    dia_sipat_id: Optional[int] = None
    premio: Optional[str] = None
    impedir_repeticao: bool = True


@router.get("/participantes")
def listar_participantes(
    dia_sipat_id: Optional[int] = None,
    repo: SupabaseSorteioRepository = Depends(get_sorteio_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    """
    Lista todos os bilhetes (números da sorte) gerados, com uma flag indicando
    se cada um ainda está elegível para o sorteio. Usado para exibir o total de
    concorrentes na tela e para conferência manual antes de sortear.
    """
    for tentativa in range(3):
        try:
            return {"participantes": repo.listar_participantes_sorteio(dia_sipat_id)}
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
            raise HTTPException(status_code=500, detail=f"Erro ao buscar participantes do sorteio: {erro_str}")


@router.get("/vencedores")
def listar_vencedores(
    dia_sipat_id: Optional[int] = None,
    repo: SupabaseSorteioRepository = Depends(get_sorteio_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    """Histórico de vencedores já sorteados (persistido, sobrevive a refresh)."""
    for tentativa in range(3):
        try:
            return {"vencedores": repo.listar_vencedores(dia_sipat_id)}
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
            raise HTTPException(status_code=500, detail=f"Erro ao buscar vencedores: {erro_str}")


@router.post("/realizar")
def realizar_sorteio(
    request: RealizarSorteioRequest,
    repo: SupabaseSorteioRepository = Depends(get_sorteio_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    """
    Sorteia aleatoriamente um bilhete elegível dentro do grupo escolhido
    (um dia específico ou todos os dias, quando dia_sipat_id não é enviado)
    e grava o resultado imediatamente no banco.
    """
    try:
        vencedor = repo.realizar_sorteio(
            dia_sipat_id=request.dia_sipat_id,
            premio=request.premio,
            impedir_repeticao=request.impedir_repeticao,
        )
        return vencedor
    except SorteioSemParticipantesError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except RegraNegocioError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao realizar o sorteio: {str(e)}")


@router.delete("/vencedores/{sorteio_id}")
def desfazer_sorteio(
    sorteio_id: str,
    repo: SupabaseSorteioRepository = Depends(get_sorteio_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    """
    Remove um vencedor sorteado (ex.: colaborador não estava presente na hora
    do prêmio), devolvendo o bilhete para o grupo de elegíveis.
    """
    sucesso = repo.remover_vencedor(sorteio_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Vencedor não encontrado.")
    return {"message": "Sorteio desfeito. O bilhete voltou a concorrer."}
