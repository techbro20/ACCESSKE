from ..models.user import User


def serialize_user(user: User) -> dict:
  profile = user.profile
  return {
    "id": user.id,
    "firstName": user.first_name,
    "lastName": user.last_name,
    "email": user.email,
    "role": user.role.value if hasattr(user.role, "value") else user.role,
    "active": user.active,
    "cohort": profile.cohort if profile else None,
    "phone": profile.phone if profile else None,
    "profession": profile.profession if profile else None,
    "skills": profile.skills if profile and profile.skills else [],
  }

