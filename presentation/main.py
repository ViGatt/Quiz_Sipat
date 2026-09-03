import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
# -------------------------------------------------------

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from presentation.routers import recepcao_router, quiz_router, relatorio_router, eventos_router

app = FastAPI(
    title="Quiz SIPAT API - RIC Ambiental",
    description="Plataforma digital para acompanhamento da SIPAT e gamificação",
    version="1.0.0"
)

# Origens permitidas: domínio de produção + preview deploys da Vercel + dev local.
# Ajuste ALLOWED_ORIGINS no painel da Vercel se o domínio do front mudar.
origens_padrao = [
    "https://quiz-sipat.vercel.app",
    "http://localhost:5173",
]
origens_extra = os.environ.get("ALLOWED_ORIGINS", "")
allow_origins = origens_padrao + [o.strip() for o in origens_extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # cobre os preview deploys do front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recepcao_router.router)
app.include_router(quiz_router.router)
app.include_router(relatorio_router.router)
app.include_router(eventos_router.router)

@app.get("/")
def health_check():
    return {"status": "API do Quiz SIPAT está online e operando!"}