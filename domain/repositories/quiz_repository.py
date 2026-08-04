from abc import ABC, abstractmethod
from domain.entities.questao import Questao

class QuizRepository(ABC):
    @abstractmethod
    def buscar_questao(self, questao_id: str) -> Questao | None:
        pass

    @abstractmethod
    def buscar_quiz_por_dia(self, dia_sipat_id: int):
        pass

    @abstractmethod
    def buscar_questoes_por_quiz(self, dia_sipat_id: int) -> list[Questao]:
        pass