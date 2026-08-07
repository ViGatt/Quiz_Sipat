from typing import List, Dict, Any
from supabase import Client
from domain.entities.colaborador import Colaborador
from domain.entities.participacao import Participacao
from domain.entities.questao import Questao
from domain.entities.numero_sorte import NumeroSorte
import uuid
from domain.repositories.quiz_repository import QuizRepository

class SupabaseColaboradorRepository:
    def __init__(self, supabase_client: Client):
        self.db = supabase_client

    def buscar_por_cpf(self, cpf: str) -> Colaborador | None:
        response = self.db.table("colaboradores").select("*").eq("cpf", cpf).execute()
        if not response.data:
            return None
        
        data = response.data[0]
        return Colaborador(
            id=uuid.UUID(data["id"]),
            cpf=data["cpf"],
            nome=data["nome"],
            tipo=data["tipo"],
            is_comissao=data["is_comissao"]
        )

class SupabaseParticipacaoRepository:
    def __init__(self, supabase_client: Client):
        self.db = supabase_client

    def buscar_por_colaborador_e_dia(self, colaborador_id: uuid.UUID, dia_sipat_id: int) -> Participacao | None:
        response = self.db.table("participacoes")\
            .select("*")\
            .eq("colaborador_id", str(colaborador_id))\
            .eq("dia_sipat_id", dia_sipat_id)\
            .execute()
            
        if not response.data:
            return None
            
        data = response.data[0]
        return Participacao(
            id=uuid.UUID(data["id"]),
            colaborador_id=uuid.UUID(data["colaborador_id"]),
            dia_sipat_id=data["dia_sipat_id"],
            modalidade=data["modalidade"]
        )

    def buscar_por_cpf_e_dia(self, cpf: str, dia_sipat_id: int) -> Participacao | None:
        response = self.db.table("participacoes")\
            .select("*, colaboradores!inner(cpf)")\
            .eq("colaboradores.cpf", cpf)\
            .eq("dia_sipat_id", dia_sipat_id)\
            .execute()
            
        if not response.data:
            return None
            
        data = response.data[0]
        return Participacao(
            id=uuid.UUID(data["id"]),
            colaborador_id=uuid.UUID(data["colaborador_id"]),
            dia_sipat_id=data["dia_sipat_id"],
            modalidade=data["modalidade"]
        )

    def salvar(self, participacao: Participacao) -> None:
        self.db.table("participacoes").insert({
            "id": str(participacao.id),
            "colaborador_id": str(participacao.colaborador_id),
            "dia_sipat_id": participacao.dia_sipat_id,
            "modalidade": participacao.modalidade
        }).execute()

    def questao_ja_respondida(self, participacao_id: uuid.UUID, questao_id: str) -> bool:
        response = self.db.table("respostas")\
            .select("id")\
            .eq("participacao_id", str(participacao_id))\
            .eq("questao_id", questao_id)\
            .execute()
        return len(response.data) > 0

    def salvar_resposta(self, participacao_id: uuid.UUID, questao_id: str, alternativa: str, acertou: bool) -> None:
        self.db.table("respostas").insert({
            "participacao_id": str(participacao_id),
            "questao_id": questao_id,
            "alternativa_escolhida": alternativa,
            "acertou": acertou
        }).execute()

    def contar_respostas_dadas(self, participacao_id: uuid.UUID) -> int:
        response = self.db.table("respostas").select("id", count="exact").eq("participacao_id", str(participacao_id)).execute()
        return response.count

    def contar_acertos(self, participacao_id: uuid.UUID) -> int:
        response = self.db.table("respostas").select("id", count="exact").eq("participacao_id", str(participacao_id)).eq("acertou", True).execute()
        return response.count

    def salvar_numero_sorte(self, numero_sorte: NumeroSorte) -> None:
        self.db.table("numeros_sorte").insert({
            "id": str(numero_sorte.id),
            "colaborador_id": str(numero_sorte.colaborador_id),
            "dia_sipat_id": numero_sorte.dia_sipat_id,
            "numero_gerado": numero_sorte.numero
        }).execute()


class SupabaseQuizRepository(QuizRepository):
    def __init__(self, supabase_client: Client):
        self.db = supabase_client

    def buscar_questao(self, questao_id: str) -> Questao | None:
        response = self.db.table("questoes").select("*").eq("id", questao_id).execute()
        if not response.data:
            return None
            
        data = response.data[0]
        return Questao(
            id=data["id"],
            dia_sipat_id=data["dia_sipat_id"],
            texto=data["texto"],
            opcoes=data["opcoes"],
            resposta_correta=data["resposta_correta"]
        )

    def buscar_quiz_por_dia(self, dia_sipat_id: int):
        response = self.db.table("dias_sipat").select("*").eq("id", dia_sipat_id).execute()
        return type('obj', (object,), response.data[0]) if response.data else None

    def buscar_questoes_por_quiz(self, dia_sipat_id: int) -> list[Questao]:
        response = self.db.table("questoes").select("*").eq("dia_sipat_id", dia_sipat_id).execute()
        return [
            Questao(
                id=q["id"],
                dia_sipat_id=q["dia_sipat_id"],
                texto=q["texto"],
                opcoes=q["opcoes"],
                resposta_correta=q["resposta_correta"]
            ) for q in response.data
        ]

    def listar_dias_sipat(self) -> List[Dict[str, Any]]:
        """
        Faz um SELECT na tabela dias_sipat para buscar os quizzes.
        """
        response = self.db.table('dias_sipat').select('*').order('id').execute()
        return response.data


class SupabaseRelatorioRepository:
    def __init__(self, supabase_client: Client):
        self.db = supabase_client

    def obter_resumo_geral(self) -> dict:
        response = self.db.table("view_relatorio_geral").select("*").execute()
        return response.data[0] if response.data else {}

    def obter_participacao_por_dia(self) -> list[dict]:
        response = self.db.table("view_relatorio_por_dia").select("*").execute()
        return response.data

    def obter_numeros_sorte(self) -> list[dict]:
        response = self.db.table("view_relatorio_numeros_sorte").select("*").execute()
        return response.data

    def obter_desempenho_online(self) -> list[dict]:
        response = self.db.table("view_relatorio_desempenho").select("*").execute()
        return response.data