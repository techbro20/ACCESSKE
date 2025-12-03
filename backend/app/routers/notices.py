from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import require_admin
from ..models.notice import Notice
from ..schemas.notice import NoticeCreate

router = APIRouter(prefix="/api/notices", tags=["notices"])


@router.get("")
def list_notices(db: Session = Depends(get_db)):
  notices = db.execute(select(Notice).order_by(Notice.created_at.desc())).scalars().all()
  return [
    {
      "id": notice.id,
      "title": notice.title,
      "content": notice.content,
      "createdAt": notice.created_at.isoformat(),
    }
    for notice in notices
  ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_notice(
  payload: NoticeCreate,
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  notice = Notice(title=payload.title, content=payload.content)
  db.add(notice)
  db.commit()
  db.refresh(notice)
  return {
    "id": notice.id,
    "title": notice.title,
    "content": notice.content,
    "createdAt": notice.created_at.isoformat(),
  }


@router.put("/{notice_id}")
def update_notice(
  notice_id: str,
  payload: NoticeCreate,
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  notice = db.get(Notice, notice_id)
  if not notice:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")
  
  notice.title = payload.title
  notice.content = payload.content
  db.commit()
  db.refresh(notice)
  return {
    "id": notice.id,
    "title": notice.title,
    "content": notice.content,
    "createdAt": notice.created_at.isoformat(),
  }


@router.delete("/{notice_id}")
def delete_notice(
  notice_id: str,
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  notice = db.get(Notice, notice_id)
  if not notice:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")
  
  db.delete(notice)
  db.commit()
  return {"success": True}
