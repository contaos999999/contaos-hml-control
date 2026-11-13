#!/usr/bin/env python3
"""Fail-closed offline verification of a retained GitHub Actions NAV ZIP.

This does not certify individual PASS or authorize skipping an audit case.
Usage: python3 scripts/hml/verify-navigation-artifact.py ZIP EXPECTED_ZIP_SHA256
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path


def sha(data):
    return hashlib.sha256(data).hexdigest()


def verify(path, expected):
    if not re.fullmatch(r"[a-f0-9]{64}", expected):
        raise ValueError("ZIP_HASH_FORMAT")
    raw = Path(path).read_bytes()
    if len(raw) > 64 * 1024 * 1024 or sha(raw) != expected:
        raise ValueError("ZIP_HASH_MISMATCH")
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if len(names) != 2 or set(names) != {"report.json", "SHA256SUMS"}:
            raise ValueError("ZIP_ENTRIES")
        if archive.testzip() is not None:
            raise ValueError("ZIP_CRC")
        if any(x.file_size > 1024 * 1024 or x.is_dir() for x in archive.infolist()):
            raise ValueError("ZIP_SIZE")
        report = archive.read("report.json")
        sums = archive.read("SHA256SUMS").decode("ascii")
    lines = sums.strip().splitlines()
    if len(lines) != 1 or not re.fullmatch(r"[a-f0-9]{64}  report\.json", lines[0]):
        raise ValueError("SHA256SUMS_FORMAT")
    if lines[0][:64] != sha(report):
        raise ValueError("REPORT_HASH_MISMATCH")
    data = json.loads(report)
    if not isinstance(data, dict) or data.get("schema") != "contaos.navigation.audit.v3":
        raise ValueError("REPORT_SCHEMA")
    rows = data.get("records")
    summary = data.get("summary")
    if not isinstance(rows, list) or not isinstance(summary, dict):
        raise ValueError("REPORT_ROWS")
    if summary.get("expected") != 52 or summary.get("observed") != len(rows):
        raise ValueError("REPORT_COUNTS")
    passed = sum(isinstance(x, dict) and x.get("status") == "PASS" for x in rows)
    if summary.get("passed") != passed or summary.get("failed") != len(rows) - passed:
        raise ValueError("REPORT_STATUS_COUNTS")
    return {"zipSha256": sha(raw), "reportSha256": sha(report), "observed": len(rows), "passedCandidates": passed, "failed": summary["failed"], "globalControlsPassed": all(data.get(k) is True for k in ("sessionVerified", "masterVerified", "organizationVerified", "logoutVerified")) and all(data.get(k) == 0 for k in ("httpErrors", "transportErrors", "pageErrors", "blockedMutations")) and data.get("networkFailure") is None}


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: verify-navigation-artifact.py ZIP EXPECTED_ZIP_SHA256")
    try:
        print(json.dumps(verify(sys.argv[1], sys.argv[2]), sort_keys=True))
    except (ValueError, OSError, zipfile.BadZipFile, UnicodeError, json.JSONDecodeError) as exc:
        print(f"ARTIFACT_INVALID: {exc}", file=sys.stderr)
        raise SystemExit(1)
