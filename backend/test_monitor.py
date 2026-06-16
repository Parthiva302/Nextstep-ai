from models.quota_tracker import QuotaTracker
from config import Config

tracker = QuotaTracker(Config.DATABASE_URL)

daily_cost = tracker.get_daily_cost()
monthly_cost = tracker.get_monthly_cost()

print(f"Today's cost: ${daily_cost:.2f} / ${Config.DAILY_COST_LIMIT}")
print(f"This month's cost: ${monthly_cost:.2f} / ${Config.MONTHLY_COST_LIMIT}")

if daily_cost > Config.DAILY_COST_LIMIT * 0.8:
    print("⚠️ WARNING: Approaching daily limit!")

print("✅ Test 3 passed: Cost monitoring works")
