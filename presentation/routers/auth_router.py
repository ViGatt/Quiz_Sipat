from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from presentation.dependencias import get_colaborador_repo
from presentation.auth_utils import gerar_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])

UNIDADES_VALIDAS = {
    'Distrito Industrial', 'São Miguel', 'Rio Branco',
    'ETA CASCATA', 'ETA PEIXE', 'Operadores de Bomba',
    'Vigilantes', 'PJ'
}


class LoginRequest(BaseModel):
    cpf: str
    senha: str


class AtivarRequest(BaseModel):
    cpf: str
    unidade: str


def _apenas_digitos(cpf: str) -> str:
    return ''.join(filter(str.isdigit, cpf))


def _resposta_publica(dados: dict) -> dict:
    # Nunca devolve a senha para o front-end.
    return {
        "id": dados["id"],
        "cpf": dados["cpf"],
        "nome": dados["nome"],
        "is_comissao": dados["is_comissao"],
        "token": gerar_token(dados["id"], dados["is_comissao"]),
    }


@router.post("/login")
def login(request: LoginRequest, repo = Depends(get_colaborador_repo)):
    """
    Valida CPF + senha no backend. O front-end nunca consulta a tabela
    colaboradores diretamente (evita expor senha/PII de todos os colaboradores
    via chave anon do Supabase).
    """
    cpf_limpo = _apenas_digitos(request.cpf)
    dados = repo.buscar_dados_login_por_cpf(cpf_limpo)

    if not dados:
        raise HTTPException(status_code=404, detail="CPF não encontrado na base do RH.")

    if not dados.get("senha"):
        raise HTTPException(status_code=400, detail='Cadastro não ativado. Clique em "Ative sua conta" abaixo.')

    if dados["senha"] != request.senha:
        raise HTTPException(status_code=401, detail="Senha incorreta.")

    return _resposta_publica(dados)


@router.post("/ativar")
def ativar(request: AtivarRequest, repo = Depends(get_colaborador_repo)):
    """
    Ativa o primeiro acesso: confirma que o CPF está na base do RH, gera a senha
    automática (4 primeiros dígitos do CPF) e grava a unidade escolhida.
    """
    cpf_limpo = _apenas_digitos(request.cpf)

    if len(cpf_limpo) != 11:
        raise HTTPException(status_code=400, detail="Digite um CPF válido com 11 números.")

    if request.unidade not in UNIDADES_VALIDAS:
        raise HTTPException(status_code=400, detail="Selecione uma Unidade de Trabalho válida.")

    colaborador = repo.buscar_dados_login_por_cpf(cpf_limpo)

    if not colaborador:
        raise HTTPException(status_code=404, detail="CPF não encontrado na base de colaboradores da RIC Ambiental.")

    if colaborador.get("senha"):
        raise HTTPException(status_code=409, detail="Esta conta já está ativada. Por favor, vá para a tela de Login.")

    senha_automatica = cpf_limpo[:4]
    atualizado = repo.ativar_cadastro(colaborador["id"], senha_automatica, request.unidade)

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao salvar suas informações. Tente novamente.")

    return _resposta_publica(atualizado)
