from pathlib import Path
import sys

source = Path(__file__).resolve().parents[1] / "contracts" / "gitbounty_court.py"
text = source.read_text()

required = [
    "class Contract(gl.Contract):",
    "def configure_bounty(",
    "def adjudicate_pull_request(",
    "gl.nondet.web.get(pr_url)",
    "gl.nondet.web.get(files_url)",
    "gl.eq_principle.prompt_non_comparative(",
    "def get_verdict(",
]
missing = [item for item in required if item not in text]
if missing:
    print("Contract source checks failed:")
    for item in missing:
        print(f" - missing: {item}")
    sys.exit(1)

if "INCONCLUSIVE" not in text or "untrusted evidence" not in text:
    print("Contract source checks failed: missing safety / fallback language")
    sys.exit(1)

print("Contract source checks passed.")
print("NOTE: this is a source sanity check, not a GenVM compile or deployment.")
