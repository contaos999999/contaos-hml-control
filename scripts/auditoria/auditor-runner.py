"""Load the installed auditor agent config into a fresh read-only Codex execution.

Uses native argv through node, avoiding PowerShell/cmd quote expansion. Never
modifies CODEX_HOME, authentication, project configuration or agent profiles.
"""
import argparse
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tomllib
from datetime import datetime, timezone


def load_profile(path):
    cfg = tomllib.loads(pathlib.Path(path).read_text(encoding='utf-8-sig'))
    if set(cfg) - {'model', 'model_reasoning_effort', 'sandbox_mode', 'developer_instructions'}:
        raise ValueError('Unsupported auditor profile keys; review configuration explicitly')
    if cfg.get('sandbox_mode') != 'read-only':
        raise ValueError('Auditor profile must use read-only')
    if not isinstance(cfg.get('developer_instructions'), str) or not cfg['developer_instructions'].strip():
        raise ValueError('Auditor instructions are required')
    if any(not isinstance(v, str) for v in cfg.values()):
        raise ValueError('Auditor options must be strings')
    return cfg


def build_command(prefix, cfg, report, model_override=None):
    args = [*prefix, 'exec', '--sandbox', 'read-only', '--ephemeral', '-c', 'agents.enabled=false']
    effective = dict(cfg)
    if model_override:
        effective['model'] = model_override
    for key, value in effective.items():
        args.extend(['-c', key + '=' + json.dumps(value, ensure_ascii=False)])
    return [*args, '--output-last-message', str(report), '-']


def open_new(path):
    return pathlib.Path(path).open('x', encoding='utf-8')


def audit_environment(source_env=None):
    # Preserve OS paths and ChatGPT file-based login, never provider tokens,
    # application secrets, NODE_OPTIONS, or settings supplied by a PR.
    allowed = {'SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','PATH','TEMP','TMP',
               'USERPROFILE','HOMEDRIVE','HOMEPATH','HOME','APPDATA','LOCALAPPDATA',
               'PROGRAMFILES','PROGRAMFILES(X86)','PROGRAMDATA','ALLUSERSPROFILE',
               'NUMBER_OF_PROCESSORS','PROCESSOR_ARCHITECTURE','OS','LANG','LC_ALL',
               'TERM','NO_COLOR','FORCE_COLOR','CODEX_HOME'}
    source = os.environ if source_env is None else source_env
    clean = {key:value for key,value in source.items() if key.upper() in allowed}
    return clean


def run_codex(command, prompt, out, err, source_env=None):
    return subprocess.run(command, input=prompt, stdout=out, stderr=err,
                          env=audit_environment(source_env), check=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', required=True, type=pathlib.Path)
    parser.add_argument('--report', required=True, type=pathlib.Path)
    parser.add_argument('--model', help='Explicit operator model override; profile file stays unchanged')
    args = parser.parse_args()
    cfg = load_profile(args.profile)
    if args.report.exists():
        raise FileExistsError('Report already exists')
    # The npm entrypoint forwards argv to the native Codex binary without cmd.exe.
    shim = shutil.which('codex.cmd')
    node = shutil.which('node.exe') or shutil.which('node')
    entry = pathlib.Path(shim).parent / 'node_modules/@openai/codex/bin/codex.js' if shim else None
    if not node or entry is None or not entry.is_file():
        raise RuntimeError('Expected installed npm Codex entrypoint and Node.js')
    command = build_command([node, str(entry)], cfg, args.report, args.model)
    record = {
        'profile': 'auditor', 'profilePath': str(args.profile.resolve()),
        'profileSha256': hashlib.sha256(args.profile.read_bytes()).hexdigest(),
        'sandbox': 'read-only', 'reasoningEffort': cfg.get('model_reasoning_effort'),
        'environmentPolicy': 'explicit-os-allowlist-no-provider-or-app-secrets',
        'selectedModel': args.model or cfg.get('model', 'inherited'),
        'startedAt': datetime.now(timezone.utc).isoformat(), 'cwd': os.getcwd(),
        'command': command,
    }
    folder = args.report.parent
    with open_new(folder / 'execution.initial.json') as f:
        json.dump(record, f, indent=2, ensure_ascii=False)
    prompt = sys.stdin.buffer.read()
    with open_new(folder / 'codex.stdout.log') as out, open_new(folder / 'codex.stderr.log') as err:
        result = run_codex(command, prompt, out, err)
    record['exitCode'] = result.returncode
    record['finishedAt'] = datetime.now(timezone.utc).isoformat()
    with open_new(folder / 'execution.final.json') as f:
        json.dump(record, f, indent=2, ensure_ascii=False)
    print('Auditor profile loaded; Codex exit code:', result.returncode)
    return result.returncode


if __name__ == '__main__':
    sys.exit(main())
