import importlib.util,json,pathlib,tempfile,unittest,subprocess,copy
ROOT=pathlib.Path(__file__).parent
class PreparationTests(unittest.TestCase):
 def setUp(self):
  spec=importlib.util.spec_from_file_location('prep',ROOT/'prepare-audit.py')
  self.prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(self.prep)
 def test_only_canonical_eol_difference_is_accepted(self):
  self.assertEqual(self.prep.canonical_bytes(b'a\r\nb\r\n',b'a\nb\n'),b'a\nb\n')
  self.assertEqual(self.prep.canonical_bytes(b'a\n',b'a\n'),b'a\n')
 def test_material_difference_is_rejected(self):
  with self.assertRaises(ValueError):self.prep.canonical_bytes(b'changed\r\n',b'original\n')
 def test_pr_snapshot_rejects_different_head_or_base(self):
  good={'state':'OPEN','isDraft':False,'headRefOid':'a'*40,'baseRefOid':'b'*40}
  self.prep.validate_pr(good,'a'*40,'b'*40)
  for key in ('headRefOid','baseRefOid'):
   bad={**good,key:'c'*40}
   with self.assertRaises(ValueError):self.prep.validate_pr(bad,'a'*40,'b'*40)
 def test_closed_or_draft_pr_is_rejected(self):
  for state,draft in [('CLOSED',False),('OPEN',True)]:
   with self.assertRaises(ValueError):self.prep.validate_pr({'state':state,'isDraft':draft,'headRefOid':'a'*40,'baseRefOid':'b'*40},'a'*40,'b'*40)
 def test_check_snapshot_rejects_other_sha_and_incomplete_page(self):
  good={'total_count':1,'check_runs':[{'head_sha':'a'*40,'conclusion':'skipped'}]}
  self.prep.validate_checks(good,'a'*40)
  for bad in [{'total_count':2,'check_runs':good['check_runs']},{'total_count':1,'check_runs':[{'head_sha':'b'*40}]}]:
   with self.assertRaises(ValueError):self.prep.validate_checks(bad,'a'*40)
 def test_metadata_cannot_be_overwritten(self):
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'evidence.json';self.prep.write_new_json(p,{'a':1})
   with self.assertRaises(FileExistsError):self.prep.write_new_json(p,{'a':2})
   self.assertEqual(json.loads(p.read_text()),{'a':1})
 def test_locked_types_and_app_sources_are_not_materialized(self):
  self.assertEqual(len(self.prep.CANONICAL_FILES),4)
  self.assertTrue(all(not p.startswith('src/') for p in self.prep.CANONICAL_FILES))
 def test_tool_versions_are_explicit(self):
  self.assertEqual(self.prep.BUN_VERSION,'1.4.4');self.assertEqual(self.prep.NODE_VERSION,'24.22.3')
 def test_pr_lifecycle_scripts_are_not_executed_by_preparation(self):
  self.assertEqual(self.prep.FROZEN_INSTALL_ARGS,('install','--frozen-lockfile','--ignore-scripts'))
 def test_actions_job_comes_from_url_not_check_id(self):
  check={'id':11,'details_url':'https://github.com/contaos999999/contaos-hml-control/actions/runs/33/job/22'}
  self.assertEqual(self.prep.actions_job(check),(33,22))
 def test_actions_url_rejects_another_repo_or_host(self):
  for url in ('https://evil.example/contaos999999/contaos-hml-control/actions/runs/33/job/22','https://github.com/other/repo/actions/runs/33/job/22'):
   with self.assertRaises(ValueError):self.prep.actions_job({'details_url':url})
 def test_real_git_index_stays_clean_after_canonical_checkout(self):
  with tempfile.TemporaryDirectory() as folder:
   p=pathlib.Path(folder)
   def git(*args):return subprocess.check_output(['git','-C',str(p),'-c','core.autocrlf=true',*args],stderr=subprocess.DEVNULL)
   git('init');(p/'fixture.txt').write_bytes(b'a\r\nb\r\n');git('add','fixture.txt')
   git('-c','user.name=Audit Test','-c','user.email=audit@example.invalid','commit','-m','fixture')
   before=git('rev-parse','HEAD')
   self.prep.materialize_canonical(p,['fixture.txt'],git)
   self.assertEqual((p/'fixture.txt').read_bytes(),b'a\nb\n')
   self.assertEqual(git('status','--porcelain=v1').strip(),b'')
   self.assertEqual(git('rev-parse','HEAD'),before)
 def test_material_difference_is_rejected_before_any_write(self):
  with tempfile.TemporaryDirectory() as folder:
   p=pathlib.Path(folder)
   (p/'a.txt').write_bytes(b'a\r\n');(p/'b.txt').write_bytes(b'changed')
   def git(*args):
    if args==('diff','--cached','--exit-code'):return b''
    return b'a\n' if args[-1]=='HEAD:a.txt' else b'original'
   with self.assertRaises(ValueError):self.prep.materialize_canonical(p,['a.txt','b.txt'],git)
   self.assertEqual((p/'a.txt').read_bytes(),b'a\r\n')
 def test_tool_lock_pins_only_direct_binary_packages_and_integrities(self):
  package,lock=self.prep.tool_specs()
  self.assertEqual(package['dependencies'],{'@oven/bun-windows-x64':'1.4.4','node-win-x64':'24.22.3'})
  self.assertNotIn('scripts',package)
  self.assertEqual(len(lock['packages']),3)
  for pin in self.prep.TOOL_PINS.values():
   entry=lock['packages']['node_modules/'+pin['name']]
   self.assertEqual(entry['integrity'],pin['integrity'])
   self.assertEqual(entry['resolved'],pin['url'])
 def test_bootstrap_uses_ci_ignore_scripts_and_empty_config_paths(self):
  command=self.prep.bootstrap_command(pathlib.Path('tools'))
  self.assertEqual(command[:2],['npm.cmd','ci'])
  self.assertIn('--ignore-scripts',command)
  self.assertIn('--userconfig',command);self.assertIn('--globalconfig',command)
  self.assertNotIn('install',command)
 def test_binary_tampering_is_detected_before_execution(self):
  with tempfile.TemporaryDirectory() as folder:
   p=pathlib.Path(folder)/'node.exe';p.write_bytes(b'untrusted')
   self.assertFalse(self.prep.binary_matches(p,self.prep.TOOL_PINS['node']['sha256']))
 def test_preparation_environment_drops_credentials_and_injection(self):
  source={'PATH':'safe-path','USERPROFILE':'safe-home','OPENAI_API_KEY':'sentinel','NPM_TOKEN':'sentinel','NODE_OPTIONS':'sentinel'}
  self.assertEqual(self.prep.preparation_environment(source),{'PATH':'safe-path','USERPROFILE':'safe-home'})
 def context_fixture(self):
  return ({'number':314,'state':'OPEN','isDraft':False,'headRefOid':'a'*40,'baseRefOid':'b'*40,'baseRefName':'main','author':{'login':'edivan5002'}},
          {'ref':'refs/heads/main','object':{'type':'commit','sha':'b'*40}})
 def collect(self,pr,ref):
  self.paths=[]
  def api(path):self.paths.append(path);return ref
  return self.prep.collect_context(lambda:pr,api,'a'*40,'b'*40,'main')
 def test_live_base_stale_initial_rejected(self):
  pr,ref=self.context_fixture();ref['object']['sha']='c'*40
  with self.assertRaises(ValueError):self.collect(pr,ref)
 def test_live_base_stable_preserves_recorded_and_live_with_provenance(self):
  pr,ref=self.context_fixture();actual=self.collect(pr,ref)
  self.assertEqual(actual['pr']['baseRefOid'],'b'*40)
  self.assertEqual(actual['live']['object']['sha'],'b'*40)
  self.assertEqual(actual['endpoint'],'repos/contaos999999/contaos-hml-control/git/ref/heads/main')
  self.assertTrue(actual['checkedAt']);self.assertEqual(self.paths,[actual['endpoint']])
 def test_live_ref_bad_shape_or_branch_is_rejected(self):
  for change in ('missing','list','sha','type','ref'):
   with self.subTest(change=change):
    pr,ref=self.context_fixture()
    if change=='missing':ref=None
    elif change=='list':ref=[ref]
    elif change=='sha':ref['object']['sha']='bad'
    elif change=='type':ref['object']['type']='tag'
    else:ref['ref']='refs/heads/other'
    with self.assertRaises(ValueError):self.collect(pr,ref)
 def test_live_base_api_failure_propagates(self):
  pr,_=self.context_fixture()
  def api(path):raise RuntimeError('fixture404')
  with self.assertRaises(RuntimeError):self.prep.collect_context(lambda:pr,api,'a'*40,'b'*40,'main')
 def test_live_context_rejects_base_name_change_even_same_oid(self):
  pr,ref=self.context_fixture();pr['baseRefName']='other';ref['ref']='refs/heads/other'
  with self.assertRaises(ValueError):self.collect(pr,ref)
 def test_live_context_checks_head_and_eligibility(self):
  for key,value in [('headRefOid','c'*40),('baseRefOid','c'*40),('state','CLOSED'),('isDraft',True)]:
   pr,ref=self.context_fixture();pr[key]=value
   with self.subTest(key=key),self.assertRaises(ValueError):self.collect(pr,ref)
 def test_live_context_end_detects_ref_and_author_changes(self):
  pr,ref=self.context_fixture();before=self.collect(pr,ref)
  for key in ('author','base'):
   after=copy.deepcopy(before)
   if key=='author':after['pr']['author']['login']='other'
   else:after['live']['object']['sha']='c'*40
   with self.subTest(key=key),self.assertRaises(ValueError):self.prep.assert_context(before,after)
  self.prep.assert_context(before,self.collect(pr,ref))
 def test_live_context_slash_branch_is_encoded(self):
  pr,ref=self.context_fixture();pr['baseRefName']='release/v1';ref['ref']='refs/heads/release/v1'
  result=self.prep.collect_context(lambda:pr,lambda path:(self.assertEqual(path,'repos/contaos999999/contaos-hml-control/git/ref/heads/release%2Fv1') or ref),'a'*40,'b'*40,'release/v1')
  self.assertEqual(result['pr']['baseRefName'],'release/v1')
if __name__=='__main__':unittest.main(verbosity=2)
