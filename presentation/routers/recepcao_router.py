from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
import pandas as pd
import io

from presentation.dependencias import (
    get_registrar_presenca_uc, 
    get_colaborador_repo # <-- Importe aqui o getter do repositório onde você colocou o método de importação em massa
)
from application.use_cases.registrar_presenca_presencial import RegistrarPresencaPresencialUseCase
from domain.exceptions import ParticipacaoDuplicadaError, ColaboradorNaoEncontradoError

router = APIRouter(prefix="/recepcao", tags=["Recepção Presencial"])

# DTO Atualizado com o nome completo
class RegistroPresencaRequest(BaseModel):
    cpf: str
    nome_completo: str 
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
        # Passando o nome_completo para o Caso de Uso
        numero_sorte = use_case.executar(request.cpf, request.nome_completo, request.dia_sipat_id)
        
        return {
            "mensagem": f"Presença de {request.nome_completo} registrada com sucesso.",
            "numero_sorte": numero_sorte.numero
        }
        
    except ColaboradorNaoEncontradoError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ParticipacaoDuplicadaError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao processar a solicitação.")

# -----------------------------------------------------------------
# NOVA ROTA - Importação Massiva de Colaboradores via Excel/CSV
# -----------------------------------------------------------------
@router.post("/importar-rh")
async def importar_planilha_rh(
    file: UploadFile = File(...),
    repo = Depends(get_colaborador_repo) # <-- Injetamos o repositório aqui
):
    """
    Recebe um arquivo Excel/CSV, extrai NOME e CPF, e cadastra todos os colaboradores.
    """
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie .xlsx ou .csv")
    
    try:
        # 1. Lê o arquivo em memória sem salvar no disco (mais seguro e rápido)
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # 2. Padroniza as colunas (tudo maiúsculo e sem espaços sobrando)
        df.columns = [str(c).strip().upper() for c in df.columns]
        
        # 3. Verifica se as colunas obrigatórias existem
        if 'NOME' not in df.columns or 'CPF' not in df.columns:
            raise HTTPException(status_code=400, detail="A planilha deve conter obrigatoriamente as colunas NOME e CPF.")
            
        lista_pronta = []
        
        # 4. Processa cada linha e limpa os dados
        for index, row in df.iterrows():
            nome_cru = str(row['NOME']).strip()
            cpf_cru = str(row['CPF']).strip()
            
            # Pula linhas vazias (que o pandas lê como 'nan')
            if nome_cru.lower() == 'nan' or cpf_cru.lower() == 'nan':
                continue
                
            # Limpa o CPF (remove ponto e traço) e garante que tem os zeros a esquerda
            cpf_limpo = ''.join(filter(str.isdigit, cpf_cru)).zfill(11)
            
            lista_pronta.append({
                "nome": nome_cru.title(), # Deixa o nome Bonitinho (Ex: João Da Silva)
                "cpf": cpf_limpo,
                "is_comissao": False
            })
            
        if not lista_pronta:
            raise HTTPException(status_code=400, detail="Nenhum dado válido encontrado na planilha.")
            
        # 5. Manda tudo pro banco de uma vez só (Upsert)
        resultado = repo.importar_colaboradores_em_massa(lista_pronta)
        
        if not resultado.get("sucesso"):
            raise HTTPException(status_code=500, detail=resultado.get("erro", "Erro desconhecido ao salvar."))
            
        return {
            "message": f"Sucesso! {resultado.get('quantidade')} colaboradores foram importados para o sistema.",
            "amostra": lista_pronta[:2] # Retorna as duas primeiras pessoas só pra gente ver no console
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")