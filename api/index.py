from fastapi import FastAPI
from presentation.main import app as sipat_app

app = FastAPI()
app.mount("/api", sipat_app)