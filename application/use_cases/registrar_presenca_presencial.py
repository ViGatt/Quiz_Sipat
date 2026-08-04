from domain.exceptions import ParticipacaoDuplicadaError, ColaboradorNaoEncontradoError
from domain.repositories.participacao_repository import ParticipacaoRepository
from domain.repositories.colaborador_repository import ColaboradorRepository
from domain.entities.participacao import Participacao
from domain.entities.numero_sorte import NumeroSorte
import uuid

class RegistrarPresencaPresencialUseCase:
    def __init__(
        self, 
        participacao_repo: ParticipacaoRepository,
        colaborador_repo: ColaboradorRepository
    ):
        self.participacao_repo = participacao_repo
        self.colaborador_repo = colaborador_repo

    def executar(self, cpf: str, dia_sipat_id: int) -> NumeroSorte:
        # 1. Buscar colaborador
        colaborador = self.colaborador_repo.buscar_por_cpf(cpf)
        if not colaborador:
            raise ColaboradorNaoEncontradoError("CPF não cadastrado na base.")

        # 2. Verificar se já existe participação (presencial ou online) neste dia
        participacao_existente = self.participacao_repo.buscar_por_colaborador_e_dia(
            colaborador.id, dia_sipat_id
        )
        if participacao_existente:
            raise ParticipacaoDuplicadaError("Colaborador já possui participação registrada neste dia.")

        # 3. Criar a nova participação presencial
        # Ao registrar presencialmente, o acesso online fica automaticamente bloqueado
        # pelo fato de que já existe uma participação com este CPF e DIA.
        nova_participacao = Participacao(
            id=uuid.uuid4(),
            colaborador_id=colaborador.id,
            dia_sipat_id=dia_sipat_id,
            modalidade="PRESENCIAL"
        )
        self.participacao_repo.salvar(nova_participacao)

        # 4. Gerar e salvar o Número da Sorte automaticamente
        numero_sorte = nova_participacao.gerar_numero_sorte()
        self.participacao_repo.salvar_numero_sorte(numero_sorte)

        return numero_sorte