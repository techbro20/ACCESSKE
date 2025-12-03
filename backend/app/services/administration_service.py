from collections import OrderedDict
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.alumni import AlumniProfile
from ..models.event import Event
from ..models.notice import Notice
from ..models.user import User, UserRole


def get_admin_stats(db: Session) -> dict:
  total_alumni = db.query(User).filter(User.role == UserRole.ALUMNI).count()
  active_users = db.query(User).filter(User.active.is_(True)).count()
  inactive_users = db.query(User).filter(User.active.is_(False)).count()
  total_events = db.query(Event).count()
  total_notices = db.query(Notice).count()

  return {
    "totalAlumni": total_alumni,
    "activeUsers": active_users,
    "inactiveUsers": inactive_users,
    "totalEvents": total_events,
    "totalNotices": total_notices,
    "pendingApprovals": inactive_users,
  }


def get_alumni_by_cohort(db: Session) -> list[dict]:
  rows = (
    db.query(AlumniProfile.cohort, func.count(AlumniProfile.id))
    .group_by(AlumniProfile.cohort)
    .all()
  )
  return [
    {"cohort": cohort or "N/A", "count": count}
    for cohort, count in rows
  ]


def get_registration_trends(db: Session, months: int = 12) -> list[dict]:
  users = db.query(User).order_by(User.created_at.desc()).limit(1000).all()
  buckets: "OrderedDict[str, int]" = OrderedDict()
  for user in reversed(users):
    if not user.created_at:
      continue
    key = user.created_at.strftime("%b %Y")
    buckets[key] = buckets.get(key, 0) + 1

  items = list(buckets.items())
  if months:
    items = items[-months:]
  return [{"month": month, "count": count} for month, count in items]

