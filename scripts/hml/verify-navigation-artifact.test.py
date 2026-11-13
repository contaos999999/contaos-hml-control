import importlib.util
import json
import hashlib
import tempfile
import unittest
import zipfile
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("nav_artifact", Path(__file__).with_name("verify-navigation-artifact.py"))
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

class ArtifactTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "audit.zip"
        self.report = {"schema":"contaos.navigation.audit.v3","records":[{"status":"PASS"}],"summary":{"expected":52,"observed":1,"passed":1,"failed":0},"sessionVerified":True,"masterVerified":True,"organizationVerified":True,"logoutVerified":False,"httpErrors":0,"transportErrors":0,"pageErrors":0,"blockedMutations":0,"networkFailure":None}

    def pack(self, tamper=False):
        report=json.dumps(self.report).encode()
        digest=hashlib.sha256(report).hexdigest()
        with zipfile.ZipFile(self.path,"w") as z:
            z.writestr("report.json",report)
            z.writestr("SHA256SUMS", ("0"*64 if tamper else digest)+"  report.json\n")
        return hashlib.sha256(self.path.read_bytes()).hexdigest()

    def test_valid_zip_does_not_promote_global_controls(self):
        digest=self.pack()
        result=mod.verify(self.path,digest)
        self.assertEqual(result["passedCandidates"],1)
        self.assertFalse(result["globalControlsPassed"])

    def test_zip_hash_mismatch(self):
        self.pack()
        with self.assertRaisesRegex(ValueError,"ZIP_HASH_MISMATCH"):
            mod.verify(self.path,"f"*64)

    def test_report_digest_tamper(self):
        digest=self.pack(tamper=True)
        with self.assertRaisesRegex(ValueError,"REPORT_HASH_MISMATCH"):
            mod.verify(self.path,digest)

    def test_forged_summary(self):
        self.report["summary"]["passed"]=2
        digest=self.pack()
        with self.assertRaisesRegex(ValueError,"REPORT_STATUS_COUNTS"):
            mod.verify(self.path,digest)

if __name__ == "__main__":
    unittest.main()
