from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import require_admin
from ..models.user import User, UserRole
from ..utils.serializers import serialize_user

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("")
def list_users(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  users = db.query(User).order_by(User.created_at.desc()).all()
  return [serialize_user(u) for u in users]


class StatusUpdate(BaseModel):
  active: bool


@router.put("/{user_id}/status")
def update_user_status(
  user_id: str,
  payload: StatusUpdate,
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  user = db.query(User).filter(User.id == user_id).first()
  if not user:
    raise HTTPException(status_code=404, detail="User not found")

  user.active = payload.active
  db.add(user)
  db.commit()
  db.refresh(user)
  return serialize_user(user)


@router.delete("/{user_id}")
def delete_user(
  user_id: str,
  current_user: User = Depends(require_admin),
  db: Session = Depends(get_db),
):
  """Delete a user and all related data (admin only)"""
  user = db.query(User).filter(User.id == user_id).first()
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  
  # Prevent deleting yourself
  if user.id == current_user.id:
    raise HTTPException(status_code=400, detail="You cannot delete your own account")
  
  # Prevent deleting the last admin
  if user.role == UserRole.ADMIN:
    admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
    if admin_count <= 1:
      raise HTTPException(status_code=400, detail="Cannot delete the last admin user")
  
  # Delete related data
  from ..models.chat import ChatMessage
  from ..models.alumni import AlumniProfile
  
  # Delete chat messages
  db.query(ChatMessage).filter(ChatMessage.sender_id == user_id).delete()
  
  # Delete alumni profile if exists
  if user.profile:
    db.delete(user.profile)
  
  # Delete the user
  db.delete(user)
  db.commit()
  
  return {"success": True, "message": "User deleted successfully"}
