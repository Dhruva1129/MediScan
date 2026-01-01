
from fastapi import FastAPI
from app.routers import summary

app = FastAPI()

app.include_router(summary.router, prefix="/api", tags=["summary"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Repo Summary API"}
