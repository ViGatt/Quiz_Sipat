from domain.repositories.quiz_repository import QuizRepository

class ListarQuizzesUseCase:
    def __init__(self, quiz_repository: QuizRepository):
        self.quiz_repository = quiz_repository

    def executar(self):
        """
        Orquestra a busca dos quizzes disponíveis.
        Pode incluir regras de negócio futuras, como filtrar quizzes expirados.
        """
        dias_sipat = self.quiz_repository.listar_dias_sipat()
        
        # Caso a tabela esteja vazia, podemos retornar uma lista vazia ou tratar como quisermos
        if not dias_sipat:
            return []
            
        return dias_sipat