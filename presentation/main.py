import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
# -------------------------------------------------------

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from presentation.routers import recepcao_router, quiz_router, relatorio_router, eventos_router

app = FastAPI(
    title="Quiz SIPAT API - RIC Ambiental",
    description="Plataforma digital para acompanhamento da SIPAT e gamificação",
    version="1.0.0"
)

# Configuração do CORS para permitir que o React se comunique com o FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite requisições de qualquer origem (localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

app.include_router(recepcao_router.router)
app.include_router(quiz_router.router)
app.include_router(relatorio_router.router)
app.include_router(eventos_router.router)

@app.get("/")
def health_check():
    return {"status": "API do Quiz SIPAT está online e operando!"}