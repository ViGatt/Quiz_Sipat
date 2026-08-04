# domain/exceptions/__init__.py

class RegraNegocioError(Exception):
    """Classe base para erros de regra de negócio do domínio."""
    pass

class ParticipacaoDuplicadaError(RegraNegocioError):
    """Erro lançado quando o colaborador já possui participação no dia."""
    pass

class ColaboradorNaoEncontradoError(RegraNegocioError):
    """Erro lançado quando o CPF não existe na base."""
    pass

class ParticipacaoNaoEncontradaError(RegraNegocioError):
    """Erro lançado quando a sessão de quiz não é encontrada ou é inválida."""
    pass

class AcessoBloqueadoError(RegraNegocioError):
    """Erro lançado quando um bloqueio cruzado impede o acesso."""
    pass