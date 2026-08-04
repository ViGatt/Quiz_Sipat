from abc import ABC, abstractmethod

class RelatorioRepository(ABC):
    @abstractmethod
    def obter_resumo_geral(self) -> dict:
        pass

    @abstractmethod
    def obter_participacao_por_dia(self) -> list[dict]:
        pass

    @abstractmethod
    def obter_numeros_sorte(self) -> list[dict]:
        pass

    @abstractmethod
    def obter_desempenho_online(self) -> list[dict]:
        pass