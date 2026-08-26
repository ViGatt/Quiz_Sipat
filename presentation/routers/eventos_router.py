from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import time
from presentation.dependencias import get_evento_repo
from infrastructure.database.supabase_repository import SupabaseEventoRepository

router = APIRouter(prefix="/eventos", tags=["Eventos da Programacao"])

class EventoSchema(BaseModel):
    diaNumero: str
    mes: str
    diaSemana: str
    horario: str
    tema: str
    palestrante: str
    cargo: str
    bio: str
    fotoUrl: str
    responsaveis: str
    local: str

@router.get("/")
def listar_eventos(repo: SupabaseEventoRepository = Depends(get_evento_repo)):
    for tentativa in range(3):
        try:
            return repo.listar_eventos()
        except Exception as e:
            if tentativa < 2:
                time.sleep(1)
                continue
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def criar_evento(request: EventoSchema, repo: SupabaseEventoRepository = Depends(get_evento_repo)):
    novo_evento = repo.criar_evento(request.dict())
    if not novo_evento:
        raise HTTPException(status_code=500, detail="Erro ao criar evento.")
    return novo_evento

@router.put("/{evento_id}")
def atualizar_evento(evento_id: int, request: EventoSchema, repo: SupabaseEventoRepository = Depends(get_evento_repo)):
    evento_atualizado = repo.atualizar_evento(evento_id, request.dict())
    if not evento_atualizado:
        raise HTTPException(status_code=400, detail="Erro ao atualizar evento.")
    return evento_atualizado

@router.delete("/{evento_id}")
def deletar_evento(evento_id: int, repo: SupabaseEventoRepository = Depends(get_evento_repo)):
    sucesso = repo.excluir_evento(evento_id)
    if not sucesso:
        raise HTTPException(status_code=500, detail="Erro ao excluir evento.")
    return {"message": "Evento excluído com sucesso"}