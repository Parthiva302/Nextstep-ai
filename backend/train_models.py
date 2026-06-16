import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
import xgboost as xgb
import pickle
import os

print("Generating synthetic data for NextStep AI ML Models...")

# 1. NextStep Score Model (Predicts 0-100 placement readiness score)
# Features: cgpa, coding_score, projects_count, num_skills, resume_score
# Label: readiness_score

np.random.seed(42)
n_samples = 1000

cgpa = np.random.uniform(5.0, 10.0, n_samples)
coding_score = np.random.randint(0, 100, n_samples)
projects_count = np.random.randint(0, 10, n_samples)
num_skills = np.random.randint(2, 20, n_samples)
resume_score = np.random.randint(40, 100, n_samples)

# A semi-realistic function for placement readiness
base_score = (
    (cgpa / 10.0) * 30 +
    (coding_score / 100.0) * 30 +
    (np.minimum(projects_count, 5) / 5.0) * 20 +
    (np.minimum(num_skills, 10) / 10.0) * 10 +
    (resume_score / 100.0) * 10
)
# Add some noise
readiness_score = np.clip(base_score + np.random.normal(0, 5, n_samples), 0, 100)

X_score = pd.DataFrame({
    'cgpa': cgpa,
    'coding_score': coding_score,
    'projects_count': projects_count,
    'num_skills': num_skills,
    'resume_score': resume_score
})
y_score = readiness_score

print("Training XGBoost Regressor for NextStep Score...")
xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
xgb_model.fit(X_score, y_score)

# 2. Career Match Engine (Predicts top role based on skills)
print("Training Random Forest Classifier for Career Match Engine...")
roles = ["Software Engineer", "Data Scientist", "Frontend Developer", "Backend Developer", "DevOps Engineer"]
skills_pool = [
    "Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB",
    "Machine Learning", "TensorFlow", "Pandas", "Java", "Spring Boot", "C++", "System Design"
]

# Generate synthetic skill profiles
X_skills = []
y_role = []
for _ in range(n_samples):
    role = np.random.choice(roles)
    y_role.append(role)
    
    # Assign specific skills based on role
    role_skills = []
    if role == "Software Engineer":
        role_skills = np.random.choice(["Java", "C++", "Python", "System Design", "SQL"], 3, replace=False).tolist()
    elif role == "Data Scientist":
        role_skills = np.random.choice(["Python", "Pandas", "Machine Learning", "TensorFlow", "SQL"], 3, replace=False).tolist()
    elif role == "Frontend Developer":
        role_skills = np.random.choice(["JavaScript", "React", "HTML/CSS"], 2, replace=False).tolist()
    elif role == "Backend Developer":
        role_skills = np.random.choice(["Node.js", "Java", "Spring Boot", "Python", "SQL", "MongoDB"], 3, replace=False).tolist()
    elif role == "DevOps Engineer":
        role_skills = np.random.choice(["AWS", "Docker", "Kubernetes", "Python", "Linux"], 3, replace=False).tolist()
        
    # Add random skills
    role_skills += np.random.choice(skills_pool, np.random.randint(1, 4), replace=False).tolist()
    X_skills.append(list(set(role_skills)))

# MultiLabelBinarizer for skills
mlb = MultiLabelBinarizer()
X_skills_encoded = mlb.fit_transform(X_skills)

rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
rf_classifier.fit(X_skills_encoded, y_role)

# Save models to disk
os.makedirs('ml_models', exist_ok=True)
with open('ml_models/nextstep_scorer.pkl', 'wb') as f:
    pickle.dump(xgb_model, f)
    
with open('ml_models/career_matcher.pkl', 'wb') as f:
    pickle.dump({'model': rf_classifier, 'mlb': mlb, 'roles': roles}, f)

print("Models successfully trained and saved to ml_models/ directory!")
