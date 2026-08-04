from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from presentation.dependencias import get_registrar_presenca_uc
from application.use_cases.registrar_presenca_presencial import RegistrarPresencaPresencialUseCase
from domain.exceptions import ParticipacaoDuplicadaError, ColaboradorNaoEncontradoError

router = APIRouter(prefix="/recepcao", tags=["Recepção Presencial"])

# DTO (Data Transfer Object) - Define como o Front-end deve enviar os dados
class RegistroPresencaRequest(BaseModel):
    cpf: str
    dia_sipat_id: int

@router.post("/registrar")
def registrar_presenca(
    request: RegistroPresencaRequest,
    use_case: RegistrarPresencaPresencialUseCase = Depends(get_registrar_presenca_uc)
):
    """
    Registra a presença física do colaborador e gera o Número da Sorte.
    """
    try:
        numero_sorte = use_case.executar(request.cpf, request.dia_sipat_id)
        
        return {
            "mensagem": "Presença registrada com sucesso.",
            "numero_sorte": numero_sorte.numero
        }
        
    except ColaboradorNaoEncontradoError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ParticipacaoDuplicadaError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")