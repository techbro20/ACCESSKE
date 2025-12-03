from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from typing import Optional

from ..core.database import get_db
from ..core.security import require_admin
from ..models.event import Event
from ..schemas.event import EventCreate
from ..utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("")
def list_events(db: Session = Depends(get_db)):
  events = db.execute(select(Event).order_by(Event.date.desc())).scalars().all()
  return [
    {
      "id": ev.id,
      "title": ev.title,
      "description": ev.description,
      "date": ev.date.isoformat(),
      "venue": ev.venue,
      "posterPath": ev.poster_path,
      "createdAt": ev.created_at.isoformat(),
    }
    for ev in events
  ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(
  title: str = Form(...),
  description: str = Form(...),
  date: str = Form(...),
  venue: str = Form(...),
  poster: Optional[UploadFile] = File(None),
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  # Parse date - handle datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
  try:
    if "T" in date and len(date) == 16:  # datetime-local format: YYYY-MM-DDTHH:mm
      event_date = datetime.fromisoformat(date)
    elif "Z" in date:
      event_date = datetime.fromisoformat(date.replace("Z", "+00:00"))
    else:
      event_date = datetime.fromisoformat(date)
  except ValueError:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format")
  
  # Create event first to get ID
  event = Event(
    title=title,
    description=description,
    date=event_date,
    venue=venue,
  )
  db.add(event)
  db.commit()
  db.refresh(event)
  
  # Handle file upload if provided
  poster_path = None
  if poster:
    poster_path = await save_uploaded_file(poster, event.id)
    event.poster_path = poster_path
    db.commit()
    db.refresh(event)
  
  return {
    "id": event.id,
    "title": event.title,
    "description": event.description,
    "date": event.date.isoformat(),
    "venue": event.venue,
    "posterPath": event.poster_path,
    "createdAt": event.created_at.isoformat(),
  }


@router.put("/{event_id}")
async def update_event(
  event_id: str,
  title: str = Form(...),
  description: str = Form(...),
  date: str = Form(...),
  venue: str = Form(...),
  poster: Optional[UploadFile] = File(None),
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  event = db.get(Event, event_id)
  if not event:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
  
  # Update basic fields
  event.title = title
  event.description = description
  # Parse date - handle datetime-local format (YYYY-MM-DDTHH:mm) and ISO format
  try:
    if "T" in date and len(date) == 16:  # datetime-local format: YYYY-MM-DDTHH:mm
      event_date = datetime.fromisoformat(date)
    elif "Z" in date:
      event_date = datetime.fromisoformat(date.replace("Z", "+00:00"))
    else:
      event_date = datetime.fromisoformat(date)
  except ValueError:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format")
  event.date = event_date
  event.venue = venue
  
  # Handle file upload if provided
  if poster:
    # Delete old file if exists
    if event.poster_path:
      delete_file(event.poster_path)
    # Save new file
    event.poster_path = await save_uploaded_file(poster, event.id)
  
  db.commit()
  db.refresh(event)
  return {
    "id": event.id,
    "title": event.title,
    "description": event.description,
    "date": event.date.isoformat(),
    "venue": event.venue,
    "posterPath": event.poster_path,
    "createdAt": event.created_at.isoformat(),
  }


@router.delete("/{event_id}")
def delete_event(
  event_id: str,
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  event = db.get(Event, event_id)
  if not event:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
  
  # Delete associated file if exists
  if event.poster_path:
    delete_file(event.poster_path)
  
  db.delete(event)
  db.commit()
  return {"success": True}
