# backend/services/github_service.py
import httpx
from datetime import datetime, timezone
from typing import Dict, Any
from utils.caching import cache_manager
from utils.logger import logger
from config.settings import settings

class GitHubService:
    """Consolidates GitHub REST API profile requests, extracts metrics and scores, and caches results for 6 hours."""
    
    def generate_simulated_profile(self, username: str) -> Dict[str, Any]:
        """Generates a realistic, consistent fallback profile when rate limited or offline."""
        import random
        # Seed by username hash so the same user gets consistent simulated stats
        seed_val = sum(ord(c) for c in username)
        random.seed(seed_val)
        
        # Pick realistic values based on seed
        public_repos = random.randint(8, 24)
        followers = random.randint(2, 28)
        following = random.randint(5, 30)
        total_stars = random.randint(1, 15)
        total_forks = random.randint(0, 5)
        active_repos = random.randint(2, max(3, public_repos // 2))
        account_age_years = round(random.uniform(0.5, 4.0), 1)
        
        langs_pool = ["Python", "JavaScript", "TypeScript", "HTML", "CSS", "C++", "Java"]
        random.shuffle(langs_pool)
        top_languages = langs_pool[:random.randint(2, 4)]
        
        # Formula calculations matching github_service scoring
        repo_score = min(public_repos / 20, 1.0) * 30
        lang_score = min(len(top_languages) / 5, 1.0) * 20
        star_score = min(total_stars / 50, 1.0) * 15
        activity_score = min(active_repos / 10, 1.0) * 20
        maturity_score = min(account_age_years / 3, 1.0) * 15
        github_score = round(repo_score + lang_score + star_score + activity_score + maturity_score)
        
        strengths = ["Active contributor on GitHub", f"Matured developer profile ({account_age_years} years old)"]
        weaknesses = []
        recommendations = ["Continue committing to your personal repositories to build a strong history."]
        
        if total_stars < 5:
            weaknesses.append("Low star count — optimize documentation and project quality")
            recommendations.append("Establish detailed README guides for projects.")
        if active_repos < 3:
            weaknesses.append("Low recent activity — commit code more regularly")
            recommendations.append("Contribute to open source projects.")
            
        if len(top_languages) >= 3:
            strengths.append(f"Strong language diversity: {', '.join(top_languages[:3])}")
        else:
            weaknesses.append("Low language diversity — explore new backend/frontend technologies")
            recommendations.append("Learn a new programming language to expand your tech stack.")
            
        return {
            "username": username,
            "avatar_url": f"https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150&auto=format&fit=crop",
            "bio": f"Full Stack Developer (Simulated Profile for {username} - GitHub Rate Limited)",
            "name": username.capitalize(),
            "followers": followers,
            "following": following,
            "public_repos": public_repos,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "top_languages": top_languages,
            "active_repos": active_repos,
            "account_age_years": account_age_years,
            "github_score": github_score,
            "analysis": {
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendations": recommendations
            }
        }

    async def analyze_profile(self, username: str) -> Dict[str, Any]:
        username = username.strip()
        cache_key = f"github_profile:{username.lower()}"
        
        # Fetch from cache if exists
        cached = cache_manager.get(cache_key)
        if cached:
            logger.info(f"Serving cached GitHub profile for username: {username}")
            return cached

        headers = {"Accept": "application/vnd.github.v3+json"}
        token = settings.GITHUB_TOKEN
        if token:
            headers["Authorization"] = f"token {token}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Fetch profile details
                user_res = await client.get(f"https://api.github.com/users/{username}", headers=headers)
                if user_res.status_code == 404:
                    return {"error": "GitHub profile not found."}
                if user_res.status_code == 403:
                    logger.warning(f"GitHub API rate limit reached for {username}. Serving simulated profile.")
                    simulated = self.generate_simulated_profile(username)
                    cache_manager.set(cache_key, simulated, ttl_seconds=21600)
                    return simulated
                if user_res.status_code != 200:
                    logger.warning(f"GitHub API returned HTTP {user_res.status_code} for {username}. Serving simulated profile.")
                    simulated = self.generate_simulated_profile(username)
                    cache_manager.set(cache_key, simulated, ttl_seconds=21600)
                    return simulated
                user = user_res.json()

                # Fetch repos (up to 100 entries sorted by update time)
                repos_res = await client.get(
                    f"https://api.github.com/users/{username}/repos",
                    headers=headers,
                    params={"per_page": 100, "sort": "updated"}
                )
                repos = repos_res.json() if repos_res.status_code == 200 else []
        except Exception as e:
            logger.error(f"Error fetching GitHub profile for {username}: {e}. Serving simulated profile.")
            simulated = self.generate_simulated_profile(username)
            cache_manager.set(cache_key, simulated, ttl_seconds=21600)
            return simulated

        # Extract counts
        total_stars = sum(r.get("stargazers_count", 0) for r in repos)
        total_forks = sum(r.get("forks_count", 0) for r in repos)
        public_repos = user.get("public_repos", 0)
        followers = user.get("followers", 0)
        following = user.get("following", 0)

        # Languages diversity
        lang_counts = {}
        for r in repos:
            lang = r.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
        top_languages = sorted(lang_counts, key=lang_counts.get, reverse=True)[:6]

        # Calculate active repos (updated in last 180 days)
        now = datetime.now(timezone.utc)
        active_repos = 0
        for r in repos:
            updated_str = r.get("updated_at")
            if updated_str:
                try:
                    updated_date = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                    if (now - updated_date).days < 180:
                        active_repos += 1
                except ValueError:
                    pass

        # Calculate maturity age (years)
        created_str = user.get("created_at", "2020-01-01T00:00:00Z")
        try:
            created_date = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            account_age_years = max((now - created_date).days / 365, 0.1)
        except ValueError:
            account_age_years = 1.0

        # Heuristic scoring formula (up to 100)
        repo_score = min(public_repos / 20, 1.0) * 30
        lang_score = min(len(lang_counts) / 5, 1.0) * 20
        star_score = min(total_stars / 50, 1.0) * 15
        activity_score = min(active_repos / 10, 1.0) * 20
        maturity_score = min(account_age_years / 3, 1.0) * 15
        github_score = round(repo_score + lang_score + star_score + activity_score + maturity_score)

        # Build strengths, weaknesses, and recommendations lists
        strengths, weaknesses, recommendations = [], [], []
        if len(top_languages) >= 3:
            strengths.append(f"Strong language diversity: {', '.join(top_languages[:3])}")
        if total_stars >= 5:
            strengths.append(f"Project quality recognized by {total_stars} stars")
        if active_repos >= 3:
            strengths.append(f"{active_repos} repositories actively updated recently")

        if public_repos < 5:
            weaknesses.append("Low repository count — create more public code repositories")
        if total_stars < 3:
            weaknesses.append("Low star count — optimize documentation and project quality")
        if active_repos < 2:
            weaknesses.append("Low recent activity — commit code more regularly")

        recommendations.append("Establish detailed README guides for projects.")
        recommendations.append("Contribute to open source projects.")
        recommendations.append(f"Build a complex project using {top_languages[0] if top_languages else 'Python'}.")

        result = {
            "username": username,
            "avatar_url": user.get("avatar_url", ""),
            "bio": user.get("bio", ""),
            "name": user.get("name", username),
            "followers": followers,
            "following": following,
            "public_repos": public_repos,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "top_languages": top_languages,
            "active_repos": active_repos,
            "account_age_years": round(account_age_years, 1),
            "github_score": github_score,
            "analysis": {
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendations": recommendations
            }
        }

        # Cache results for 6 hours (21,600 seconds)
        cache_manager.set(cache_key, result, ttl_seconds=21600)
        return result

github_service = GitHubService()
