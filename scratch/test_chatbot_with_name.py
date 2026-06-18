import requests
import json

url = "http://127.0.0.1:8000/api/mentor/chat"
payload = {
    "student_id": "5fa16316-be24-46f4-a42d-54c6527eb326", # Yathish UUID
    "question": "Can you greet me by my name and tell me my target career goal?"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending POST request to {url}...")
    res = requests.post(url, headers=headers, json=payload, timeout=20)
    print(f"Status Code: {res.status_code}")
    print("Response:")
    print(json.dumps(res.json(), indent=2))
except Exception as e:
    print(f"Request failed: {e}")
