import os
from dotenv import load_dotenv
from supabase import create_client, Client

from infrastructure.database.supabase_repository import (
    SupabaseColaboradorRepository,
    SupabaseParticipacaoRepository,
    SupabaseQuizRepository,
    SupabaseRelatorioRepository
)
from application.use_cases.registrar_presenca_presencial import RegistrarPresencaPresencialUseCase
from application.use_cases.submeter_resposta import SubmeterRespostaUseCase
from application.use_cases.iniciar_quiz_online import IniciarQuizOnlineUseCase
from application.use_cases.gerar_relatorio_final import GerarRelatorioFinalUseCase 
from application.use_cases.listar_quizzes import ListarQuizzesUseCase

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Cria a conexão única com o Supabase
supabase_client: Client = create_client(url, key)

# Repositórios
colaborador_repo = SupabaseColaboradorRepository(supabase_client)
participacao_repo = SupabaseParticipacaoRepository(supabase_client)
quiz_repo = SupabaseQuizRepository(supabase_client)
relatorio_repo = SupabaseRelatorioRepository(supabase_client)

# Casos de Uso
registrar_presenca_uc = RegistrarPresencaPresencialUseCase(participacao_repo, colaborador_repo)
submeter_resposta_uc = SubmeterRespostaUseCase(participacao_repo, quiz_repo)
iniciar_quiz_uc = IniciarQuizOnlineUseCase(participacao_repo, colaborador_repo, quiz_repo)
gerar_relatorio_uc = GerarRelatorioFinalUseCase(relatorio_repo)
listar_quizzes_uc = ListarQuizzesUseCase(quiz_repo) # <-- Instanciado aqui!

# Dependências (Getters)
def get_registrar_presenca_uc():
    return registrar_presenca_uc

def get_submeter_resposta_uc():
    return submeter_resposta_uc

def get_iniciar_quiz_uc():
    return iniciar_quiz_uc

def get_gerar_relatorio_uc():
    return gerar_relatorio_uc

def get_listar_quizzes_uc(): 
    return listar_quizzes_uc

def get_quiz_repo():
    return quiz_repo

def get_relatorio_repo():
    return relatorio_repo


_supabase_instance: Client = None

def get_supabase_client() -> Client:
    """
    Retorna a mesma instância do Supabase para todas as requisições (Singleton),
    evitando o esgotamento de sockets no Windows (WinError 10035).
    """
    global _supabase_instance
    if _supabase_instance is None:
        _supabase_instance = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    return _supabase_instance