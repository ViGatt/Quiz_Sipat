from fastapi import APIRouter, Depends, HTTPException
from presentation.dependencias import get_gerar_relatorio_uc
from application.use_cases.gerar_relatorio_final import GerarRelatorioFinalUseCase

router = APIRouter(prefix="/relatorios", tags=["Relatórios Gerenciais"])

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