import { expect, test, type Page } from '@playwright/test';
import { preflight, loadAttestation } from '../../../scripts/hml-counterproofs/guard.mjs';
const context={sha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,repository:process.env.GITHUB_REPOSITORY};
test.beforeAll(()=>{
 const fixture=loadAttestation();
 const result=preflight(process.env,context,fixture);
 if(!result.pass)throw Error('BLOCKED: '+result.errors.join(','));
});
async function login(page:Page,email:string,password:string){
 await page.goto('/login');
 await page.getByLabel('E-mail').fill(email);
 await page.getByLabel('Senha',{exact:true}).fill(password);
 const authResponses:number[]=[];
 page.on('response',r=>{if(r.url().includes('/auth/v1/token')&&r.request().method()==='POST')authResponses.push(r.status());});
 await page.getByRole('button',{name:/entrar/i}).click();
 await expect.poll(()=>authResponses.length,{timeout:15000}).toBeGreaterThan(0);
 expect(authResponses).toContain(200);
 await expect(page.getByText('E-mail ou senha inválidos.')).toHaveCount(0);
 await expect.poll(()=>new URL(page.url()).pathname,{timeout:15000}).not.toBe('/login');
}
test('HML-AUTH-001: synthetic identity A signs in through live Auth',async({page})=>{
 await login(page,process.env.CONTAOS_HML_USER_A_EMAIL!,process.env.CONTAOS_HML_USER_A_PASSWORD!);
});
test('HML-AUTH-002: synthetic identity B signs in independently',async({page})=>{
 await login(page,process.env.CONTAOS_HML_USER_B_EMAIL!,process.env.CONTAOS_HML_USER_B_PASSWORD!);
});
test('HML-AUTH-003: invalid password is rejected by live Auth',async({page})=>{
 await page.goto('/login');
 await page.getByLabel('E-mail').fill(process.env.CONTAOS_HML_USER_A_EMAIL!);
 await page.getByLabel('Senha',{exact:true}).fill('invalid-synthetic-counterproof-password-2026');
 const statuses:number[]=[];
 page.on('response',r=>{if(r.url().includes('/auth/v1/token')&&r.request().method()==='POST')statuses.push(r.status());});
 await page.getByRole('button',{name:/entrar/i}).click();
 await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();
 expect(statuses.length).toBeGreaterThan(0);
 expect(statuses.every(s=>s!==200)).toBe(true);
});
