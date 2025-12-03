from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user, require_admin, get_password_hash
from ..models.alumni import AlumniProfile
from ..models.user import User, UserRole
from ..schemas.alumni import ProfileUpdate
from ..utils.serializers import serialize_user

router = APIRouter(prefix="/api/alumni", tags=["alumni"])


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
  return serialize_user(current_user)


@router.put("/me")
def update_my_profile(
  payload: ProfileUpdate,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  changed = False
  if payload.first_name:
    current_user.first_name = payload.first_name
    changed = True
  if payload.last_name:
    current_user.last_name = payload.last_name
    changed = True

  profile = current_user.profile or AlumniProfile(user=current_user)
  if payload.cohort is not None:
    profile.cohort = payload.cohort
    changed = True
  if payload.phone is not None:
    profile.phone = payload.phone
    changed = True
  if payload.profession is not None:
    profile.profession = payload.profession
    changed = True
  if payload.skills is not None:
    profile.skills = payload.skills
    changed = True
  
  # Allow password change for admins
  if payload.password and current_user.role == UserRole.ADMIN:
    current_user.hashed_password = get_password_hash(payload.password)
    changed = True

  if changed:
    db.add(current_user)
    db.add(profile)
    db.commit()
    db.refresh(current_user)
  return serialize_user(current_user)


@router.get("")
def list_alumni(
  _: User = Depends(require_admin),
  db: Session = Depends(get_db),
):
  users = db.query(User).filter(User.role == UserRole.ALUMNI).order_by(User.first_name).all()
  return [serialize_user(u) for u in users]


@router.get("/search")
def search_alumni(
  q: str = Query(..., min_length=2),
  _: User = Depends(require_admin),
  db: Session = Depends(get_db),
):
  query = f"%{q.lower()}%"
  users = (
    db.query(User)
    .outerjoin(AlumniProfile)
    .filter(User.role == UserRole.ALUMNI)
    .filter(
      or_(
        func.lower(User.first_name).like(query),
        func.lower(User.last_name).like(query),
        func.lower(User.email).like(query),
        func.lower(func.coalesce(AlumniProfile.cohort, "")).like(query),
      )
    )
    .limit(20)
    .all()
  )
  return [serialize_user(u) for u in users]


@router.get("/{alumni_id}")
def get_alumni_detail(
  alumni_id: str,
  _: User = Depends(require_admin),
  db: Session = Depends(get_db),
):
  user = db.query(User).filter(User.id == alumni_id, User.role == UserRole.ALUMNI).first()
  if not user:
    raise HTTPException(status_code=404, detail="Alumni not found")
  return serialize_user(user)


@router.put("/{alumni_id}")
def update_alumni(
  alumni_id: str,
  payload: ProfileUpdate,
  _: User = Depends(require_admin),
  db: Session = Depends(get_db),
):
  user = db.query(User).filter(User.id == alumni_id, User.role == UserRole.ALUMNI).first()
  if not user:
    raise HTTPException(status_code=404, detail="Alumni not found")

  if payload.first_name:
    user.first_name = payload.first_name
  if payload.last_name:
    user.last_name = payload.last_name

  profile = user.profile or AlumniProfile(user=user)
  if payload.cohort is not None:
    profile.cohort = payload.cohort
  if payload.phone is not None:
    profile.phone = payload.phone
  if payload.profession is not None:
    profile.profession = payload.profession
  if payload.skills is not None:
    profile.skills = payload.skills

  db.add(user)
  db.add(profile)
  db.commit()
  db.refresh(user)

  return serialize_user(user)

