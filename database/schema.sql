CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    problem TEXT NOT NULL,
    team_json TEXT NOT NULL,
    brief_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    role TEXT NOT NULL CHECK(role IN ('user', 'mentor')),
    content TEXT NOT NULL,
    stage TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, id);

CREATE TABLE IF NOT EXISTS tasks (
    session_id TEXT NOT NULL REFERENCES sessions(id),
    task_id TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0, 1)),
    updated_at TEXT NOT NULL,
    PRIMARY KEY(session_id, task_id)
);

CREATE TABLE IF NOT EXISTS judge_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    report_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_judge_reports_session ON judge_reports(session_id, id);
