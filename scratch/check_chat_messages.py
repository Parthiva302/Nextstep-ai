import os

from sqlalchemy import create_engine, text


database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("Set DATABASE_URL before running this script.")

engine = create_engine(database_url)
with engine.connect() as conn:
    res = conn.execute(
        text(
            "SELECT column_name, data_type "
            "FROM information_schema.columns "
            "WHERE table_name = 'chat_messages';"
        )
    )
    for row in res:
        print(row)
