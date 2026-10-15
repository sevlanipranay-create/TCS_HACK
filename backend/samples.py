from contract.models import TeamContext

SAMPLES = [
    {
        "id": "t1_canteen",
        "title": "Campus Canteen Food Wastage",
        "problem_statement": "Hostel and college canteens face severe food wastage due to unpredictable student turnout and fixed meal preparation routines. Design a system to forecast meal demand and redistribute surplus food efficiently.",
        "team": TeamContext(team_size=4, minutes_available=75, skills=[], preferred_stack="").model_dump(),
    },
    {
        "id": "t2_study",
        "title": "Peer Study Groups Before Exams",
        "problem_statement": "Students struggle to form effective study groups before exams based on subject difficulties, compatible study hours, and mutual learning goals. Create a platform that matches peers and tracks collaborative revision milestones.",
        "team": TeamContext(team_size=4, minutes_available=75, skills=["Python", "React"], preferred_stack="").model_dump(),
    },
    {
        "id": "t3_vague_pii",
        "title": "Make the campus better",
        "problem_statement": "Make the campus better. Contact asha.demo@example.com or 98765 43210 for details.",
        "team": TeamContext(team_size=3, minutes_available=60, skills=[], preferred_stack="").model_dump(),
    },
]
