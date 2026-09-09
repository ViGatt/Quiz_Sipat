-- Execute este script UMA VEZ no SQL Editor do Supabase (Dashboard > SQL Editor > New query).
-- Cria a tabela que guarda o histórico de vencedores dos sorteios pós-evento.

create table if not exists public.sorteios (
    id uuid primary key,
    numero_sorte_id uuid not null references public.numeros_sorte(id) on delete cascade,
    colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
    colaborador_nome text not null,
    cpf text not null,
    numero_gerado text not null,
    dia_sipat_id integer null references public.dias_sipat(id) on delete set null,
    escopo text not null default 'GERAL',
    premio text null,
    criado_em timestamptz not null default now()
);

-- Um mesmo número da sorte não pode ser sorteado (vencer) duas vezes.
create unique index if not exists sorteios_numero_sorte_id_key
    on public.sorteios (numero_sorte_id);

create index if not exists sorteios_colaborador_id_idx
    on public.sorteios (colaborador_id);

create index if not exists sorteios_dia_sipat_id_idx
    on public.sorteios (dia_sipat_id);
