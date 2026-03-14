import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
# Import all models so they register with Base.metadata
from app.models import user  # noqa: F401
from app.models import summary as summary_model  # noqa: F401
from app.models import hospital  # noqa: F401
from app.models import patient  # noqa: F401

from app.routers import summary
from app.routers import followup
from app.routers import auth
from app.routers import user_history
from app.routers import translate
from app.routers import graphics
from app.routers import hospital
from app.routers import patient


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (only creates if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")
    yield


app = FastAPI(lifespan=lifespan)

# Allow CORS for any origin
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary.router, prefix="/api", tags=["summary"])
app.include_router(followup.router, prefix="/api", tags=["followup"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(user_history.router, prefix="/api", tags=["user_history"])
app.include_router(translate.router, prefix="/api", tags=["translate"])
app.include_router(graphics.router, prefix="/api", tags=["graphics"])
app.include_router(hospital.router, prefix="/api/hospitals", tags=["hospitals"])
app.include_router(patient.router, prefix="/api/patient", tags=["patient"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Repo Summary API"}
# Trigger reload
