from dataclasses import dataclass
from typing import List

@dataclass
class Questao:
    id: str
    dia_sipat_id: int
    texto: str
    opcoes: List[str]
    resposta_correta: str