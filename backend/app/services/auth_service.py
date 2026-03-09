from passlib.context import CryptContext
from app.core.database import SessionLocal
from app.models.user import User
from sqlalchemy.future import select

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    # bcrypt only supports up to 72 bytes
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(username: str, email: str, password: str):
    async with SessionLocal() as session:
        hashed_password = get_password_hash(password)
        user = User(username=username, email=email, hashed_password=hashed_password)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

async def authenticate_user(username: str, password: str):
    async with SessionLocal() as session:
        result = await session.execute(select(User).where(User.username == username))
        user = result.scalars().first()
        if user and verify_password(password, user.hashed_password):
            return user
        return None
