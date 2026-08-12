from fastapi import APIRouter, Depends, HTTPException
from presentation.dependencias import get_gerar_relatorio_uc, get_relatorio_repo
from application.use_cases.gerar_relatorio_final import GerarRelatorioFinalUseCase
from infrastructure.database.supabase_repository import SupabaseRelatorioRepository

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