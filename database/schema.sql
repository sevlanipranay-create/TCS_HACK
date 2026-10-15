CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    problem TEXT NOT NULL,
    team TEXT NOT NULL,
    brief TEXT NOT NULL,
    last_judge TEXT
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    stage TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_states (
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (session_id, task_id)
);
