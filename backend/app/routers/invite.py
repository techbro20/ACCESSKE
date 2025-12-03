from datetime import datetime, timedelta, timezone
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import require_admin
from ..models.user import InviteToken

router = APIRouter(prefix="/api/invite", tags=["invite"])


@router.post("/generate")
def generate_invite(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  token_value = uuid.uuid4().hex
  invite = InviteToken(
    token=token_value,
    expires_at=datetime.now(timezone.utc) + timedelta(days=14),
  )
  db.add(invite)
  db.commit()
  db.refresh(invite)
  return {
    "id": invite.id,
    "token": invite.token,
    "expiresAt": invite.expires_at.isoformat() if invite.expires_at else None,
  }


@router.get("/list")
def list_invites(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  invites = db.query(InviteToken).order_by(InviteToken.created_at.desc()).limit(50).all()
  return [
    {
      "id": invite.id,
      "token": invite.token,
      "createdAt": invite.created_at.isoformat(),
      "expiresAt": invite.expires_at.isoformat() if invite.expires_at else None,
      "used": invite.used,
    }
    for invite in invites
  ]

