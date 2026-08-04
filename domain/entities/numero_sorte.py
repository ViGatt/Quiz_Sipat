from dataclasses import dataclass
import uuid

@dataclass
class NumeroSorte:
    id: uuid.UUID
    colaborador_id: uuid.UUID
    dia_sipat_id: int
    numero: str