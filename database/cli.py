import os
from pathlib import Path
import sys

# Support running directly or as a module
if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from database import repository
else:
    from . import repository


def stats() -> None:
    repository.init()
    with repository._conn() as conn:
        tables = ["sessions", "messages", "tasks", "judge_reports"]
        for table in tables:
            cursor = conn.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table}: {count}")


def reset() -> None:
    db_path = repository._get_db_path()
    if not os.path.exists(db_path):
        print(f"Database file '{db_path}' does not exist.")
        return

    confirmation = input(f"Are you sure you want to delete '{db_path}'? (y/N): ").strip().lower()
    if confirmation == "y":
        for suffix in ["", "-wal", "-shm"]:
            target = db_path + suffix
            if os.path.exists(target):
                try:
                    os.remove(target)
                except OSError as err:
                    print(f"Error removing {target}: {err}")
        print(f"Deleted '{db_path}'.")
    else:
        print("Reset aborted.")


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in ("reset", "stats"):
        print("Usage: python -m database.cli reset | stats")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "stats":
        stats()
    elif cmd == "reset":
        reset()


if __name__ == "__main__":
    main()
