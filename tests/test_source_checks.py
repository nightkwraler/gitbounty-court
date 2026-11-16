import subprocess
import sys
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ContractSourceTests(unittest.TestCase):
    def test_contract_source_checks(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "validate_contract.py")],
            capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("source checks passed", result.stdout)

    def test_demo_warns_not_live(self):
        html = (ROOT / "demo" / "index.html").read_text()
        self.assertIn("NOT CONNECTED TO LIVE NETWORKS", html)
        self.assertIn("no transaction sent", html)

if __name__ == "__main__":
    unittest.main()
