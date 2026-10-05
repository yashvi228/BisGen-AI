from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.ml import router as ml_router

app = FastAPI(
    title="AI Business Intelligence Agent",
    description="AI-powered business intelligence platform",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


app.include_router(
    analytics_router
)


@app.get("/")
def root():

    return {
        "message": "AI Business Intelligence Agent API",
        "status": "running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }
app.include_router(ml_router)