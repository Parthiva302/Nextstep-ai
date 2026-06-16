from services.smart_ai_analyzer import SmartAIAnalyzer
from models.quota_tracker import QuotaTracker
from config import Config

analyzer = SmartAIAnalyzer()

# Simulate cost limit exceeded
tracker = QuotaTracker(Config.DATABASE_URL)

# Log fake high cost
for i in range(100):
    tracker.log_usage(
        model="test",
        tokens_input=100000,
        tokens_output=100000,
        cost=0.50,
        status="success"
    )

# Now daily limit should be exceeded
# Next call should use free model
result = analyzer.analyze_resume("Test resume")

print(f"Model used: {result['metadata']['model_used']}")

assert "free" in result['metadata']['model_used'].lower() or \
       "mistral" in result['metadata']['model_used'].lower()
print("✅ Test 2 passed: Fallback to free model works")
