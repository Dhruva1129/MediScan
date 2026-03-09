from fastapi import APIRouter, Form, HTTPException
from app.services.auth_service import create_user, authenticate_user

router = APIRouter()

@router.post("/signup/")
async def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    try:
        user = await create_user(username, email, password)
        return {"id": user.id, "username": user.username, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login/")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    user = await authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"id": user.id, "username": user.username, "email": user.email}
