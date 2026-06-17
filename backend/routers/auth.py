# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db
from models.schema import Student

router = APIRouter(prefix="/api/students", tags=["Auth"])

class StudentLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login_student(data: StudentLogin, db: Session = Depends(get_db)):
    """Simple login route fallback for checking legacy records."""
    student = db.query(Student).filter(Student.email == data.email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Account not found. Please register.")
    return {"id": student.id, "email": student.email, "message": "Login successful"}
