from dataclasses import dataclass
import uuid
import random
from domain.entities.numero_sorte import NumeroSorte

@dataclass
class Participacao:
    id: uuid.UUID
    colaborador_id: uuid.UUID
    dia_sipat_id: int
    modalidade: str  # 'PRESENCIAL' ou 'ONLINE'

    def gerar_numero_sorte(self) -> NumeroSorte:
        """
        Gera o Número da Sorte correspondente a esta participação diária.
        Pode ser adaptado para seguir um formato específico da RIC Ambiental.
        """
        numero_aleatorio = f"{self.dia_sipat_id}{random.randint(10000, 99999)}"
        
        return NumeroSorte(
            id=uuid.uuid4(),
            colaborador_id=self.colaborador_id,
            dia_sipat_id=self.dia_sipat_id,
            numero=numero_aleatorio
        )