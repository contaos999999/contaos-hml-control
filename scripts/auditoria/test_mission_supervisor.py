"""N01-N17: provas offline do supervisor read-only, sem criar status/merge.

Tests use synthetic data strictly as negative fixtures, not GitHub evidence.
"""
import copy
import importlib.util
import json
import io
import pathlib
import tempfile
import unittest
from unittest import mock

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
        "dependency_heads": {"690": H},
        "last_proven": {"merge_sha": H, "verified": True},
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
            {"repo": mod.REPO, "number": n, "head_sha": H, "base_sha": H, "state": "open", "merged": False,
             "updated_at": when, "checks": [
                 {"id": i + 100, "name": name, "head_sha": H,
                  "integration_id": 15368, "status": "completed",
                  "conclusion": "success", "started_at": when}
                 for i, name in enumerate(mod.REQUIRED)]}
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
        obj = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(obj["next_action"], "REVALIDATE_HEAD")
        self.assertFalse(obj["required_checks_complete"])

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
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "updated_at": "2026-11-21T12:00:00Z",
                        "state": "open", "merged": False}
            if path.startswith("/commits/"):
                return {"total_count": 1, "check_runs": [
                    {"id": 100, "name": "test", "head_sha": H, "app": {"id": 15368},
                     "status": "completed", "conclusion": "success"}
                ]}
            raise RuntimeError("unapproved endpoint")
        data = mod.collect_watchdog(contract(), fake_api, H)
        self.assertEqual([x["number"] for x in data], [679, 690])
        self.assertEqual(len(seen), 8)
        self.assertTrue(all(x.startswith(("/git/ref/", "/pulls/", "/commits/")) for x in seen))

    def test_watchdog_incomplete_check_pagination_rejected(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                return {"number": int(path.split("/")[-1]), "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "state": "open", "merged": False,
                        "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 101, "check_runs": []}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_watchdog_only_protect_types_cannot_claim_ready_for_review(self):
        data = self.watchdog_data()
        data[1]["checks"] = [{
            "id": 301, "name": "protect-types", "head_sha": H,
            "integration_id": 15368, "status": "completed",
            "conclusion": "success", "started_at": "2026-11-21T12:00:00Z",
        }]
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertEqual(o["next_action"], "VERIFY_REQUIRED_CHECKS")
        self.assertFalse(o["required_checks_complete"])
        self.assertFalse(o["source_verified"])
        self.assertFalse(o["certified"])

    def test_watchdog_duplicate_required_check_is_not_a_single_success(self):
        data = self.watchdog_data()
        data[1]["checks"].append(dict(data[1]["checks"][0], id=901))
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_REQUIRED_CHECKS")

    def test_watchdog_required_check_neutral_is_not_success(self):
        data = self.watchdog_data()
        data[1]["checks"][0]["conclusion"] = "neutral"
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "REEXECUTE_REQUIRED_CHECKS")

    def test_watchdog_required_check_queued_waits_without_false_success(self):
        data = self.watchdog_data()
        data[1]["checks"][0]["status"] = "queued"
        data[1]["checks"][0]["conclusion"] = None
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "WAIT_REQUIRED_CHECKS")
        self.assertFalse(o["required_checks_complete"])

    def test_watchdog_required_check_stale_head_has_next_action(self):
        data = self.watchdog_data()
        data[1]["checks"][0]["head_sha"] = C
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_CHECK_PROVENANCE")
        self.assertFalse(o["required_checks_complete"])

    def test_watchdog_forged_certified_contract_never_reports_active(self):
        c = contract()
        c["state"] = "CERTIFIED"
        c["certification_receipt"] = {}
        o = mod.assess_watchdog(c, self.watchdog_data(), "2026-11-21T13:00:00Z")
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertEqual(o["next_action"], "VERIFY_CERTIFICATION_RECEIPT")
        self.assertFalse(o["source_verified"])

    def test_watchdog_forged_cancelled_contract_never_reports_active(self):
        c = contract()
        c["state"] = "CANCELLED_BY_OWNER"
        c["cancellation_receipt"] = {}
        o = mod.assess_watchdog(c, self.watchdog_data(), "2026-11-21T13:00:00Z")
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertEqual(o["next_action"], "VERIFY_OWNER_CANCELLATION")
        self.assertFalse(o["certified"])

    def test_watchdog_source_is_not_trusted_when_only_offline_json_was_used(self):
        self.assertFalse(mod.assess_watchdog(
            contract(), self.watchdog_data(), "2026-11-21T13:00:00Z")["source_verified"])

    def test_watchdog_api_check_without_app_id_fails_closed(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H}, "head": {"sha": H},
                        "state": "open", "merged": False, "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 1, "check_runs": [{
                "id": 4, "name": "test", "head_sha": H, "app": {},
                "status": "completed", "conclusion": "success",
            }]}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_watchdog_api_check_with_foreign_head_fails_closed(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H}, "head": {"sha": H},
                        "state": "open", "merged": False, "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 1, "check_runs": [{
                "id": 4, "name": "test", "head_sha": C, "app": {"id": 15368},
                "status": "completed", "conclusion": "success",
            }]}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_watchdog_partial_pagination_even_below_100_fails_closed(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H}, "head": {"sha": H},
                        "state": "open", "merged": False, "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 2, "check_runs": [{
                "id": 4, "name": "test", "head_sha": H, "app": {"id": 15368},
                "status": "completed", "conclusion": "success",
            }]}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_watchdog_pr_head_moving_during_collection_fails_closed(self):
        calls = {}
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                calls[path] = calls.get(path, 0) + 1
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": C if calls[path] == 2 else H},
                        "state": "open", "merged": False, "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 0, "check_runs": []}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), fake_api, H)

    def test_watchdog_main_authenticated_get_readback_never_certifies(self):
        now = mod.datetime.now(mod.timezone.utc).isoformat()
        checks = [
            {"id": 600 + i, "name": name, "head_sha": H,
             "app": {"id": 15368}, "status": "completed",
             "conclusion": "success", "started_at": now}
            for i, name in enumerate(mod.REQUIRED)
        ]
        def response(request, timeout):
            self.assertEqual(request.get_method(), "GET")
            route = request.full_url.split("/contaos-hml-control", 1)[1]
            if route == "/git/ref/heads/main":
                data = {"object": {"sha": H}}
            elif route.startswith("/pulls/"):
                n = int(route.split("/")[-1])
                data = {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "state": "open", "merged": False,
                        "updated_at": now}
            elif route.startswith("/commits/"):
                data = {"total_count": len(checks), "check_runs": checks}
            else:
                raise AssertionError("unauthorized API route " + route)
            return io.BytesIO(json.dumps(data).encode("utf8"))
        environment = {"GITHUB_REPOSITORY": mod.REPO,
                       "GITHUB_TOKEN": "unit-test-token-no-write",
                       "GITHUB_SHA": H}
        with mock.patch.dict(mod.os.environ, environment):
            with mock.patch.object(mod.urllib.request, "urlopen", response):
                o = mod.watchdog_main(contract())
        self.assertTrue(o["source_verified"])
        self.assertTrue(o["required_checks_complete"])
        self.assertEqual(o["state"], "ACTIVE")
        self.assertEqual(o["next_action"], "REVIEW_INDEPENDENT_AUDIT_AND_CI")
        self.assertFalse(o["certified"])


    def test_watchdog_required_app_id_matches_protected_ruleset(self):
        self.assertEqual(mod.EXPECTED_REQUIRED_CHECK_INTEGRATION_ID, 15368)
        data = self.watchdog_data()
        data[1]["checks"][0]["integration_id"] = 424242
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_CHECK_PROVENANCE")
        self.assertFalse(o["required_checks_complete"])
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertFalse(o["certified"])

    def test_watchdog_all_three_same_name_wrong_app_never_ready(self):
        data = self.watchdog_data()
        for check in data[1]["checks"]:
            check["integration_id"] = 424242
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_CHECK_PROVENANCE")
        self.assertFalse(o["required_checks_complete"])

    def test_watchdog_foreign_app_only_on_optional_check_does_not_replace_required(self):
        data = self.watchdog_data()
        data[1]["checks"].append({
            "id": 987, "name": "optional provenance check", "head_sha": H,
            "integration_id": 424242, "status": "completed", "conclusion": "success",
            "started_at": "2026-11-21T12:00:00Z",
        })
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertTrue(o["required_checks_complete"])
        self.assertEqual(o["state"], "ACTIVE")
        self.assertFalse(o["certified"])

    def test_watchdog_closed_without_merge_never_prompts_review(self):
        data = self.watchdog_data()
        data[1]["state"] = "closed"
        data[1]["merged"] = False
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertEqual(o["next_action"], "REOPEN_OR_REPLAN_CLOSED_PR")
        self.assertFalse(o["certified"])
        self.assertFalse(o["eligible"])

    def test_watchdog_merged_pr_requires_readback_not_new_review(self):
        data = self.watchdog_data()
        data[1].update(
            state="closed", merged=True, merged_at="2026-11-21T12:00:00Z",
            merge_commit_sha=B,
        )
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_POST_MERGE_READBACK")
        self.assertEqual(o["state"], "BLOCKED_EXTERNAL")
        self.assertTrue(o["required_checks_complete"])
        self.assertTrue(o["observed_prs"][1]["merged"])
        self.assertFalse(o["certified"])

    def test_watchdog_merged_pr_without_commit_is_invalid_evidence(self):
        data = self.watchdog_data()
        data[1].update(state="closed", merged=True,
                       merged_at="2026-11-21T12:00:00Z")
        with self.assertRaises(mod.InvalidEvidence):
            mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")

    def test_watchdog_open_merged_contradiction_is_invalid(self):
        data = self.watchdog_data()
        data[1]["merged"] = True
        with self.assertRaises(mod.InvalidEvidence):
            mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")

    def test_watchdog_merged_at_in_future_is_invalid(self):
        data = self.watchdog_data()
        data[1].update(state="closed", merged=True, merged_at="2026-11-22T12:00:00Z",
                       merge_commit_sha=B)
        with self.assertRaises(mod.InvalidEvidence):
            mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")

    def test_watchdog_collects_proven_merge_state_with_sha_and_date(self):
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "updated_at": "2026-11-21T12:00:00Z",
                        "state": "closed", "merged": True, "merge_commit_sha": B,
                        "merged_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 0, "check_runs": []}
        data = mod.collect_watchdog(contract(), fake_api, H)
        self.assertTrue(all(x["merged"] for x in data))
        self.assertTrue(all(x["merge_commit_sha"] == B for x in data))
        o = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(o["next_action"], "VERIFY_POST_MERGE_READBACK")

    def test_watchdog_rejects_merge_state_changed_during_collection(self):
        calls = {}
        def fake_api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                calls[path] = calls.get(path, 0) + 1
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "updated_at": "2026-11-21T12:00:00Z",
                        "state": "closed" if calls[path] > 1 else "open",
                        "merged": False}
            return {"total_count": 0, "check_runs": []}
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

    def test_watchdog_dependency_head_drift_is_not_ready(self):
        data = self.watchdog_data()
        data[1]["head_sha"] = C
        for check in data[1]["checks"]:
            check["head_sha"] = C
        out = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(out["state"], "BLOCKED_EXTERNAL")
        self.assertFalse(out["required_checks_complete"])
        self.assertEqual(out["next_action"], "REVALIDATE_HEAD")

    def test_NR009_live_older_target_base_must_diagnose_instead_of_abort(self):
        c = contract()
        old_base = "1" * 40 if H != "1" * 40 else "2" * 40
        def api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                number = int(path.rsplit("/", 1)[1])
                return {
                    "number": number, "base": {"ref": "main", "sha": B if number == 679 else H},
                    "head": {"sha": H}, "updated_at": "2026-11-21T12:00:00Z",
                    "state": "open", "merged": False,
                }
            return {"total_count": 0, "check_runs": []}
        observations = mod.collect_watchdog(c, api, H)
        diag = mod.assess_watchdog(c, observations, "2026-11-21T13:00:00Z")
        self.assertEqual(diag["state"], "BLOCKED_EXTERNAL")
        self.assertEqual(diag["next_action"], "REVALIDATE_HEAD")
        self.assertFalse(diag["eligible"])
        self.assertEqual(observations[0]["base_sha"], B)

    def test_watchdog_malformed_live_pr_base_still_fails_closed(self):
        def api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": H}}
            if path.startswith("/pulls/"):
                return {"number": int(path.rsplit("/", 1)[1]),
                        "base": {"ref": "main", "sha": "not-a-sha"},
                        "head": {"sha": H}, "state": "open", "merged": False,
                        "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 0, "check_runs": []}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), api, H)

    def test_watchdog_adversarial_offline_base_drift_is_not_active(self):
        data = self.watchdog_data()
        data[1]["base_sha"] = B
        out = mod.assess_watchdog(contract(), data, "2026-11-21T13:00:00Z")
        self.assertEqual(out["state"], "BLOCKED_EXTERNAL")
        self.assertFalse(out["required_checks_complete"])
        self.assertEqual(out["next_action"], "REVALIDATE_HEAD")


    def test_v2_red_first_post_merge_is_diagnosable(self):
        c = contract()
        api_calls = []
        def api(path):
            api_calls.append(path)
            if path == "/git/ref/heads/main":
                return {"object": {"sha": B}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                merged = n == 690
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "state": "closed" if merged else "open",
                        "merged": merged, "merged_at": "2026-11-21T12:00:00Z" if merged else None,
                        "merge_commit_sha": B if merged else None,
                        "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 0, "check_runs": []}
        result = mod.collect_watchdog(c, api, B)
        self.assertIn("/git/ref/heads/main", api_calls)
        self.assertEqual(result[1]["merge_commit_sha"], B)
        diagnosis = mod.assess_watchdog(c, result, "2026-11-21T13:00:00Z")
        self.assertEqual(diagnosis["next_action"], "VERIFY_POST_MERGE_READBACK")
        self.assertFalse(diagnosis["eligible"])

    def test_v2_red_main_advanced_without_proven_merge_must_block(self):
        def api(path):
            if path == "/git/ref/heads/main":
                return {"object": {"sha": B}}
            if path.startswith("/pulls/"):
                n = int(path.split("/")[-1])
                return {"number": n, "base": {"ref": "main", "sha": H},
                        "head": {"sha": H}, "state": "open", "merged": False,
                        "updated_at": "2026-11-21T12:00:00Z"}
            return {"total_count": 0, "check_runs": []}
        with self.assertRaises(mod.InvalidEvidence):
            mod.collect_watchdog(contract(), api, B)



if __name__ == "__main__":
    unittest.main(verbosity=2)
