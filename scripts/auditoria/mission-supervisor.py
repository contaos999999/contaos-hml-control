"""ContaOS P0-ABS: fiscal de missão, sem credenciais, publicação ou merge.

Este módulo NÃO é o check obrigatório. Recebe evidências preparadas por executor
confiável, avalia contratos e emite apenas diagnóstico. A origem GitHub de qualquer
prova deve ser autenticada pelo executor separado antes de ativar o App.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from collections import Counter
from pathlib import Path

SHA = re.compile(r"^[0-9a-f]{40}$")
REPO = "contaos999999/contaos-hml-control"
STATES = {"ACTIVE", "BLOCKED_EXTERNAL", "CANCELLED_BY_OWNER", "CERTIFIED"}
OUTCOMES = {"success", "failure", "error", "pending", "skipped", "neutral", "cancelled"}
REQUIRED = (
    "ContaOS Frontend Zero-Drift",
    "Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente",
    "ContaOS P0-NR-001 Integridade e Provas",
)


class InvalidEvidence(ValueError):
    """Input without enough structure for a trustworthy diagnostic."""


def sha(value):
    return isinstance(value, str) and bool(SHA.fullmatch(value))


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def check_contract(contract):
    if not isinstance(contract, dict):
        raise InvalidEvidence("contract must be an object")
    if contract.get("schema") != "contaos.mission.v1":
        raise InvalidEvidence("contract schema")
    if not nonempty(contract.get("mission_id")) or contract.get("repo") != REPO:
        raise InvalidEvidence("mission identity/repository")
    if contract.get("state") not in STATES:
        raise InvalidEvidence("mission state")
    if not isinstance(contract.get("target"), dict):
        raise InvalidEvidence("target missing")
    target = contract["target"]
    if type(target.get("pr")) is not int or target["pr"] < 1:
        raise InvalidEvidence("target PR")
    if not sha(target.get("head")) or target.get("branch") != "main":
        raise InvalidEvidence("target head/branch")
    if not isinstance(contract.get("allowed_dependencies"), list):
        raise InvalidEvidence("dependencies missing")
    deps = contract["allowed_dependencies"]
    if len(deps) != len(set(x for x in deps if type(x) is int)) or any(type(x) is not int or x < 1 for x in deps):
        raise InvalidEvidence("dependencies invalid")
    if contract.get("activation_authorized") is not False:
        raise InvalidEvidence("privileged activation must remain disabled in BUILD")
    plan = contract.get("immutable_plan")
    if (not isinstance(plan, dict)
            or plan.get("path") != "docs/frontend/planos/PLAN_P0_AUDITOR_FISCAL_UNIVERSAL_2026-11-20.md"
            or not sha(plan.get("blob"))):
        raise InvalidEvidence("protected PLAN blob missing")
    if not isinstance(contract.get("requirements"), dict):
        raise InvalidEvidence("requirements missing")
    required = contract["requirements"].get("required_checks")
    if required != list(REQUIRED):
        raise InvalidEvidence("required checks changed/omitted")
    if contract.get("state") == "CERTIFIED" and not isinstance(contract.get("certification_receipt"), dict):
        raise InvalidEvidence("CERTIFIED without signed-off receipt")
    if contract.get("state") == "CANCELLED_BY_OWNER" and not isinstance(contract.get("cancellation_receipt"), dict):
        raise InvalidEvidence("CANCELLED without owner decision")


def validate_checks(checks, expected_sha, names=REQUIRED, app_ids=None):
    failures = []
    if not isinstance(checks, list):
        return ["N04: required checks missing"]
    if any(not isinstance(c, dict) for c in checks):
        failures.append("N04: malformed check entry")
    counts = Counter(c.get("name") for c in checks if isinstance(c, dict))
    for name in names:
        if counts[name] != 1:
            failures.append("N04: check missing/ambiguous " + name)
            continue
        c = next(c for c in checks if isinstance(c, dict) and c.get("name") == name)
        if c.get("sha") != expected_sha or not sha(c.get("sha")):
            failures.append("N04: stale SHA " + name)
        if c.get("conclusion") != "success" or c.get("status") != "completed":
            failures.append("N04: check not success " + name)
        if not nonempty(c.get("run_id")):
            failures.append("N04: check run provenance missing " + name)
        if app_ids and c.get("integration_id") != app_ids.get(name):
            failures.append("N13: wrong check issuer " + name)
    return failures


def evaluate(contract, evidence):
    """Pure read-only evaluation. Never a merge/activation or APPROVE decision."""
    check_contract(contract)
    if not isinstance(evidence, dict):
        raise InvalidEvidence("evidence must be an object")
    issues = []
    note = lambda code, message: issues.append({"code": code, "detail": message})
    status = contract["state"]
    if status == "CANCELLED_BY_OWNER":
        # A cancellation claim in an untrusted JSON cannot confer authority.
        note("N10", "offline receipt cannot authenticate cancellation by owner")
        return {"state": "BLOCKED_EXTERNAL", "eligible": False, "certified": False,
                "authoritative": False, "issues": issues}

    if evidence.get("repo") != contract["repo"]:
        note("N02", "repository outside mission contract")
    if type(evidence.get("pr")) is not int:
        note("N13", "PR identity absent")
    elif evidence["pr"] not in [contract["target"]["pr"], *contract["allowed_dependencies"]]:
        note("N02", "PR outside protected mission and authorized dependencies")
    if not sha(evidence.get("head")) or not sha(evidence.get("base")):
        note("N05", "invalid PR HEAD/base")
    if evidence.get("target_branch") != contract["target"]["branch"]:
        note("N02", "unexpected target branch")
    if evidence.get("base") != evidence.get("live_base"):
        note("N05", "base advanced or not authenticated")
    if evidence.get("head") != evidence.get("live_head"):
        note("N05", "head drift")
    if (evidence.get("contract_source") != "protected-main"
            or evidence.get("plan_blob") != contract["immutable_plan"]["blob"]
            or not sha(evidence.get("contract_blob"))
            or evidence.get("contract_integrity_verified") is not True):
        note("N03", "protected main contract/PLAN provenance not verified")
    if evidence.get("tooling") == "unavailable":
        note("N11", "tool/API unavailable")
    if type(evidence.get("attempts_without_delta", 0)) is not int:
        note("N08", "attempt counter malformed")
    elif evidence.get("attempts_without_delta", 0) >= 2:
        note("N08", "same attempt repeated without cause correction")
    if evidence.get("lock_conflict") is True:
        note("N09", "concurrent lease conflict")
    if evidence.get("author") == evidence.get("reviewer"):
        note("N06", "implementer and reviewer same identity")
    if evidence.get("runner_status") in ("cancelled", "interrupted"):
        note("N07", "auditor session not completed")

    event = evidence.get("event")
    if event not in ("pull_request", "merge_group", "push"):
        note("N13", "unrecognized event")
    candidate_sha = evidence.get("candidate_sha")
    if not sha(candidate_sha):
        note("N13", "candidate SHA absent")
    if event == "pull_request" and candidate_sha != evidence.get("head"):
        note("N13", "PR candidate SHA not proven")
    if event == "merge_group":
        group = evidence.get("merge_group")
        if not isinstance(group, dict) or group.get("state") != "active" or group.get("sha") != candidate_sha:
            note("N13", "group identity/active SHA not proven")
        elif (group.get("base") != evidence.get("live_base") or
              group.get("prs") != [evidence.get("pr")]):
            note("N13", "group base or unique PR not proven")
    for failure in validate_checks(evidence.get("checks"), candidate_sha):
        note("N04", failure)

    review = evidence.get("review")
    if not isinstance(review, dict) or review.get("state") != "APPROVED":
        note("N17", "review absent/revoked/not approved")
    else:
        if review.get("head") != evidence.get("head"):
            note("N12", "review signed for different head")
        if review.get("login") == evidence.get("author") or not nonempty(review.get("login")):
            note("N06", "reviewer equals author/unknown")
        if not nonempty(review.get("id")):
            note("N17", "review ID missing")
    if not isinstance(evidence.get("owner_authorization"), dict) or not evidence["owner_authorization"].get("verified"):
        note("N17", "specific owner authorization unverified")
    else:
        auth = evidence["owner_authorization"]
        if (auth.get("head") != evidence.get("head") or
            auth.get("base") != evidence.get("live_base") or
            auth.get("review_id") != (review.get("id") if isinstance(review, dict) else None) or
            auth.get("revoked") is not False):
            note("N17", "authorization stale or revoked")
    audit = evidence.get("independent_audit")
    if not isinstance(audit, dict) or not audit.get("verified_pass"):
        note("N06", "no independent PASS evidence for code BUILD")
    elif audit.get("head") != evidence.get("head"):
        note("N12", "independent audit stale")
    published = evidence.get("publisher")
    if not isinstance(published, dict):
        published = {}
        note("N11", "publisher evidence malformed")
    if published.get("available") is False:
        note("N15", "trusted publisher unavailable")
    if event == "merge_group":
        if published.get("sha") != candidate_sha or published.get("state") != "success":
            note("N16", "fresh GitHub App group status absent")
        if not published.get("verified_origin"):
            note("N13", "publisher integration identity unverified")

    if status == "CERTIFIED":
        receipt = contract["certification_receipt"]
        if not (receipt.get("merged") is True and sha(receipt.get("merge_sha"))
                and receipt.get("main_readback") is True
                and sha(receipt.get("checkpoint_sha"))
                and receipt.get("independent_audit_pass") is True
                and receipt.get("review_approved") is True):
            note("N01", "mission marked CERTIFIED without both proofs")
        # Este avaliador recebe JSON, não verifica assinaturas/API ou readback
        # em origem privilegiada. Mesmo o recibo estruturalmente perfeito não
        # é prova e jamais autoriza liberação da missão.
        note("N01", "offline evidence is not a trusted certification receipt")
        return {"state": "BLOCKED_EXTERNAL", "eligible": False,
                "certified": False, "authoritative": False, "issues": issues}

    # BUILD is deliberately diagnostic only: never issue merge-worthy PASS.
    note("N16", "activation_authorized=false: diagnostic only, no App status")
    return {
        "state": "BLOCKED_EXTERNAL" if issues else status,
        "eligible": False,
        "certified": False,
        "authoritative": False,
        "issues": issues,
    }



def iso_time(value):
    if not isinstance(value, str):
        raise InvalidEvidence("N07: timestamp missing")
    stamp = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if stamp.tzinfo is None:
        raise InvalidEvidence("N07: timestamp without timezone")
    return stamp.astimezone(timezone.utc)


def collect_watchdog(contract, api_get, expected_main):
    """Only authenticated GET responses. Never a certification receipt."""
    check_contract(contract)
    if not sha(expected_main):
        raise InvalidEvidence("N03: main SHA absent")
    live = api_get("/git/ref/heads/main")
    if live.get("object", {}).get("sha") != expected_main:
        raise InvalidEvidence("N05: protected main advanced")
    data = []
    for number in [contract["target"]["pr"], *contract["allowed_dependencies"]]:
        pr = api_get("/pulls/" + str(number))
        if pr.get("number") != number or pr.get("base", {}).get("ref") != "main":
            raise InvalidEvidence("N02: wrong PR or base")
        head = pr.get("head", {}).get("sha")
        if not sha(head):
            raise InvalidEvidence("N05: missing PR HEAD")
        runs = api_get("/commits/" + head + "/check-runs?per_page=100")
        if not isinstance(runs, dict) or runs.get("total_count", 0) > 100 or not isinstance(runs.get("check_runs"), list):
            raise InvalidEvidence("N04: incomplete GitHub checks")
        data.append({
            "repo": REPO, "number": number, "head_sha": head,
            "updated_at": pr.get("updated_at"), "state": pr.get("state"),
            "checks": [{k: x.get(k) for k in ("name", "status", "conclusion", "started_at")} for x in runs["check_runs"]],
        })
    return data


def assess_watchdog(contract, data, now):
    """Read-only watchdog; decisions are recommendations, never permissions."""
    check_contract(contract)
    clock = iso_time(now) if isinstance(now, str) else now
    if not isinstance(clock, datetime) or clock.tzinfo is None:
        raise InvalidEvidence("N07: invalid clock")
    wanted = {contract["target"]["pr"], *contract["allowed_dependencies"]}
    if not isinstance(data, list) or len(data) != len(wanted) or {x.get("number") for x in data if isinstance(x, dict)} != wanted:
        raise InvalidEvidence("N02: observations do not cover authorized PRs")
    findings = []
    for item in data:
        number = item["number"]
        if item.get("repo") != REPO or not sha(item.get("head_sha")) or item.get("state") not in ("open", "closed"):
            raise InvalidEvidence("N02: untrusted PR observation")
        updated = iso_time(item.get("updated_at"))
        if updated > clock:
            raise InvalidEvidence("N07: future observation")
        if number == contract["target"]["pr"] and item["head_sha"] != contract["target"]["head"]:
            findings.append({"code": "N05", "pr": number, "action": "REVALIDATE_HEAD"})
        checks = item.get("checks")
        if not isinstance(checks, list) or any(not isinstance(x, dict) for x in checks):
            raise InvalidEvidence("N04: invalid check observations")
        if any(x.get("conclusion") in ("failure", "error", "cancelled") for x in checks):
            findings.append({"code": "N04", "pr": number, "action": "FIX_FAILED_CI"})
        if any(x.get("status") in ("in_progress", "queued") and
               (clock - iso_time(x.get("started_at") or item["updated_at"])).total_seconds() >= 7200
               for x in checks):
            findings.append({"code": "N07", "pr": number, "action": "INVESTIGATE_CI_STALL"})
        if (clock - updated).total_seconds() >= 86400:
            findings.append({"code": "N08", "pr": number, "action": "INVESTIGATE_NO_PROGRESS"})
        if not checks and item["state"] == "open":
            findings.append({"code": "N04", "pr": number, "action": "VERIFY_MISSING_CI"})
    rank = {"REVALIDATE_HEAD": 0, "FIX_FAILED_CI": 1, "INVESTIGATE_CI_STALL": 2,
            "VERIFY_MISSING_CI": 3, "INVESTIGATE_NO_PROGRESS": 4}
    findings.sort(key=lambda x: (rank.get(x["action"], 99), x["pr"]))
    return {
        "source_verified": True,
        "state": "BLOCKED_EXTERNAL" if findings else "ACTIVE",
        "certified": False, "eligible": False, "authoritative_for_merge": False,
        "activation_authorized": False, "issues": findings,
        "next_action": findings[0]["action"] if findings else "REVIEW_INDEPENDENT_AUDIT_AND_CI",
        "observed_prs": [{"number": x["number"], "head": x["head_sha"]} for x in data],
    }


def watchdog_main(contract):
    if os.environ.get("GITHUB_REPOSITORY") != REPO:
        raise InvalidEvidence("N02: unexpected repository")
    token = os.environ.get("GITHUB_TOKEN")
    head = os.environ.get("GITHUB_SHA")
    if not token or not sha(head):
        raise InvalidEvidence("N11: read-only token or SHA missing")

    def api_get(path):
        request = urllib.request.Request("https://api.github.com/repos/" + REPO + path, headers={
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "ContaOS-Watchdog-ReadOnly",
        }, method="GET")
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.load(response)

    data = collect_watchdog(contract, api_get, head)
    return assess_watchdog(contract, data, datetime.now(timezone.utc))


def main(argv=None):
    parser = argparse.ArgumentParser(description="ContaOS P0-ABS offline diagnostic (read-only)")
    parser.add_argument("--contract", type=Path, required=True)
    parser.add_argument("--evidence", type=Path)
    parser.add_argument("--watchdog", action="store_true")
    args = parser.parse_args(argv)
    try:
        contract = json.loads(args.contract.read_text(encoding="utf-8-sig"))
        if args.watchdog:
            result = watchdog_main(contract)
        else:
            if args.evidence is None:
                raise InvalidEvidence("N11: evidence path required")
            evidence = json.loads(args.evidence.read_text(encoding="utf-8-sig"))
            result = evaluate(contract, evidence)
    except (OSError, ValueError, TypeError, KeyError) as exc:
        print(json.dumps({"state": "BLOCKED_EXTERNAL", "eligible": False,
                          "certified": False, "source_verified": False,
                          "issues": [{"code": "N11", "detail": str(exc)}]},
                         ensure_ascii=False))
        return 2
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    # This executable is deliberately read-only/diagnostic. Its JSON cannot
    # prove trusted GitHub origin or authorize merge. Never signal CI success.
    # Consumers may still read the structured diagnosis from stdout.
    return 2


if __name__ == "__main__":
    sys.exit(main())
