from abc import ABC, abstractmethod
from domain.entities.colaborador import Colaborador

class ColaboradorRepository(ABC):
    @abstractmethod
    def buscar_por_cpf(self, cpf: str) -> Colaborador | None:
        pass