# backend/utils/caching.py
import os
import json
import time
from threading import Lock

class CacheManager:
    """Thread-safe file-backed and memory-backed cache with automatic TTL validation."""
    def __init__(self, cache_file="api_cache.json"):
        self.cache_file = cache_file
        self.lock = Lock()
        self.cache = {}
        self._load_cache()

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
            except Exception:
                self.cache = {}

    def _save_cache(self):
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2)
        except Exception:
            pass

    def get(self, key: str):
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                if entry.get("expiry", 0) > time.time():
                    return entry.get("value")
                else:
                    # Remove expired entry
                    del self.cache[key]
                    self._save_cache()
            return None

    def set(self, key: str, value, ttl_seconds: int):
        with self.lock:
            expiry = time.time() + ttl_seconds
            self.cache[key] = {
                "value": value,
                "expiry": expiry
            }
            self._save_cache()

    def clear(self):
        with self.lock:
            self.cache = {}
            if os.path.exists(self.cache_file):
                try:
                    os.remove(self.cache_file)
                except Exception:
                    pass

cache_manager = CacheManager()
