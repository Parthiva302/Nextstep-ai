import os

from sqlalchemy import create_engine, text


database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("Set DATABASE_URL before running this script.")

engine = create_engine(database_url)
with engine.connect() as conn:
    print("Altering chat_messages table to make student_id nullable...")
    conn.execute(text("ALTER TABLE chat_messages ALTER COLUMN student_id DROP NOT NULL;"))
    conn.commit()
    print("Constraint updated successfully!")
