import sys
import json
import re
from collections import Counter

# Known skills list synced from lib/skills.ts
KNOWN_SKILLS = [
    "react", "next.js", "typescript", "javascript", "node.js", "python",
    "django", "flask", "java", "spring", "kotlin", "go", "ruby", "rails",
    "sql", "postgres", "mysql", "mongodb", "aws", "gcp", "azure", "docker",
    "kubernetes", "redis", "graphql", "rest", "html", "css", "tailwind",
    "system design", "data engineering", "ml", "machine learning", "data science",
    "product management", "design", "ux", "ui"
]

def normalize(text):
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Keep tech-specific symbols
    text = re.sub(r'[^a-zA-Z0-9\s.+#-]', ' ', text)
    text = text.lower()
    text = re.sub(r'\bjs\b', 'javascript', text)
    text = re.sub(r'\bpy\b', 'python', text)
    return text.strip()

def get_sentences(text):
    return re.split(r'[.!?\n]+', text)

def is_requirement(sentence):
    keywords = ['required', 'must', 'essential', 'proficiency', 'expert', 'strong', 'solid', 'mandatory', 'minimum']
    return any(kw in sentence.lower() for kw in keywords)

def is_negative(sentence, skill):
    pattern = r'(no|not|don\'t|without)\s+.*?\b' + re.escape(skill) + r'\b'
    return bool(re.search(pattern, sentence.lower()))

def extract_skills_from_text(text):
    norm_text = text.lower()
    found = set()
    for skill in KNOWN_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', norm_text):
            found.add(skill)
    return list(found)

def calculate_match_score(user_skills, user_experience, job):
    title = normalize(job.get('title', ''))
    description = normalize(job.get('description', ''))
    full_text = f"{title} {description}"
    
    user_skills_norm = [normalize(s) for s in user_skills if s]
    job_skills = extract_skills_from_text(full_text)
    
    if not user_skills_norm:
        return 50 # Baseline
    
    # 1. MATCHED SKILLS
    matched_skills = [s for s in user_skills_norm if s in job_skills]
    matched_count = len(matched_skills)
    
    # 2. BIDIRECTIONAL OVERLAP FORMULA (Requested by User)
    # How many of the job's required skills does the user have?
    job_skill_coverage = matched_count / len(job_skills) if job_skills else 1.0
    # How many of the user's skills are relevant to this job?
    user_skill_relevance = matched_count / len(user_skills_norm)
    
    coverage = (job_skill_coverage + user_skill_relevance) / 2
    
    # 3. CONTEXTUAL REFINEMENT
    req_bonus = 0
    neg_penalty = 0
    sentences = get_sentences(job.get('description', ''))
    for skill in user_skills_norm:
        for sent in sentences:
            if skill in sent.lower():
                if is_negative(sent, skill):
                    neg_penalty = 0.2
                elif is_requirement(sent) and skill in matched_skills:
                    req_bonus += 0.05

    # 4. SENIORITY MATCH
    experience_penalty = 0
    title_norm = title.lower()
    job_level = "mid"
    if any(kw in title_norm for kw in ['senior', 'sr', 'lead', 'architect', 'principal', 'staff']):
        job_level = "senior"
    elif any(kw in title_norm for kw in ['junior', 'jr', 'entry', 'intern', 'associate']):
        job_level = "junior"
    
    user_level = (user_experience or "mid").lower()
    if user_level == "junior" and job_level == "senior":
         experience_penalty = 0.15
    
    # 5. FINAL SCORE CALCULATION
    # Boost by coverage (requested formula)
    # coverage scales from 0 to 1
    raw_score = coverage + req_bonus - neg_penalty - experience_penalty
    raw_score = max(0, min(1, raw_score))
    
    match_score = 50 + int(raw_score * 50)
    
    # Title Bonus
    if any(s in title_norm for s in user_skills_norm):
        match_score += 15
            
    return min(100, match_score)

def main():
    try:
        data = sys.stdin.read()
        if not data:
            return
        input_data = json.loads(data)
        user_skills = input_data.get('user_skills', [])
        user_experience = input_data.get('user_experience', 'mid')
        jobs = input_data.get('jobs', [])
        
        results = []
        for job in jobs:
            score = calculate_match_score(user_skills, user_experience, job)
            job['matchScore'] = score
            results.append(job)
            
        results.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
        # Explicitly print to stdout
        sys.stdout.write(json.dumps(results))
        sys.stdout.flush()
        
    except Exception as e:
        sys.stdout.write(json.dumps([]))
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
