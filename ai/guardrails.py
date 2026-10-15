"""Guardrails for PII redaction and coaching guardrails.

Includes:
- redact_pii: Redacts emails and phone numbers while keeping dates untouched.
- is_solution_dump: Detects requests attempting to delegate full solution generation.
- coaching_redirect: Friendly coaching response redirecting student team to coachable actions.
"""
import re
from typing import Dict, Any


def redact_pii(text: str) -> str:
    """Redacts emails and phone numbers from text while preserving dates.

    Test examples:
    1. 'Reach me at test@example.com for info.' -> 'Reach me at [email] for info.'
    2. 'Call +91-9876543210 or 98765 43210 today.' -> 'Call [phone] or [phone] today.'
    3. 'Event on 2026-10-15 at 14:00.' -> 'Event on 2026-10-15 at 14:00.'
    4. 'Contact +91 9876543210 right now.' -> 'Contact [phone] right now.'
    5. 'Simple number 9876543210 here.' -> 'Simple number [phone] here.'
    6. 'Meeting on 15-10-2026 with no phone.' -> 'Meeting on 15-10-2026 with no phone.'
    """
    if not text:
        return ""

    # Redact email addresses
    email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    redacted = re.sub(email_pattern, "[email]", text)

    # Redact phone numbers (10 digits with optional country prefix, spaces, dashes)
    # Does not match ISO dates YYYY-MM-DD or DD-MM-YYYY (which have 8 digits: 4+2+2)
    phone_pattern = (
        r"(?:\+\d{1,3}[-.\s]?)?"
        r"(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{5}[-.\s]?\d{5}\b|\b\d{10}\b)"
    )
    redacted = re.sub(phone_pattern, "[phone]", redacted)

    return redacted


def is_solution_dump(message: str) -> bool:
    """Determines if the message asks the mentor to write the full solution/code."""
    if not message:
        return False

    msg = message.lower().strip()

    # Exact trigger phrases
    fixed_phrases = [
        "do everything",
        "do it for us",
        "give the final answer",
        "just give the final answer",
        "solve it for us",
        "build the whole",
        "build the entire",
        "write the whole",
        "write the entire",
        "write the complete",
        "write all the code",
        "generate the full code",
        "generate the whole project",
        "write the full code",
        "complete code for the whole project",
        "complete code for the entire project",
        "write everything for us",
        "give us the complete solution",
        "give me the complete solution",
        "give us the full solution",
        "give me the full solution",
    ]
    if any(phrase in msg for phrase in fixed_phrases):
        return True

    # Pattern match for action + scope + target
    actions = ["write", "give", "generate", "code", "create", "build", "provide", "make"]
    scopes = ["complete", "full", "entire", "whole", "all"]
    targets = ["code", "solution", "app", "project", "application", "system", "program"]

    for action in actions:
        for scope in scopes:
            for target in targets:
                pattern = rf"\b{action}\b[\w\s]{{0,35}}\b{scope}\b[\w\s]{{0,35}}\b{target}\b"
                if re.search(pattern, msg):
                    return True

    return False


def coaching_redirect(stage: str) -> Dict[str, Any]:
    """Returns a coaching response refusing the full solution with actionable alternatives."""
    valid_stage = stage if stage in ["understand", "users", "ideate", "build", "validate", "pitch"] else "understand"

    stage_actions = {
      "understand": [
        "Restate the core problem statement into one crisp sentence",
        "Identify the primary user persona experiencing the biggest pain point",
        "List 3 baseline technical assumptions to keep the scope bounded"
      ],
      "users": [
        "Pick one target persona to anchor your 3-minute demo flow",
        "Draft 5 realistic test inputs including 1 edge case",
        "Define fast acceptance criteria for primary user tasks"
      ],
      "ideate": [
        "Weigh 2 to 3 architectural approaches with clear trade-offs",
        "Select your 3 must-have features and postpone nice-to-haves",
        "Outline a concrete 5-step demo script"
      ],
      "build": [
        "Lock API contracts between frontend and backend components",
        "Break the first must-have feature into a 15-minute coding sprint",
        "Run an initial end-to-end trace with mock data"
      ],
      "validate": [
        "Test your 5 sample inputs and fix blocking bugs only",
        "Verify system error handling for empty or malformed inputs",
        "Document 2 known limitations honestly for the jury"
      ],
      "pitch": [
        "Map your talking points to the 6-slide jury outline",
        "Rehearse the 90-second live demo path twice end-to-end",
        "Prepare crisp answers for likely technical architecture questions"
      ]
    }

    actions = stage_actions.get(valid_stage, stage_actions["understand"])

    reply = (
        f"I cannot write the complete solution or full code for you, as this is your team's hackathon project. "
        f"However, I can coach you through key decisions. "
        f"At this {valid_stage} stage, we can: "
        f"1) {actions[0]}; "
        f"2) {actions[1]}; "
        f"3) {actions[2]}. "
        f"Your call on which one to tackle first."
    )

    follow_up_questions = [
        f"Which of these 3 actions would help your team make the fastest progress right now?",
        f"What is the single biggest technical question blocking your team in the {valid_stage} stage?"
    ]

    return {
        "reply": reply,
        "stage": valid_stage,
        "follow_up_questions": follow_up_questions,
        "guardrail_triggered": True,
        "source": "rules"
    }
