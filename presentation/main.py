from fastapi import FastAPI
from presentation.routers import recepcao_router, quiz_router

app = FastAPI(
    title="Quiz SIPAT API - RIC Ambiental",
    description="Plataforma digital para acompanhamento da SIPAT e gamificação",
    version="1.0.0"
)

app.include_router(recepcao_router.router)
app.include_router(quiz_router.router)  # <-- NOVO ROTEADOR INCLUÍDO AQUI

@app.get("/")
def health_check():
    """Rota raiz apenas para verificar se a API está no ar."""
    return {"status": "API do Quiz SIPAT está online e operando!"}