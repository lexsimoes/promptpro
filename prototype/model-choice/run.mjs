// Closed prototype; replay requires new owner authorization. Node >=22.18, no dependencies.
import * as fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import console from 'node:console';
const dir=dirname(fileURLToPath(import.meta.url)), root=join(dir,'../..');
let values=[];
const safe=s=>{if(values.some(v=>s.includes(v))||/\bsk-[A-Za-z0-9_-]{16,}\b/.test(s))throw Error('secret');return s;};
try {
  const version=process.argv[3];
  if(process.argv[2]!=='--authorized-replay'||!['v1','v2'].includes(version))throw Error('authorization');
  if(execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim()!=='mission/0002-generate-prompt')throw Error('branch');
  execFileSync('git',['check-ignore','-q','.env'],{cwd:root});
  const env=parseEnv(fs.readFileSync(join(root,'.env'),'utf8')), key=env.LLM_API_KEY?.trim();
  if(!key)throw Error('credential');
  values=Object.entries(env).filter(([k,v])=>/key|token|secret|password/i.test(k)&&v.length>=8).map(([,v])=>v);values.push(key);
  const cases=JSON.parse(fs.readFileSync(join(dir,'cases.json'),'utf8')).cases;
  if(cases.length!==10||cases.some(c=>c.source!=='simulated'))throw Error('cases');
  const system=fs.readFileSync(join(dir,`system-prompt.${version}.txt`),'utf8');
  const out=join(dir,'results',`authorized-replay-${version}`);fs.mkdirSync(out); // Existing directory refuses repeats/concurrent runs.
  let calls=0;
  const save=(name,data)=>fs.writeFileSync(join(out,name),safe(JSON.stringify(data)),{flag:'wx'});
  async function request(path,body,label){
    if(++calls>25)throw Error('cap');
    fs.appendFileSync(join(out,'requests.jsonl'),JSON.stringify({calls,label})+'\n');
    const startedAt=new Date().toISOString(), start=Date.now();
    const r=await globalThis.fetch('https://api.deepseek.com'+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:safe(JSON.stringify(body))}:{}),redirect:'error',signal:globalThis.AbortSignal.timeout(60000)});
    const raw=safe(await r.text()), data=JSON.parse(raw);save(label+'.json',{startedAt,latencyMs:Date.now()-start,status:r.status,request:body??null,response:data});
    if(!r.ok)throw Error('provider');return data;
  }
  const models=await request('/models',null,'models');
  if(!models.data?.some(m=>m.id==='deepseek-flash'))throw Error('model');
  for(const round of [1,2])for(const c of cases)await request('/chat/completions',{model:'deepseek-flash',temperature:0.2,max_tokens:1500,thinking:{type:'disabled'},stream:false,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({ideia:c.idea,tipo_de_projeto:c.projectStatus==='unspecified'?null:c.projectStatus==='new'?'Novo projeto':'Projeto existente'})}]},`${round}-${c.id}`);
  console.log(JSON.stringify({calls,generations:20}));
}catch{console.error('Stopped: no automatic retry. Check authorization, branch, credentials, ledger and sanitized artifacts locally.');process.exitCode=1;}
