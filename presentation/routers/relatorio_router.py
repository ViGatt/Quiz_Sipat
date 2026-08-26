from fastapi import APIRouter, Depends, HTTPException
from presentation.dependencias import (
    get_gerar_relatorio_uc, 
    get_relatorio_repo, 
    get_gerar_resumo_participante_uc  
)
from application.use_cases.gerar_relatorio_final import GerarRelatorioFinalUseCase
from infrastructure.database.supabase_repository import SupabaseRelatorioRepository
import time

router = APIRouter(prefix="/relatorios", tags=["Relatórios Gerenciais"])

# --- NOVA ROTA PARA O DASHBOARD ---
@router.get("/geral")
def obter_relatorio_dashboard(repo: SupabaseRelatorioRepository = Depends(get_relatorio_repo)):
    """
    Consome as views do banco de dados para alimentar os cards e o ranking do Dashboard.
    """
    try:
        return {
            "resumo": repo.obter_resumo_geral(),
            "desempenho": repo.obter_desempenho_online()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados do dashboard: {str(e)}")

# --- SUA ROTA ORIGINAL MANTIDA ---
@router.get("/consolidado")
def obter_relatorio_consolidado(
    use_case: GerarRelatorioFinalUseCase = Depends(get_gerar_relatorio_uc)
):
    """
    Retorna todos os dados consolidados da SIPAT. 
    Este endpoint pode ser consumido pelo front-end para montar os gráficos 
    e gerar a exportação em Planilha (Excel/CSV) ou PDF.
    """
    try:
        return use_case.executar()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno ao gerar o relatório consolidado.")

@router.get("/quiz/{quiz_id}")
def obter_metricas_detalhadas_quiz(
    quiz_id: int, 
    repo: SupabaseRelatorioRepository = Depends(get_relatorio_repo)
):
    """
    Retorna os dados consolidados e métricas de desempenho de um quiz específico.
    """
    try:
        dados = repo.obter_metricas_detalhadas_quiz(quiz_id)
        if not dados:
            raise HTTPException(status_code=404, detail="Métricas não encontradas para este quiz.")
        return dados
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar métricas: {str(e)}")

@router.get("/meu-resumo/{cpf}")
def obter_meu_resumo(cpf: str, use_case = Depends(get_gerar_resumo_participante_uc)):
    for tentativa in range(3):
        try:
            return use_case.executar(cpf)
        except Exception as e:
            erro_str = str(e)
            if ("10035" in erro_str or "PGRST303" in erro_str) and tentativa < 2:
                time.sleep(1)
                continue
            
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro ao gerar resumo: {erro_str}")