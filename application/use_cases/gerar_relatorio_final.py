from domain.repositories.relatorio_repository import RelatorioRepository

class GerarRelatorioFinalUseCase:
    def __init__(self, relatorio_repo: RelatorioRepository):
        self.relatorio_repo = relatorio_repo

    def executar(self) -> dict:
        """
        Coleta e consolida todas as métricas gerenciais da SIPAT.
        """
        resumo = self.relatorio_repo.obter_resumo_geral()
        por_dia = self.relatorio_repo.obter_participacao_por_dia()
        numeros_sorte = self.relatorio_repo.obter_numeros_sorte()
        desempenho = self.relatorio_repo.obter_desempenho_online()

        return {
            "resumo_geral": resumo,
            "participacao_diaria": por_dia,
            "relacao_numeros_sorte": numeros_sorte,
            "desempenho_online": desempenho
        }