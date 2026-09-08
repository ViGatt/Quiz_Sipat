from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Questao:
    id: str
    dia_sipat_id: int
    texto: str
    opcoes: List[str]
    resposta_correta: str
    pontos: int = 10
    feedback_correto: Optional[str] = None
    feedback_incorreto: Optional[str] = None