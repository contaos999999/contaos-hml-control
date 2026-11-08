import pathlib,re,urllib.request,urllib.parse,concurrent.futures,hashlib,json
out=pathlib.Path(__file__).parent; origin='https://scope-and-approval-keeper.lovable.app'; pending={'/assets/index-CjzqjoMJ.js'}; seen={}; total=0
while pending:
 batch=sorted(pending-set(seen));pending=set()
 if not batch:break
 if len(seen)+len(batch)>180:raise RuntimeError('graph limit')
 def get(path):
  f=out/pathlib.Path(path).name
  if f.exists():b=f.read_bytes()
  else:
   with urllib.request.urlopen(origin+path,timeout=30) as r:b=r.read()
   f.write_bytes(b)
  return path,b
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
  for path,b in ex.map(get,batch):
   total+=len(b)
   if total>24000000:raise RuntimeError('size limit')
   seen[path]={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
   s=b.decode('utf-8');refs=re.findall(r'["\'`]((?:\./|/assets/|assets/)[^"\'`\s]+\.js)["\'`]',s)
   for ref in refs:
    norm=urllib.parse.urljoin(origin+path,ref if not ref.startswith('assets/') else '/'+ref)
    u=urllib.parse.urlsplit(norm)
    if u.netloc==urllib.parse.urlsplit(origin).netloc and u.path.startswith('/assets/'): pending.add(u.path)
(out/'published-graph.json').write_text(json.dumps(seen,indent=2)+'\n')
print(json.dumps({'files':len(seen),'bytes':total,'markers':{m:[p for p in seen if m in (out/pathlib.Path(p).name).read_text()] for m in ['Organização atual','Confirmando organização','Não foi possível confirmar a organização.']}},ensure_ascii=False))
