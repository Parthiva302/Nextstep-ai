import pickle
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'ml_models')

# Load models if they exist
score_model = None
career_model_data = None

try:
    with open(os.path.join(MODELS_DIR, 'nextstep_scorer.pkl'), 'rb') as f:
        score_model = pickle.load(f)
        
    with open(os.path.join(MODELS_DIR, 'career_matcher.pkl'), 'rb') as f:
        career_model_data = pickle.load(f)
except Exception as e:
    print(f"Warning: ML Models not found or failed to load. Did you run train_models.py? Error: {e}")

def predict_nextstep_score(cgpa, coding_score, projects_count, num_skills, resume_score):
    """Predicts the NextStep Score (0-100) using the trained XGBoost model."""
    if score_model is None:
        # Fallback heuristic
        return int(min((cgpa*3) + (coding_score*0.25) + (projects_count*4) + (num_skills*2) + (resume_score*0.25), 100))
        
    X = pd.DataFrame({
        'cgpa': [cgpa],
        'coding_score': [coding_score],
        'projects_count': [projects_count],
        'num_skills': [num_skills],
        'resume_score': [resume_score]
    })
    
    score = score_model.predict(X)[0]
    return int(max(0, min(100, score)))

def predict_career_matches(skills_list):
    """Predicts the top career matches based on a list of skills using Random Forest."""
    if career_model_data is None or not skills_list:
        # Fallback
        return [
            {"role": "Software Engineer", "match_percentage": 85},
            {"role": "Frontend Developer", "match_percentage": 70}
        ]
        
    mlb = career_model_data['mlb']
    model = career_model_data['model']
    roles = career_model_data['roles']
    
    # Filter out skills that MLB hasn't seen
    known_skills = [s for s in skills_list if s in mlb.classes_]
    
    if not known_skills:
        return [{"role": "Software Engineer", "match_percentage": 60}]
        
    X_encoded = mlb.transform([known_skills])
    probs = model.predict_proba(X_encoded)
    
    # Probabilities for each class
    role_probs = []
    for i, role in enumerate(model.classes_):
        # Predict_proba returns list of arrays for multi-output or just array for single output
        if isinstance(probs, list):
            prob = probs[i][0][1] # Probability of class 1 for this label
            role_probs.append({"role": role, "match_percentage": int(prob * 100)})
        else:
            prob = probs[0][i]
            role_probs.append({"role": role, "match_percentage": int(prob * 100)})
            
    # Sort by match percentage desc
    role_probs.sort(key=lambda x: x["match_percentage"], reverse=True)
    return role_probs[:3] # Top 3 matches
