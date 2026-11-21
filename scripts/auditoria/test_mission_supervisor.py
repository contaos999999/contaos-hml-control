"""N01-N17: provas offline do supervisor read-only, sem criar status/merge.

Tests use synthetic data strictly as negative fixtures, not GitHub evidence.
"""
import copy
import importlib.util
import json
import pathlib
import tempfile
import unittest

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("contaos_mission_supervisor", HERE / "mission-supervisor.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

H = "a" * 40
B = "b" * 40
C = "c" * 40
ID = "review-001"


def contract():
    return {
        "schema": "contaos.mission.v1",
        "mission_id": "P0-AUD-UNIVERSAL-001",
        "repo": "contaos999999/contaos-hml-control",
        "state": "ACTIVE",
        "target": {"pr": 679, "head": H, "branch": "main"},
        "allowed_dependencies": [690],
        "activation_authorized": False,
        "requirements": {"required_checks": list(mod.REQUIRED)},
        "immutable_plan": {
            "path": "docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md",
            "blob": C,
        },
    }


def evidence():
    return {
        "repo": "contaos999999/contaos-hml-control",
        "pr": 690,
        "head": H,
        "live_head": H,
        "base": B,
        "live_base": B,
        "target_branch": "main",
        "contract_source": "protected-main",
        "contract_blob": C,
        "contract_integrity_verified": True,
        "plan_blob": C,
        "tooling": "available",
        "attempts_without_delta": 0,
        "lock_conflict": False,
        "author": "contaos9999",
        "reviewer": "Edivan5002",
        "runner_status": "completed",
        "event": "pull_request",
        "candidate_sha": H,
        "checks": [
            {"name": name, "sha": H, "run_id": str(i + 1),
             "status": "completed", "conclusion": "success"}
            for i, name in enumerate(mod.REQUIRED)
        ],
        "review": {"id": ID, "head": H, "state": "APPROVED", "login": "Edivan5002"},
        "owner_authorization": {"verified": True, "review_id": ID, "head": H, "base": B, "revoked": False},
        "independent_audit": {"verified_pass": True, "head": H},
        "publisher": {"available": True},
    }


def codes(result):
    return [it["code"] for it in result["issues"]]


class MissionSupervisorTests(unittest.TestCase):
    def test_N01_active_cannot_certify_from_reports(self):
        obj = mod.evaluate(contract(), evidence())
        self.assertEqual(obj["state"], "BLOCKED_EXTERNAL")
        self.assertFalse(obj["eligible"])
        self.assertFalse(obj["certified"])
        self.assertIn("N16", codes(obj))

    def test_N01_certified_without_real_receipts_is_rejected(self):
        c = contract()
        c["state"] = "CERTIFIED"
        c["certification_receipt"] = {"merged": False, "review_approved": True}
        obj = mod.evaluate(c, evidence())
        self.assertIn("N01", codes(obj))
        self.assertFalse(obj["certified"])

    def test_N01_perfect_self_declared_receipt_must_not_certify(self):
        c = contract()
        c["state"] = "CERTIFIED"
        c["certification_receipt"] = {
            "merged": True,
            "merge_sha": C,
            "main_readback": True,
            "checkpoint_sha": B,
            "independent_audit_pass": True,
            "review_approved": True,
        }
        result = mod.evaluate(c, evidence())
        self.assertFalse(result["certified"])
        self.assertFalse(result["eligible"])

    def test_N02_unrelated_pr_rejected(self):
        e = evidence(); e["pr"] = 999
        self.assertIn("N02", codes(mod.evaluate(contract(), e)))

    def test_N02_authorized_child_diagnostic_only(self):
        self.assertFalse(mod.evaluate(contract(), evidence())["eligible"])

    def test_N03_changed_contract_source_rejected(self):
        e = evidence(); e["contract_source"] = "candidate"
        self.assertIn("N03", codes(mod.evaluate(contract(), e)))

    def test_N03_different_contract_blob_rejected(self):
        e = evidence(); e["contract_blob"] = B
        e["contract_integrity_verified"] = False
        self.assertIn("N03", codes(mod.evaluate(contract(), e)))

    def test_N04_success_from_old_sha_rejected(self):
        e = evidence(); e["checks"][0]["sha"] = B
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N04_skipped_is_not_success(self):
        e = evidence(); e["checks"][0]["conclusion"] = "skipped"
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N04_neutral_is_not_success(self):
        e = evidence(); e["checks"][0]["conclusion"] = "neutral"
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N04_missing_all_checks(self):
        e = evidence(); e["checks"] = []
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N04_duplicate_name_cannot_fake_check(self):
        e = evidence(); e["checks"].append(copy.deepcopy(e["checks"][0]))
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N04_null_check_is_fail_closed(self):
        e = evidence(); e["checks"].append(None)
        obj = mod.evaluate(contract(), e)
        self.assertIn("N04", codes(obj))

    def test_N04_string_check_cannot_be_ignored(self):
        e = evidence(); e["checks"].append("success")
        self.assertIn("N04", codes(mod.evaluate(contract(), e)))

    def test_N06_null_audit_fails_closed(self):
        e = evidence(); e["independent_audit"] = None
        self.assertIn("N06", codes(mod.evaluate(contract(), e)))

    def test_N11_null_publisher_fails_closed(self):
        e = evidence(); e["publisher"] = None
        self.assertIn("N11", codes(mod.evaluate(contract(), e)))

    def test_N08_malformed_attempts_fails_closed(self):
        e = evidence(); e["attempts_without_delta"] = "2"
        self.assertIn("N08", codes(mod.evaluate(contract(), e)))

    def test_N05_base_advance_not_accepted(self):
        e = evidence(); e["live_base"] = C
        self.assertIn("N05", codes(mod.evaluate(contract(), e)))

    def test_N05_head_drift_not_accepted(self):
        e = evidence(); e["live_head"] = C
        self.assertIn("N05", codes(mod.evaluate(contract(), e)))

    def test_N06_author_cannot_review_own_work(self):
        e = evidence(); e["review"]["login"] = e["author"]
        self.assertIn("N06", codes(mod.evaluate(contract(), e)))

    def test_N06_code_without_independent_audit_not_certified(self):
        e = evidence(); e["independent_audit"]["verified_pass"] = False
        self.assertIn("N06", codes(mod.evaluate(contract(), e)))

    def test_N07_interrupted_session_no_certification(self):
        e = evidence(); e["runner_status"] = "interrupted"
        self.assertIn("N07", codes(mod.evaluate(contract(), e)))

    def test_N08_retry_without_delta_rejected(self):
        e = evidence(); e["attempts_without_delta"] = 2
        self.assertIn("N08", codes(mod.evaluate(contract(), e)))

    def test_N09_simultaneous_lease_conflict_rejected(self):
        e = evidence(); e["lock_conflict"] = True
        self.assertIn("N09", codes(mod.evaluate(contract(), e)))

    def test_N10_cancel_without_owner_not_success(self):
        c = contract(); c["state"] = "CANCELLED_BY_OWNER"
        c["cancellation_receipt"] = {"owner_authorized": False}
        self.assertEqual(mod.evaluate(c, evidence())["state"], "BLOCKED_EXTERNAL")

    def test_N10_unverified_json_receipt_cannot_cancel_mission(self):
        c = contract(); c["state"] = "CANCELLED_BY_OWNER"
        c["cancellation_receipt"] = {"owner_authorized": True, "decision_id": "decision-123"}
        o = mod.evaluate(c, evidence())
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertIn("N10", codes(o))
        self.assertFalse(o["certified"])
        self.assertFalse(o["authoritative"])

    def test_N11_missing_tool_blocked(self):
        e = evidence(); e["tooling"] = "unavailable"
        self.assertIn("N11", codes(mod.evaluate(contract(), e)))

    def test_N12_review_stale_head_rejected(self):
        e = evidence(); e["review"]["head"] = B
        self.assertIn("N12", codes(mod.evaluate(contract(), e)))

    def test_N13_unknown_event_rejected(self):
        e = evidence(); e["event"] = "custom"
        self.assertIn("N13", codes(mod.evaluate(contract(), e)))

    def test_N13_no_group_identity_rejected(self):
        e = evidence(); e["event"] = "merge_group"
        self.assertIn("N13", codes(mod.evaluate(contract(), e)))

    def test_N13_multiple_prs_cannot_be_one_group(self):
        e = evidence(); e["event"] = "merge_group"
        e["merge_group"] = {"state": "active", "sha": H, "base": B, "prs": [690, 679]}
        self.assertIn("N13", codes(mod.evaluate(contract(), e)))

    def test_N13_foreign_status_publisher_rejected(self):
        e = evidence(); e["event"] = "merge_group"
        e["merge_group"] = {"state": "active", "sha": H, "base": B, "prs": [690]}
        e["publisher"] = {"available": True, "sha": H, "state": "success", "verified_origin": False}
        self.assertIn("N13", codes(mod.evaluate(contract(), e)))

    def test_N13_wrong_check_integration_rejected(self):
        checks = evidence()["checks"]
        checks[0]["integration_id"] = 777
        failures = mod.validate_checks(checks, H, app_ids={name: 15368 for name in mod.REQUIRED})
        self.assertTrue(any("N13" in x for x in failures))

    def test_N14_unknown_dependency_rejected(self):
        e = evidence(); e["pr"] = 692
        self.assertIn("N02", codes(mod.evaluate(contract(), e)))

    def test_N15_publisher_offline_rejected(self):
        e = evidence(); e["publisher"]["available"] = False
        self.assertIn("N15", codes(mod.evaluate(contract(), e)))

    def test_N16_no_real_group_status_rejected(self):
        e = evidence(); e["event"] = "merge_group"
        e["merge_group"] = {"state": "active", "sha": H, "base": B, "prs": [690]}
        self.assertIn("N16", codes(mod.evaluate(contract(), e)))

    def test_N17_revoked_specific_authorization_cannot_pass(self):
        e = evidence(); e["owner_authorization"]["revoked"] = True
        self.assertIn("N17", codes(mod.evaluate(contract(), e)))

    def test_N17_approved_review_does_not_replace_authorization(self):
        e = evidence(); e["owner_authorization"] = {"verified": False}
        self.assertIn("N17", codes(mod.evaluate(contract(), e)))

    def test_N17_second_approval_not_proxy_for_revoked_auth(self):
        e = evidence(); e["review"]["second_eligible_approval"] = True
        e["owner_authorization"]["revoked"] = True
        self.assertIn("N17", codes(mod.evaluate(contract(), e)))

    def test_N17_malformed_review_cannot_be_approved(self):
        e = evidence(); e["review"] = ["APPROVED"]
        self.assertIn("N17", codes(mod.evaluate(contract(), e)))

    def test_N17_missing_review_not_equivalent_to_pass(self):
        e = evidence(); e["review"]["state"] = "COMMENTED"
        self.assertIn("N17", codes(mod.evaluate(contract(), e)))

    def test_input_rejects_invalid_contract_and_extra_dependency(self):
        c = contract(); c["allowed_dependencies"] = [690, 690]
        with self.assertRaises(mod.InvalidEvidence):
            mod.check_contract(c)

    def test_activation_cannot_be_enabled_by_candidate(self):
        c = contract(); c["activation_authorized"] = True
        with self.assertRaises(mod.InvalidEvidence):
            mod.check_contract(c)

    def watchdog_data(self, when="2026-11-21T12:00:00Z"):
        return [
            {"repo": mod.REPO, "number": n, "head_sha": H, "state": "open",
             "updated_at": when, "checks": [
                 {"name": name, "status": "completed", "conclusion": "success",
                  "started_at": when} for name in mod.REQUIRED]}
            for n in (679, 690)
        ]

    def test_watchdog_valid_diagnosis_never_certifies(self):
        o = mod.assess_watchdog(contract(), self.watchdog_data(), "2026-11-21T13:00:00Z")
        self.assertEqual(o["state"], "ACTIVE")
        self.assertFalse(o["certified"])
        self.assertFalse(o["eligible"])
        self.assertFalse(o["authoritative_for_merge"])

    def test_watchdog_drift_head_blocks(self):
        data = self.watchdog_data()
        data[0]["head_sha"] = C
        self.assertEqual(mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")["next_action"],
                         "REVALIDATE_HEAD")

    def test_watchdog_failure_ci_blocks(self):
        data = self.watchdog_data()
        data[1]["checks"][0]["conclusion"] = "failure"
        self.assertEqual(mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")["next_action"],
                         "FIX_FAILED_CI")

    def test_watchdog_stalled_ci_blocks(self):
        data = self.watchdog_data()
        data[1]["checks"][0].update(status="in_progress", conclusion=None,
                                   started_at="2026-11-21T09:00:00Z")
        self.assertEqual(mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")["next_action"],
                         "INVESTIGATE_CI_STALL")

    def test_watchdog_no_progress_alerts(self):
        data = self.watchdog_data("2026-11-18T12:00:00Z")
        self.assertEqual(mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")["next_action"],
                         "INVESTIGATE_NO_PROGRESS")

    def test_watchdog_missing_checks_not_pass(self):
        data = self.watchdog_data()
        data[1]["checks"] = []
        self.assertEqual(mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")["next_action"],
                         "VERIFY_MISSING_CI")

    def test_watchdog_extra_unauthorized_pr_rejected(self):
        data = self.watchdog_data()
        data[1]["number"] = 692
        with self.assertRaises(mod.InvalidEvidence):
            mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")

    def test_watchdog_no_timezone_rejected(self):
        data = self.watchdog_data("2026-11-21T12:00:00")
        with self.assertRaises(mod.InvalidEvidence):
            mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")

    def test_watchdog_protected_main_drift_fail_closed(self):
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), lambda _: {"object": {"sha": B}}, H)

    def test_watchdog_readonly_collects_target_and_dependency(self):
        seen = []
        def fake_api(path):
            seen.append(path)
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main"},
                        "head": {"sha": H}, "updated_at": "2026-11-21T12:00:00Z",
                        "state": "open"}
            if path.startswith("/commits/"):
                return {"total_count": 1, "check_runs": [
                    {"name": "test", "status": "completed", "conclusion": "success"}
                ]}
            raise RuntimeError("unapproved endpoint")
        data = mod.collect_watchdog(contract(), fake_api, H)
        self.assertEqual([x["number"] for x in data], [679, 690])
        self.assertEqual(len(seen), 5)
        self.assertTrue(all(x.startswith(("/git/ref/", "/pulls/", "/commits/")) for x in seen))

    def test_watchdog_incomplete_check_pagination_rejected(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                return {"number": int(path.split("/")[-1]), "base": {"ref": "main"},
                        "head": {"sha": H}, "state": "open",
                        "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 101, "check_runs": []}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_cli_blocked_diagnostic_never_signals_ci_pass(self):
        with tempfile.TemporaryDirectory() as d:
            root = pathlib.Path(d)
            (root / "contract.json").write_text(json.dumps(contract()), encoding="utf8")
            (root / "evidence.json").write_text(json.dumps(evidence()), encoding="utf8")
            result = mod.main(["--contract", str(root / "contract.json"),
                               "--evidence", str(root / "evidence.json")])
            self.assertEqual(result, 2)

    def test_cli_cancelled_receipt_also_fails_closed(self):
        c = contract()
        c["state"] = "CANCELLED_BY_OWNER"
        c["cancellation_receipt"] = {"owner_authorized": True, "decision_id": "forged"}
        with tempfile.TemporaryDirectory() as d:
            root = pathlib.Path(d)
            (root / "contract.json").write_text(json.dumps(c), encoding="utf8")
            (root / "evidence.json").write_text(json.dumps(evidence()), encoding="utf8")
            self.assertEqual(mod.main(["--contract", str(root / "contract.json"),
                                       "--evidence", str(root / "evidence.json")]), 2)

    def test_cli_no_files_changed_and_missing_evidence_fails_closed(self):
        with tempfile.TemporaryDirectory() as d:
            root = pathlib.Path(d)
            (root / "contract.json").write_text(json.dumps(contract()), encoding="utf8")
            result = mod.main(["--contract", str(root / "contract.json"),
                               "--evidence", str(root / "not-found.json")])
            self.assertEqual(result, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
