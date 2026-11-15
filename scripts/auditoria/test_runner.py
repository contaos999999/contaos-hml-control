import importlib.util
import json
import pathlib
import tempfile
import unittest
import os
import subprocess
import sys

ROOT = pathlib.Path(__file__).parent

class RunnerTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location('runner', ROOT / 'auditor-runner.py')
        self.runner = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.runner)

    def profile(self, text):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        path = pathlib.Path(tmp.name) / 'auditor.toml'
        path.write_text(text, encoding='utf-8-sig')
        return path

    def test_loads_installed_bom_profile_and_unicode(self):
        path = self.profile('sandbox_mode="read-only"\nmodel_reasoning_effort="high"\ndeveloper_instructions="Não altere arquivos."\n')
        cfg = self.runner.load_profile(path)
        self.assertEqual(cfg['developer_instructions'], 'Não altere arquivos.')
        command = self.runner.build_command(['codex.exe'], cfg, pathlib.Path('parecer.md'))
        self.assertIn('developer_instructions='+json.dumps('Não altere arquivos.', ensure_ascii=False), command)
        self.assertIn('model_reasoning_effort="high"', command)
        self.assertIn('agents.enabled=false', command)
        self.assertIn('read-only', command)
        self.assertNotIn('--dangerously-bypass-approvals-and-sandbox', command)

    def test_rejects_writable_profile(self):
        with self.assertRaises(ValueError):
            self.runner.load_profile(self.profile('sandbox_mode="workspace-write"\ndeveloper_instructions="x"\n'))

    def test_explicit_luna_override_preserves_profile_and_read_only(self):
        cfg={'sandbox_mode':'read-only','model':'gpt-6.1-sol','developer_instructions':'Read only.'}
        command=self.runner.build_command(['codex.exe'],cfg,pathlib.Path('parecer.md'),'gpt-6-luna')
        self.assertIn('model="gpt-6-luna"',command)
        self.assertNotIn('model="gpt-6.1-sol"',command)
        self.assertEqual(cfg['model'],'gpt-6.1-sol')
        self.assertIn('read-only',command)

    def test_rejects_missing_instructions(self):
        with self.assertRaises(ValueError):
            self.runner.load_profile(self.profile('sandbox_mode="read-only"\n'))

    def test_rejects_unknown_profile_options(self):
        with self.assertRaises(ValueError):
            self.runner.load_profile(self.profile('sandbox_mode="read-only"\ndeveloper_instructions="x"\napproval_policy="never"\n'))

    def test_exclusive_output_never_overwrites(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = pathlib.Path(tmp) / 'log'
            with self.runner.open_new(target) as f:
                f.write('original')
            with self.assertRaises(FileExistsError):
                self.runner.open_new(target)
            self.assertEqual(target.read_text(), 'original')

    def test_real_child_does_not_inherit_secret_or_node_injection(self):
        source = dict(os.environ)
        source.update({'CONTAOS_TEST_PASSWORD':'sentinel-only','OPENAI_API_KEY':'sentinel-only','NODE_OPTIONS':'--require=untrusted.js','UNRECOGNIZED_SETTING':'sentinel-only'})
        with tempfile.TemporaryFile() as out, tempfile.TemporaryFile() as err:
            result = self.runner.run_codex([sys.executable,'-c',"import os,json; print(json.dumps({k:(k in os.environ) for k in ['CONTAOS_TEST_PASSWORD','OPENAI_API_KEY','NODE_OPTIONS','UNRECOGNIZED_SETTING','PATH']}))"], b'', out, err, source)
            self.assertEqual(result.returncode,0)
            out.seek(0)
            self.assertEqual(json.loads(out.read()),{'CONTAOS_TEST_PASSWORD':False,'OPENAI_API_KEY':False,'NODE_OPTIONS':False,'UNRECOGNIZED_SETTING':False,'PATH':True})

if __name__ == '__main__':
    unittest.main(verbosity=2)
