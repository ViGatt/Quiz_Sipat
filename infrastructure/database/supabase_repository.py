from typing import List, Dict, Any
from supabase import Client
from domain.entities.colaborador import Colaborador
from domain.entities.participacao import Participacao
from domain.entities.questao import Questao
from domain.entities.numero_sorte import NumeroSorte
import uuid
from datetime import datetime
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
    def importar_colaboradores_em_massa(self, lista_colaboradores: list[dict]) -> dict:
        """
        Recebe uma lista de dicionários e insere todos no Supabase.
        Se o CPF já existir, ele apenas ignora ou atualiza.
        """
        try:
            # O upsert tenta inserir. Se houver conflito na coluna 'cpf', ele atualiza.
            response = self.db.table("colaboradores").upsert(
                lista_colaboradores, 
                on_conflict="cpf"
            ).execute()
            
            inseridos = len(response.data) if response.data else 0
            return {"sucesso": True, "quantidade": inseridos}
        except Exception as e:
            print(f"Erro na importação em massa: {e}")
            return {"sucesso": False, "erro": str(e)}

    def listar_status_recepcao(self, dia_sipat_id: int) -> list[dict]:
        """
        Retorna a lista de todos os colaboradores e cruza com a tabela de participações
        para descobrir quem já fez check-in (Físico ou Online) no dia atual.
        """
        try:
            # 1. Busca todos os colaboradores
            colab_response = self.db.table("colaboradores").select("*").execute()
            colaboradores = colab_response.data if colab_response.data else []
            
            # 2. Busca todas as participações do dia específico
            part_response = self.db.table("participacoes").select("*").eq("dia_sipat_id", dia_sipat_id).execute()
            
            # CORREÇÃO AQUI: A tabela de participacoes usa 'colaborador_id' (e não 'cpf')
            participacoes_hoje = {p.get("colaborador_id"): p for p in (part_response.data if part_response.data else [])}
            
            # 3. Mescla as informações para o Front-end
            resultado = []
            for c in colaboradores:
                colab_id = c.get("id") # Pegamos o ID do colaborador
                cpf = c.get("cpf")
                
                # Cruzamos os dados usando o ID
                part = participacoes_hoje.get(colab_id)
                
                status_hoje = "PENDENTE"
                numero_sorte = ""
                
                if part:
                    # Se tiver participação, olha a modalidade
                    if part.get("modalidade") == "Presencial":
                        status_hoje = "PRESENCIAL"
                    else:
                        status_hoje = "ONLINE"
                        
                    numero_sorte = part.get("numero_sorte", "")
                    
                resultado.append({
                    "id": str(colab_id), 
                    "nome": c.get("nome"),
                    "cpf": cpf,
                    "statusHoje": status_hoje,
                    "numeroSorte": str(numero_sorte) if numero_sorte else ""
                })
                
            # Ordena alfabeticamente pelo nome
            resultado.sort(key=lambda x: str(x.get("nome", "")))
            return resultado
            
        except Exception as e:
            # Se der pau, vai mostrar a linha exata no terminal!
            print(f"Erro Real capturado: {e}")
            import traceback
            traceback.print_exc()
            return []

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
        from postgrest.exceptions import APIError  # <-- Importação para tratar o erro
        
        try:
            self.db.table("participacoes").insert({
                "id": str(participacao.id),
                "colaborador_id": str(participacao.colaborador_id),
                "dia_sipat_id": participacao.dia_sipat_id,
                "modalidade": participacao.modalidade
            }).execute()
            
        except APIError as e:
            # Código 23505 = Unique Violation (Duplicidade no banco)
            # Isso neutraliza o "tiro duplo" do React Strict Mode
            if e.code == '23505':
                print("Aviso: Participação já registrada (possível disparo duplo do front-end). Segue o jogo!")
                pass
            else:
                raise e

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

    # --- NOVO MÉTODO ADICIONADO AQUI ---
    def obter_por_id(self, quiz_id: int) -> dict | None:
        """
        Busca os detalhes do quiz do dia e também todas as questões vinculadas a ele.
        """
        # Busca o quiz no banco
        res_quiz = self.db.table("dias_sipat").select("*").eq("id", quiz_id).execute()
        if not res_quiz.data:
            return None
        
        quiz_data = res_quiz.data[0]

        # Busca as questões usando os nomes REAIS das colunas da sua tabela ('texto' e 'opcoes')
        res_questoes = self.db.table("questoes").select("id, texto, opcoes").eq("dia_sipat_id", quiz_id).execute()
        
        # Mapeamos os dados do banco para o formato exato que o Front-end espera
        questoes_formatadas = []
        for q in res_questoes.data:
            opcoes_banco = q.get("opcoes", {})
            
            # Trata as opções dependendo se você salvou como um Dicionário (JSON) ou Lista no banco
            if isinstance(opcoes_banco, dict):
                opt_a = opcoes_banco.get("A", opcoes_banco.get("a", ""))
                opt_b = opcoes_banco.get("B", opcoes_banco.get("b", ""))
                opt_c = opcoes_banco.get("C", opcoes_banco.get("c", ""))
                opt_d = opcoes_banco.get("D", opcoes_banco.get("d", ""))
            elif isinstance(opcoes_banco, list):
                opt_a = opcoes_banco[0] if len(opcoes_banco) > 0 else ""
                opt_b = opcoes_banco[1] if len(opcoes_banco) > 1 else ""
                opt_c = opcoes_banco[2] if len(opcoes_banco) > 2 else ""
                opt_d = opcoes_banco[3] if len(opcoes_banco) > 3 else ""
            else:
                opt_a = opt_b = opt_c = opt_d = ""

            questoes_formatadas.append({
                "id": q["id"],
                "enunciado": q.get("texto", ""), # Traduz o 'texto' para 'enunciado'
                "opcao_a": opt_a,
                "opcao_b": opt_b,
                "opcao_c": opt_c,
                "opcao_d": opt_d
            })
            
        quiz_data["questoes"] = questoes_formatadas
        return quiz_data

    def atualizar_quiz(self, quiz_id: int, tema: str, descricao: str, link_youtube_palestra: str) -> bool:
        """
        Atualiza as informações da palestra de um dia específico.
        """
        try:
            response = self.db.table("dias_sipat").update({
                "tema": tema,
                "descricao": descricao,
                "link_youtube_palestra": link_youtube_palestra
            }).eq("id", quiz_id).execute()
            
            # Como a API do supabase-python retorna os dados atualizados, 
            # podemos checar se a lista 'data' não está vazia.
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao atualizar quiz: {e}")
            return False

    def obter_dias_concluidos(self, cpf: str) -> list[int]:
        """
        Retorna uma lista com os IDs dos dias (quizzes) que o colaborador já participou.
        """
        response = self.db.table("participacoes") \
            .select("dia_sipat_id, colaboradores!inner(cpf)") \
            .eq("colaboradores.cpf", cpf) \
            .execute()
        
        return [item["dia_sipat_id"] for item in response.data]

    def criar_quiz_com_questoes(self, tema: str, descricao: str, tempo_limite: int, status: str, data_liberacao, questoes: list) -> bool:
        """
        Cria um novo dia de SIPAT e insere todas as questões vinculadas a ele.
        """
        try:
            # --- PASSO EXTRA: Descobrir o próximo ID disponível ---
            # Busca o maior ID que já existe na tabela
            resp_id = self.db.table("dias_sipat").select("id").order("id", desc=True).limit(1).execute()
            proximo_id = 1
            if resp_id.data:
                proximo_id = resp_id.data[0]["id"] + 1

            # 1. Cria o Novo Quiz (Dia da SIPAT) informando o novo ID e as novas configurações
            self.db.table("dias_sipat").insert({
                "id": proximo_id, 
                "tema": tema,
                "descricao": descricao,
                "data": datetime.now().date().isoformat(), 
                "link_youtube_palestra": "",
                "tempo_limite": tempo_limite,       # <-- NOVO CAMPO ADICIONADO AQUI
                "status": status,                   # <-- NOVO CAMPO ADICIONADO AQUI
                "data_liberacao": data_liberacao.isoformat() if data_liberacao else None  # <-- NOVO CAMPO
            }).execute()

            # 2. Prepara as questões para inserir no banco atreladas a esse novo ID
            questoes_db = []
            for q in questoes:
                questoes_db.append({
                    "id": str(uuid.uuid4()), # Gera um ID único para a questão para evitar o mesmo erro
                    "dia_sipat_id": proximo_id,
                    "texto": q.texto,
                    "opcoes": q.opcoes,
                    "resposta_correta": q.resposta_correta
                })

            # 3. Insere todas as questões de uma vez só!
            self.db.table("questoes").insert(questoes_db).execute()
            
            return True
        except Exception as e:
            print(f"Erro ao criar quiz no banco: {e}")
            return False

    def excluir_quiz_definitivo(self, quiz_id: int) -> bool:
        """
        Exclui o quiz permanentemente do banco de dados para limpar testes e não sujar as métricas.
        """
        try:
            # O Supabase apagará o quiz fisicamente. 
            self.db.table("dias_sipat").delete().eq("id", quiz_id).execute()
            return True
        except Exception as e:
            print(f"Erro ao excluir quiz definitivamente: {e}")
            return False

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

    def obter_resumo_geral(self) -> dict:
        """Busca os dados totais da view_relatorio_geral no Supabase"""
        try:
            response = self.db.table("view_relatorio_geral").select("*").execute()
            # Retorna a primeira linha, ou um dicionário vazio se não tiver dados
            return response.data[0] if response.data else {}
        except Exception as e:
            print(f"Erro ao buscar resumo geral: {e}")
            return {}

    def obter_desempenho_online(self) -> list:
        """Busca o ranking de participantes da view_relatorio_desempenho"""
        try:
            response = self.db.table("view_relatorio_desempenho").select("*").execute()
            return response.data
        except Exception as e:
            print(f"Erro ao buscar desempenho online: {e}")
            return []
    def obter_metricas_detalhadas_quiz(self, quiz_id: int) -> dict | None:
        """
        Calcula as métricas reais de um quiz específico baseado nas respostas e participações do banco.
        """
        try:
            # 1. Busca os dados do Quiz com fallback para tempo_limite
            res_quiz = self.db.table("dias_sipat").select("*").eq("id", quiz_id).execute()
            if not res_quiz.data:
                return None
            quiz = res_quiz.data[0]
            tempo_limite_val = quiz.get("tempo_limite") or 15

            # 2. Busca as questões vinculadas
            res_questoes = self.db.table("questoes").select("id, texto").eq("dia_sipat_id", quiz_id).execute()
            questoes = res_questoes.data or []
            total_questoes = len(questoes) if len(questoes) > 0 else 1

            # 3. Busca participações
            res_part = self.db.table("participacoes") \
                .select("id, criado_em, tempo_gasto, colaboradores(nome)") \
                .eq("dia_sipat_id", quiz_id) \
                .execute()
            
            participacoes = res_part.data or []
            total_completos = len(participacoes)

            conclusoes_recentes = []
            pontuacoes = []
            tempos_segundos = []
            aprovados_count = 0

            # 4. Processa cada participação para calcular nota e tempo gasto
            for part in participacoes:
                p_id = part["id"]
                colab = part.get("colaboradores") or {}
                nome_colaborador = colab.get("nome", "Colaborador") if isinstance(colab, dict) else "Colaborador"
                data_criacao = part.get("criado_em", "")
                tempo_seg = part.get("tempo_gasto", 0) or 0

                if tempo_seg > 0:
                    tempos_segundos.append(tempo_seg)

                # Busca acertos na tabela respostas
                res_resp = self.db.table("respostas").select("acertou").eq("participacao_id", str(p_id)).execute()
                respostas_user = res_resp.data or []
                
                acertos = sum(1 for r in respostas_user if r.get("acertou") is True)
                pct_score = round((acertos / total_questoes) * 100, 1)
                pontuacoes.append(pct_score)

                if pct_score >= 70.0:
                    aprovados_count += 1

                # Formata data
                data_fmt = "Recente"
                if data_criacao:
                    try:
                        dt = datetime.fromisoformat(data_criacao.replace('Z', '+00:00'))
                        data_fmt = dt.strftime("%d/%m %H:%M")
                    except Exception:
                        data_fmt = "Recente"

                # Formata tempo individual MM:SS
                minutos_ind = tempo_seg // 60
                segundos_ind = tempo_seg % 60
                tempo_ind_fmt = f"{minutos_ind:02d}:{segundos_ind:02d}" if tempo_seg > 0 else "--:--"

                conclusoes_recentes.append({
                    "id": p_id,
                    "name": nome_colaborador,
                    "score": f"{pct_score}%",
                    "time": tempo_ind_fmt,
                    "date": data_fmt
                })

            # Métricas agregadas
            pontuacao_media = round(sum(pontuacoes) / len(pontuacoes), 1) if pontuacoes else 0
            maior_pontuacao = max(pontuacoes) if pontuacoes else 0
            taxa_aprovacao = round((aprovados_count / total_completos) * 100, 1) if total_completos > 0 else 0

            # Formata Tempo Médio em MM:SS
            if tempos_segundos:
                media_seg = sum(tempos_segundos) // len(tempos_segundos)
                min_m = media_seg // 60
                seg_m = media_seg % 60
                tempo_medio_fmt = f"{min_m:02d}:{seg_m:02d}"
            else:
                tempo_medio_fmt = "--:--"

            # 5. Cálculo de Desempenho por Questão
            desempenho_questoes = []
            for idx, q in enumerate(questoes, 1):
                q_id = q["id"]
                res_q = self.db.table("respostas").select("acertou").eq("questao_id", str(q_id)).execute()
                resps_q = res_q.data or []
                total_resps = len(resps_q)
                acertos_q = sum(1 for r in resps_q if r.get("acertou") is True)
                
                rate = round((acertos_q / total_resps) * 100) if total_resps > 0 else 0
                
                desempenho_questoes.append({
                    "id": q_id,
                    "question": f"{idx}. {q.get('texto', 'Questão')}",
                    "correctRate": rate
                })

            return {
                "quiz_id": quiz_id,
                "tema": quiz.get("tema", ""),
                "descricao": quiz.get("descricao", ""),
                "total_completos": str(total_completos),
                "taxa_aprovacao": f"{taxa_aprovacao}%",
                "tempo_limite": f"{tempo_limite_val} min",
                "tempo_medio": tempo_medio_fmt,
                "pontuacao_media": f"{pontuacao_media}%",
                "maior_pontuacao": f"{maior_pontuacao}%",
                "conclusoes_recentes": conclusoes_recentes,
                "desempenho_questoes": desempenho_questoes
            }
        except Exception as e:
            print(f"Erro ao obter métricas do quiz {quiz_id}: {e}")
            return None
    
class SupabaseEventoRepository:
    def __init__(self, client):
        self.client = client

    def listar_eventos(self):
        res = self.client.table("eventos").select("*").order("id").execute()
        return res.data

    def criar_evento(self, dados: dict):
        res = self.client.table("eventos").insert(dados).execute()
        return res.data[0] if res.data else None

    def atualizar_evento(self, evento_id: int, dados: dict):
        res = self.client.table("eventos").update(dados).eq("id", evento_id).execute()
        return res.data[0] if res.data else None

    def excluir_evento(self, evento_id: int):
        res = self.client.table("eventos").delete().eq("id", evento_id).execute()
        return True if res.data else False
    