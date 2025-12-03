from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import require_admin
from ..services.administration_service import (
  get_admin_stats,
  get_alumni_by_cohort,
  get_registration_trends,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/stats")
def report_stats(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  return get_admin_stats(db)


@router.get("/cohort")
def report_cohort(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  return get_alumni_by_cohort(db)


@router.get("/trends")
def report_trends(
  _: str = Depends(require_admin),
  db: Session = Depends(get_db),
):
  return get_registration_trends(db)

