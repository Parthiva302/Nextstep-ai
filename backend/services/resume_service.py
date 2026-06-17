# backend/services/resume_service.py
from services.resume_parser import extract_text_from_pdf
from services.ai_service import ai_service
from typing import Dict, Any

class ResumeService:
    """Extracts text content from uploaded PDF resumes and runs AI parsing evaluations."""
    
    def parse_and_analyze(self, pdf_bytes: bytes) -> Dict[str, Any]:
        text = extract_text_from_pdf(pdf_bytes)
        if not text:
            return {"error": "Could not extract readable text from PDF resume."}
            
        analysis = ai_service.analyze_resume(text)
        return {
            "text": text,
            "analysis": analysis
        }

resume_service = ResumeService()
