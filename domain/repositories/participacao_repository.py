from abc import ABC, abstractmethod
import uuid
from domain.entities.participacao import Participacao
from domain.entities.numero_sorte import NumeroSorte

class ParticipacaoRepository(ABC):
    @abstractmethod
    def buscar_por_colaborador_e_dia(self, colaborador_id: uuid.UUID, dia_sipat_id: int) -> Participacao | None:
        pass

    @abstractmethod
    def buscar_por_cpf_e_dia(self, cpf: str, dia_sipat_id: int) -> Participacao | None:
        pass

    @abstractmethod
    def salvar(self, participacao: Participacao) -> None:
        pass

    @abstractmethod
    def questao_ja_respondida(self, participacao_id: uuid.UUID, questao_id: str) -> bool:
        pass

    @abstractmethod
    def salvar_resposta(self, participacao_id: uuid.UUID, questao_id: str, alternativa: str, acertou: bool) -> None:
        pass

    @abstractmethod
    def contar_respostas_dadas(self, participacao_id: uuid.UUID) -> int:
        pass

    @abstractmethod
    def contar_acertos(self, participacao_id: uuid.UUID) -> int:
        pass

    @abstractmethod
    def salvar_numero_sorte(self, numero_sorte: NumeroSorte) -> None:
        pass