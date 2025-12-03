"""add poster_path to events

Revision ID: add_poster_path
Revises: d5fafe08437a
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_poster_path'
down_revision: Union[str, None] = 'd5fafe08437a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('poster_path', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'poster_path')

