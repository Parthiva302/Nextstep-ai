from services.smart_ai_analyzer import SmartAIAnalyzer

analyzer = SmartAIAnalyzer()

# Should use Claude
result = analyzer.analyze_resume("""
John Doe
Python Developer
Skills: Python, React, PostgreSQL
""")

print(f"Model used: {result['metadata']['model_used']}")
print(f"Cost: ${result['metadata']['cost']:.4f}")

assert result['metadata']['model_used'] == 'anthropic/claude-3.5-sonnet'
print("✅ Test 1 passed: Normal operation works")
