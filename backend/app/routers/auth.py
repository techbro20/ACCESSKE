from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import create_access_token, get_password_hash, verify_password
from ..models.alumni import AlumniProfile
from ..models.user import InviteToken, User, UserRole
from ..schemas.user import UserCreate, UserLogin
from ..utils.serializers import serialize_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
  email = payload.email.lower()
  existing = db.query(User).filter(User.email == email).first()
  if existing:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

  # Validate invite token (required)
  invite = (
    db.query(InviteToken)
    .filter(InviteToken.token == payload.invite_token, InviteToken.used.is_(False))
    .first()
  )
  if not invite:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired invite token")
  
  # Check if token has expired
  if invite.expires_at and invite.expires_at < datetime.now(timezone.utc):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token has expired")
  
  # Mark token as used
  invite.used = True

  user = User(
    email=email,
    first_name=payload.first_name,
    last_name=payload.last_name,
    hashed_password=get_password_hash(payload.password),
    role=UserRole.ALUMNI,
    active=True,
  )
  profile = AlumniProfile(user=user, cohort=None, phone=None, profession=None, skills=[])
  db.add(user)
  db.add(profile)
  db.commit()
  db.refresh(user)

  return {"success": True}


@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
  email = payload.email.lower()
  user = db.query(User).filter(User.email == email).first()
  if not user or not verify_password(payload.password, user.hashed_password):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

  token = create_access_token({"sub": user.id})
  return {"token": token, "user": serialize_user(user)}

