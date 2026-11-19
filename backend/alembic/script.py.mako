"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# Alembic fills these identifiers from the revision graph when generating a migration file.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


# Put forward schema changes in upgrade so deployments can move to this revision.
def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


# Provide the inverse schema changes so this revision can be safely rolled back.
def downgrade() -> None:
    ${downgrades if downgrades else "pass"}

