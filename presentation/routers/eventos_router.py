from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
import time
from presentation.dependencias import get_evento_repo
from infrastructure.database.supabase_repository import SupabaseEventoRepository
from presentation.auth_utils import exigir_comissao

TIPOS_IMAGEM_PERMITIDOS = {"image/jpeg", "image/png", "image/webp", "image/gif"}
TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024  # 5MB

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

@router.post("/upload-foto")
async def upload_foto_palestrante(
    file: UploadFile = File(...),
    repo: SupabaseEventoRepository = Depends(get_evento_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    """
    Recebe uma foto do palestrante, envia para o Supabase Storage e devolve
    a URL pública já pronta para ser salva no campo fotoUrl do evento.
    """
    if file.content_type not in TIPOS_IMAGEM_PERMITIDOS:
        raise HTTPException(status_code=400, detail="Formato inválido. Envie uma imagem JPG, PNG, WEBP ou GIF.")

    conteudo = await file.read()
    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise HTTPException(status_code=400, detail="Imagem muito grande. O limite é 5MB.")

    try:
        url = repo.fazer_upload_foto_palestrante(file.filename or "foto.jpg", conteudo, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar a imagem: {str(e)}")

    return {"url": url}

@router.post("/")
def criar_evento(
    request: EventoSchema,
    repo: SupabaseEventoRepository = Depends(get_evento_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    novo_evento = repo.criar_evento(request.dict())
    if not novo_evento:
        raise HTTPException(status_code=500, detail="Erro ao criar evento.")
    return novo_evento

@router.put("/{evento_id}")
def atualizar_evento(
    evento_id: int,
    request: EventoSchema,
    repo: SupabaseEventoRepository = Depends(get_evento_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    evento_atualizado = repo.atualizar_evento(evento_id, request.dict())
    if not evento_atualizado:
        raise HTTPException(status_code=400, detail="Erro ao atualizar evento.")
    return evento_atualizado

@router.delete("/{evento_id}")
def deletar_evento(
    evento_id: int,
    repo: SupabaseEventoRepository = Depends(get_evento_repo),
    _comissao: dict = Depends(exigir_comissao),
):
    sucesso = repo.excluir_evento(evento_id)
    if not sucesso:
        raise HTTPException(status_code=500, detail="Erro ao excluir evento.")
    return {"message": "Evento excluído com sucesso"}