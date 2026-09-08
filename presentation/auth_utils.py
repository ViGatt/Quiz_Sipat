import os
import time
import jwt
from fastapi import Header, HTTPException

# Reaproveita a SUPABASE_KEY como segredo de assinatura se ADMIN_TOKEN_SECRET
# não estiver configurada, para funcionar sem exigir uma nova variável de
# ambiente no deploy. Configurar ADMIN_TOKEN_SECRET é o ideal, mas não obrigatório.
_SECRET = os.environ.get("ADMIN_TOKEN_SECRET") or os.environ.get("SUPABASE_KEY") or "troque-este-segredo-quiz-sipat"
_ALGORITMO = "HS256"
_TTL_SEGUNDOS = 60 * 60 * 24  # 24h


def gerar_token(colaborador_id: str, is_comissao: bool) -> str:
    payload = {
        "id": str(colaborador_id),
        "is_comissao": bool(is_comissao),
        "exp": int(time.time()) + _TTL_SEGUNDOS,
    }
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITMO)


def _decodificar(token: str) -> dict:
    try:
        return jwt.decode(token, _SECRET, algorithms=[_ALGORITMO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")


def exigir_comissao(authorization: str | None = Header(default=None)) -> dict:
    """
    Dependência do FastAPI para proteger rotas administrativas.
    Exige um header 'Authorization: Bearer <token>' de um colaborador com is_comissao=True.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autenticado.")

    token = authorization.removeprefix("Bearer ").strip()
    payload = _decodificar(token)

    if not payload.get("is_comissao"):
        raise HTTPException(status_code=403, detail="Acesso restrito à comissão organizadora.")

    return payload
