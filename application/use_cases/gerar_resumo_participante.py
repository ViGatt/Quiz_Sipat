class GerarResumoParticipanteUseCase:
    def __init__(self, relatorio_repo):
        self.relatorio_repo = relatorio_repo

    def executar(self, cpf: str):
        if not cpf:
            raise ValueError("O CPF do participante é obrigatório.")
        
        resumo = self.relatorio_repo.obter_resumo_participante(cpf)
        return resumo