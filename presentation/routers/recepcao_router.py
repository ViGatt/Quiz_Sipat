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
    repo = Depends(get_colaborador_repo) 
):
    """
    Recebe um arquivo Excel/CSV, extrai os dados dinamicamente e salva com segurança.
    """
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie .xlsx ou .csv")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Padroniza as colunas da planilha (Remove acentos, espaços e deixa maiúsculo)
        # Isso evita erros se o RH mandar "Admissão" ou "Admissao"
        import unicodedata
        def limpar_nome_coluna(nome):
            nome = str(nome).strip().upper()
            return ''.join(c for c in unicodedata.normalize('NFD', nome) if unicodedata.category(c) != 'Mn')
            
        df.columns = [limpar_nome_coluna(c) for c in df.columns]
        
        if 'NOME' not in df.columns or 'CPF' not in df.columns:
            raise HTTPException(status_code=400, detail="A planilha deve conter as colunas NOME e CPF no mínimo.")
            
        # Verifica quais colunas extras o RH mandou nessa planilha específica
        colunas_planilha = df.columns.tolist()
        
        lista_pronta = []
        
        for index, row in df.iterrows():
            nome_cru = str(row['NOME']).strip()
            cpf_cru = str(row['CPF']).strip()
            
            if nome_cru.lower() == 'nan' or cpf_cru.lower() == 'nan':
                continue
                
            cpf_limpo = ''.join(filter(str.isdigit, cpf_cru)).zfill(11)
            
            # --- CAPTURA DINÂMICA DAS INFORMAÇÕES EXTRAS ---
            
            # 1. Tipo de Trabalhador
            tipo_colaborador = "Colaborador"
            if 'TIPO TRABALHADOR' in colunas_planilha:
                val = str(row['TIPO TRABALHADOR']).strip()
                if val.lower() != 'nan' and val != '': tipo_colaborador = val.title()
            elif 'TIPO' in colunas_planilha:
                val = str(row['TIPO']).strip()
                if val.lower() != 'nan' and val != '': tipo_colaborador = val.title()
                
            # 2. Admissão
            admissao = None
            if 'ADMISSAO/ENTRADA' in colunas_planilha:
                val = str(row['ADMISSAO/ENTRADA']).strip()
                if val.lower() != 'nan' and val != '': admissao = val
            elif 'ADMISSAO' in colunas_planilha:
                val = str(row['ADMISSAO']).strip()
                if val.lower() != 'nan' and val != '': admissao = val
                
            # 3. Tempo de Empresa
            tempo_empresa = None
            if 'TEMPO DE EMPRESA' in colunas_planilha:
                val = str(row['TEMPO DE EMPRESA']).strip()
                if val.lower() != 'nan' and val != '': tempo_empresa = val
                
            # 4. Nascimento
            nascimento = None
            if 'NASCIMENTO' in colunas_planilha:
                val = str(row['NASCIMENTO']).strip()
                if val.lower() != 'nan' and val != '': nascimento = val

            # Monta o dicionário para salvar no banco
            lista_pronta.append({
                "nome": nome_cru.title(), 
                "cpf": cpf_limpo,
                "is_comissao": False,
                "tipo": tipo_colaborador,
                "admissao": admissao,
                "tempo_empresa": tempo_empresa,
                "nascimento": nascimento
            })
            
        if not lista_pronta:
            raise HTTPException(status_code=400, detail="Nenhum dado válido encontrado na planilha.")
            
        # Envia tudo para o Supabase (Upsert fará a mágica)
        resultado = repo.importar_colaboradores_em_massa(lista_pronta)
        
        if not resultado.get("sucesso"):
            raise HTTPException(status_code=500, detail=resultado.get("erro", "Erro desconhecido ao salvar."))
            
        return {
            "message": f"Sucesso! {resultado.get('quantidade')} pessoas foram importadas.",
            "amostra": lista_pronta[:2] 
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")

@router.get("/status/{dia_sipat_id}")
def listar_status_recepcao(
    dia_sipat_id: int, 
    repo = Depends(get_colaborador_repo) # Use o mesmo getter que usou no importar-rh
):
    """
    Retorna a lista completa de colaboradores e seus status de presença no dia.
    """
    try:
        lista = repo.listar_status_recepcao(dia_sipat_id)
        return {"participantes": lista}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar lista: {str(e)}")