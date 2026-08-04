from dataclasses import dataclass
import uuid

@dataclass
class Colaborador:
    id: uuid.UUID
    cpf: str
    nome: str
    tipo: str  # Exemplos: 'INTERNO', 'EXTERNO', 'PJ'
    is_comissao: bool