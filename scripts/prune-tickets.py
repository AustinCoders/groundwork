import json
import re
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TICKETS = ROOT / ".claude/skills/bmad-preview-ticketing/scripts/tickets.py"
states = {"done", "review"} if "--review" in sys.argv else {"done"}
args = [a for a in sys.argv[1:] if not a.startswith("--")]
initiatives = [ROOT / a for a in args] or sorted((ROOT / "_bmad-output").glob("initiative-*"))


def run(*cmd):
    out = subprocess.run(["uv", "run", str(TICKETS), *cmd], capture_output=True, text=True, cwd=ROOT).stdout
    return json.loads(out)


def split_entries(text):
    parts = re.split(r"(?m)^(?=\[\[entry\]\]\n)", text)
    return parts[0], parts[1:]


def entry_id(block):
    return int(re.search(r"(?m)^id = (\d+)", block).group(1))


def drop_after(block, keep_item):
    match = re.search(r"(?m)^after = \[(.*?)\]\s*$", block)
    if not match:
        return block
    items = [x.strip() for x in match.group(1).split(",") if x.strip()]
    kept = [x for x in items if keep_item(x.strip('"'))]
    return block[: match.start()] + "after = [" + ", ".join(kept) + "]" + block[match.end() :]


for initiative in initiatives:
    rows = run("status", str(initiative))
    rows = rows if isinstance(rows, list) else rows.get("tickets") or rows.get("rows") or []
    gone = {}
    for row in rows:
        if row["state"] in states:
            gone.setdefault(row["epic"], set()).add(row["id"])
            for key in ("story_file", "plan"):
                found = run("find", str(initiative), row["ref"])
                path = found.get(key) if isinstance(found, dict) else None
                if path and (ROOT / path).exists():
                    (ROOT / path).unlink()
    if not gone:
        print(f"{initiative.name}: nothing to prune")
        continue
    epics = tomllib.loads((initiative / "tickets.toml").read_text())["epic"]
    number = {e["slug"]: e["id"] for e in epics}
    removed = {(number[slug], i) for slug, ids in gone.items() for i in ids}
    for epic in epics:
        path = initiative / epic["slug"] / "tickets.toml"
        if not path.exists():
            continue
        head, blocks = split_entries(path.read_text())
        kept = []
        for block in blocks:
            if entry_id(block) in gone.get(epic["slug"], set()):
                continue
            block = drop_after(block, lambda x: not (re.fullmatch(r"\d+", x) and (number[epic["slug"]], int(x)) in removed))
            block = drop_after(
                block,
                lambda x: not (re.fullmatch(r"\d+\.\d+", x) and tuple(map(int, x.split("."))) in removed),
            )
            kept.append(block)
        if kept:
            path.write_text(head + "".join(kept))
        else:
            shutil.rmtree(path.parent)
    print(f"{initiative.name}: pruned {sum(len(v) for v in gone.values())} tickets")
