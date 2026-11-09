import fs from "node:fs";
import crypto from "node:crypto";
import cp from "node:child_process";
import {createRequire} from "node:module";
import {chromium} from "playwright";
import * as harness from "./harness-original.mjs";
const require=createRequire(import.meta.url);
const root="/vercel/v112-forensic",originalRoot="/vercel/v112-source241",currentRoot="/vercel/v112agent";
const period="01/11/2026 a 30/11/2026",sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const fixture=fs.readFileSync(root+"/fixture.html","utf8");
const controls={PERIOD_ONLY:'<!doctype html><meta charset="utf-8"><p>'+period+"</p>",SOURCE_SHAPED_TABLE:fixture};
const proof={schema:"contaos.v112.offline-forensic.v1",readOnly:true,noHmlNetwork:true,noAuth:true,
 harnessSha:"2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33",frontendSha:"241dd775d14a0d2a1ec24c93ae3f655c79d3efd2",
 currentSourceSha:cp.execFileSync("git",["rev-parse","HEAD"],{cwd:currentRoot,encoding:"utf8"}).trim(),
 fixtureSha256:sha(fixture),scriptSha256:sha(fs.readFileSync(new URL(import.meta.url))),
 harnessFileSha256:sha(fs.readFileSync(root+"/harness-original.mjs")),
 componentSha256:sha(fs.readFileSync(originalRoot+"/src/components/contratos/CompetenciasContrato.tsx")),
 playwrightVersion:require("playwright/package.json").version,executable:chromium.executablePath(),
 launchPolicy:{chromiumSandbox:true,customBrowserArgs:[],hostPlatformOverride:process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE??null},
 dataset:{approvedPeriodOnly:true,otherBusinessCells:"UNSPECIFIED_PLACEHOLDERS_NOT_RUNTIME_VALUES"},
 hostOS:Object.fromEntries(fs.readFileSync("/etc/os-release","utf8").split("\n").filter(l=>/^(ID|VERSION_ID)=/.test(l)).map(l=>{const i=l.indexOf("=");return[l.slice(0,i),l.slice(i+1).replaceAll('"',"")];})),
 source:[],cases:[],browserState:"NOT_RUN",limits:["LOCAL_SOURCE_SHAPED_FIXTURE_ONLY","NO_RAW_ARIA_SAVED","NO_UNKNOWN_TEXT_HASHED","NO_RUN78_PASS_RECLASSIFIED","NO_WCAG_V1_CERTIFICATION"]};
const words=await harness.literalWords(originalRoot);
for(const[label,src]of [["RUN78_SOURCE",originalRoot],["CURRENT_SOURCE",currentRoot]]){
 const w=await harness.literalWords(src);
 proof.source.push({source:label,tokenAllow:{CONNECTOR_A:w.has("a"),DAY_START_01:w.has("01"),ROWHEADER:w.has("rowheader"),METER:w.has("meter")},
 period:harness.classifyArtifactText(period,w)});
}
function categories(text){
 const tokens=text.normalize("NFC").toLocaleLowerCase("pt-BR").match(/[\p{L}\p{N}_-]+/gu)??[];
 const unknown=tokens.filter(t=>!words.has(t));
 const classified=harness.classifyArtifactText(text,words,{snapshot:true}).unknownCount;
 const day=unknown.filter(t=>t==="01").length,role=unknown.filter(t=>t==="rowheader").length;
 return {FIXTURE_DAY_START:day,NATIVE_ROWHEADER:role,OTHER:Math.max(0,classified-day-role),EXISTING_NORMALIZATION_EXCLUDED:Math.max(0,unknown.length-classified)};
}
let browser;
try{
 const binary=cp.spawnSync(chromium.executablePath(),["--version"],{encoding:"utf8"});
 proof.binaryVersion=binary.status===0?binary.stdout.trim():"UNAVAILABLE";
 browser=await chromium.launch({chromiumSandbox:true,headless:true});
 const cdp=await browser.newBrowserCDPSession();
 const commandLine=await cdp.send("Browser.getBrowserCommandLine");
 const forbidden=["--no-sandbox","--disable-setuid-sandbox","--disable-web-security","--allow-running-insecure-content","--ignore-certificate-errors"];
 proof.actualArgPolicy={forbiddenSwitches:commandLine.arguments.filter(a=>forbidden.includes(a)).length,sandboxEnabled:!commandLine.arguments.includes("--no-sandbox")};
 proof.actualExecutable=commandLine.arguments[0];
 const actualVersion=cp.spawnSync(proof.actualExecutable,["--version"],{encoding:"utf8"});
 proof.actualBinaryVersion=actualVersion.status===0?actualVersion.stdout.trim():"UNAVAILABLE";
 await cdp.detach();
 if(proof.actualArgPolicy.forbiddenSwitches)throw new Error("SANDBOX_POLICY");
 proof.browserState="REAL_CHROMIUM_STARTED";proof.browserVersion=browser.version();
 const page=await browser.newPage();await page.route("**/*",route=>route.abort());
 for(const width of [1440,1280,768,390])for(const theme of ["light","dark"])for(const[name,html]of Object.entries(controls)){
  await page.setViewportSize({width,height:1000});await page.setContent(html);
  await page.evaluate(theme=>document.documentElement.classList.toggle("dark",theme==="dark"),theme);
  const rendered=await page.locator("body").innerText(),snapshot=await page.locator("body").ariaSnapshot();
  const noPeriod=snapshot.split(period).join(" "),noNativeRole=noPeriod.replace(/\browheader\b/g," ");
  proof.cases.push({fixture:name,fixtureSha256:sha(html),width,theme,
   rendered:harness.classifyArtifactText(rendered,words),snapshot:harness.classifyArtifactText(snapshot,words,{snapshot:true}),
   categories:categories(snapshot),periodOccurrences:snapshot.split(period).length-1,
   rowheaderOccurrences:(snapshot.match(/\browheader\b/g)??[]).length,
   rowNameContainsPeriod:snapshot.split("\n").some(line=>line.includes('- row "')&&line.includes(period)),
   diagnosticCounterfactuals:{KNOWN_PERIOD_ONLY_REMOVED:harness.classifyArtifactText(noPeriod,words,{snapshot:true}),
    KNOWN_PERIOD_AND_NATIVE_ROLE_REMOVED:harness.classifyArtifactText(noNativeRole,words,{snapshot:true})}});
 }
 proof.browserState="REAL_ARIA_COMPLETE";
}catch(error){
 const message=String(error?.message??"");
 proof.browserState=/sandbox|namespace|Operation not permitted|EPERM/i.test(message)?"SANDBOX_UNAVAILABLE":
 /shared libraries|cannot open shared/i.test(message)?"BROWSER_LIBRARIES_UNAVAILABLE":"BROWSER_UNAVAILABLE";
}finally{
 await browser?.close().catch(()=>{});
 fs.writeFileSync(root+"/proof.json",JSON.stringify(proof,null,2)+"\n");console.log(JSON.stringify(proof));
}
