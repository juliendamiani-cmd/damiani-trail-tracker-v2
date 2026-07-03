const defaultRace={
name:"UT4M 50 Belledonne",
start:"08:00",
goal:"08:15",
points:[
{name:"Départ Rioupéroux",km:0,dp:0,dm:0,bh:"",w:0,nut:"Départ calme, bâtons prêts."},
{name:"Arselle",km:8.4,dp:1191,dm:106,bh:"11:30",w:0.225,nut:"Boire tôt. Montée à gérer sans ego."},
{name:"Croix de Chamrousse",km:14,dp:1816,dm:117,bh:"13:15",w:0.405,nut:"Remplir les flasques. Dernier vrai ravito solide avant un long secteur."},
{name:"Refuge de la Pra",km:20.6,dp:2141,dm:588,bh:"15:00",w:0.565,nut:"Point d’eau seulement. Ne pas compter sur du solide."},
{name:"Col de Pré Long",km:33.5,dp:2773,dm:2139,bh:"18:30",w:0.805,nut:"Secteur clé. Manger même sans faim. Protéger les quadriceps."},
{name:"Villard-Bonnot",km:41.6,dp:2835,dm:3133,bh:"20:00",w:0.965,nut:"Descente longue. Cadence courte si les cuisses tapent."},
{name:"Arrivée Le Versoud",km:43,dp:2835,dm:3159,bh:"21:00",w:1,nut:"Dernier effort. Rester lucide jusqu’à l’arche."}
]
};

const checklistItems=["Bâtons","Flasques pleines","Électrolytes","Gels / barres","Gobelet","Coupe-vent","Téléphone chargé","Batterie externe","Frontale","Couverture survie","Sifflet","Casquette / buff","Crème anti-frottements"];

let races=JSON.parse(localStorage.getItem("trail_races")||"null")||[defaultRace];
let active=Number(localStorage.getItem("trail_active")||0);
if(active<0||active>=races.length) active=0;
let times=JSON.parse(localStorage.getItem("trail_times_"+active)||"[]");
let hard=false;

const $=id=>document.getElementById(id);
function race(){return races[active]}
function points(){return race().points}
function saveAll(){localStorage.setItem("trail_races",JSON.stringify(races));localStorage.setItem("trail_active",active);localStorage.setItem("trail_times_"+active,JSON.stringify(times))}
function pc(t){if(!t)return null;let a=t.split(":").map(Number);return a[0]*60+a[1]}
function pd(t){t=(t||"").toLowerCase().replace("h",":");let a=t.split(":").map(Number);return a[0]*60+(a[1]||0)}
function fmt(m){m=Math.round(m);while(m<0)m+=1440;return String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
function dur(m){m=Math.max(0,Math.round(m));return Math.floor(m/60)+"h"+String(m%60).padStart(2,"0")}
function delta(m){let s=m>=0?"+":"-";m=Math.abs(Math.round(m));return s+Math.floor(m/60)+"h"+String(m%60).padStart(2,"0")}
function now(){let d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function last(){let l=0;for(let i=0;i<times.length;i++){if(times[i])l=i}return l}
function totalKm(){return points()[points().length-1].km}
function totalDp(){return points()[points().length-1].dp}
function projectionFinish(){let startM=pc(race().start),goalM=pd(race().goal),l=last();if(l>0&&points()[l].w>0){let elapsed=pc(times[l])-startM;return startM+elapsed/points()[l].w}return startM+goalM}
function target(i){let startM=pc(race().start),goalM=pd(race().goal),l=last();if(times[i])return pc(times[i]);if(l>0){let lf=pc(times[l]),pf=projectionFinish(),denom=1-points()[l].w;if(denom<=0)return pf;return lf+(pf-lf)*((points()[i].w-points()[l].w)/denom)}return startM+goalM*points()[i].w}
function margin(i){if(!points()[i].bh)return null;return pc(points()[i].bh)-target(i)}

function refreshSelect(){let s=$("raceSelect");s.innerHTML="";races.forEach((r,i)=>{let o=document.createElement("option");o.value=i;o.textContent=r.name;s.appendChild(o)});s.value=active}
function changeRace(){active=Number($("raceSelect").value);times=JSON.parse(localStorage.getItem("trail_times_"+active)||"[]");if(!times[0])times[0]=race().start;loadRaceFields();saveAll();render()}
function loadRaceFields(){$("startTime").value=race().start;$("goalTime").value=race().goal}
function saveSettings(){race().start=$("startTime").value;race().goal=$("goalTime").value;if(!times[0])times[0]=race().start;saveAll();render()}
function pointNext(){let i=Math.min(last()+1,points().length-1);times[i]=now();saveAll();render()}
function resetTimes(){if(confirm("Effacer tous les pointages ?")){times=[];times[0]=race().start;saveAll();render()}}
function toggleRaceMode(){$("raceMode").classList.toggle("hidden");scrollTo({top:0,behavior:"smooth"});render()}
function toggleHard(){hard=!hard;render()}
function toggleEditor(){$("editor").classList.toggle("hidden");loadEditor()}
function loadEditor(){$("editName").value=race().name;$("editData").value=points().map(p=>[p.name,p.km,p.dp,p.dm,p.bh,p.nut,p.w].join(";")).join("\\n")}
function saveCourse(){let lines=$("editData").value.split("\\n").filter(Boolean);if(lines.length<2){alert("Il faut au moins un départ et une arrivée.");return}let pts=lines.map((line,i)=>{let a=line.split(";");return{name:a[0]||"Point "+i,km:Number(a[1])||0,dp:Number(a[2])||0,dm:Number(a[3])||0,bh:a[4]||"",nut:a[5]||"",w:a[6]!==undefined&&a[6]!==""?Number(a[6]):i/(lines.length-1)}});races[active]={name:$("editName").value||"Nouvelle course",start:$("startTime").value,goal:$("goalTime").value,points:pts};times=[];times[0]=races[active].start;saveAll();render()}
function duplicateRace(){let c=JSON.parse(JSON.stringify(race()));c.name+=" copie";races.push(c);active=races.length-1;times=[];times[0]=c.start;saveAll();render()}
function deleteRace(){if(races.length===1){alert("Tu dois garder au moins une course.");return}if(confirm("Supprimer cette course ?")){races.splice(active,1);active=0;times=JSON.parse(localStorage.getItem("trail_times_0")||"[]");if(!times[0])times[0]=race().start;saveAll();render()}}
function restoreBelledonne(){let found=races.findIndex(r=>r.name==="UT4M 50 Belledonne");if(found===-1){races.push(JSON.parse(JSON.stringify(defaultRace)));active=races.length-1}else active=found;times=JSON.parse(localStorage.getItem("trail_times_"+active)||"[]");if(!times[0])times[0]=race().start;saveAll();render();alert("UT4M 50 Belledonne restauré.")}
function exportData(){$("importExport").value=JSON.stringify(races,null,2)}
function importData(){try{let imported=JSON.parse($("importExport").value);if(!Array.isArray(imported)){alert("Le JSON doit être une liste de courses.");return}races=imported;active=0;times=[];times[0]=races[0].start;saveAll();render()}catch(e){alert("JSON invalide.")}}

function saveJournal(){["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>{let el=$(id);if(el)localStorage.setItem(id,el.value)})}
function loadJournal(){["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>{let v=localStorage.getItem(id),el=$(id);if(v&&el)el.value=v})}
function copyJournal(){let txt=`Bilan ${race().name}\\nTemps final : ${$("jTime").value}\\nClassement/remarque : ${$("jScore").value}\\nLien activité : ${$("activityLink").value}\\n\\nBien marché :\\n${$("jGood").value}\\n\\nÀ corriger :\\n${$("jImprove").value}`;navigator.clipboard.writeText(txt).then(()=>alert("Bilan copié"))}
function copyFullReport(){let rows=points().map((p,i)=>`${p.name} | prévu ${fmt(target(i))} | réel ${times[i]||"-"} | BH ${p.bh||"-"} | marge ${margin(i)!==null?delta(margin(i)):"-"}`).join("\\n");let txt=`${race().name}\\nObjectif : ${race().goal}\\nProjection : ${fmt(projectionFinish())}\\n\\n${rows}\\n\\nLien activité : ${$("activityLink").value}\\n\\nBilan :\\n${$("jGood").value}\\n\\nÀ corriger :\\n${$("jImprove").value}`;navigator.clipboard.writeText(txt).then(()=>alert("Bilan complet copié"))}
function shareCrew(){let l=last(),p=points()[l],idx=Math.min(l+1,points().length-1),n=points()[idx],m=margin(idx);let txt=`${race().name}\\n\\nDernier point : ${p.name}\\nHeure : ${times[l]||race().start}\\nProjection arrivée : ${fmt(projectionFinish())}\\nProchain point : ${n.name} à ${fmt(target(idx))}\\n${m!==null?"Marge BH : "+delta(m):""}\\n\\nTout va bien 💪`;if(navigator.share)navigator.share({text:txt});else navigator.clipboard.writeText(txt).then(()=>alert("Message copié pour WhatsApp"))}

function saveStateNote(){let l=last(),arr=JSON.parse(localStorage.getItem("state_notes")||"[]");arr.push({race:race().name,point:points()[l].name,time:times[l]||race().start,energy:$("energy").value,moral:$("moral").value,hydration:$("hydration").value,nutrition:$("nutrition").value});localStorage.setItem("state_notes",JSON.stringify(arr));render()}
function renderState(){let arr=JSON.parse(localStorage.getItem("state_notes")||"[]").slice(-5);$("stateHistory").innerHTML=arr.map(x=>`${x.time} ${x.point} · énergie ${x.energy}/5 · moral ${x.moral}/5 · hydratation ${x.hydration} · nutrition ${x.nutrition}`).join("<br>");let e=Number($("energy").value),mo=Number($("moral").value);if(e<=2||mo<=2||$("hydration").value==="Mauvais"||$("nutrition").value==="Mauvais")$("stateAlert").innerHTML="<p class='bad'>⚠️ Risque de coup de moins bien : bois, mange, marche 5 min, repars simple.</p>";else $("stateAlert").innerHTML="<p class='ok'>🟢 État stable.</p>"}
function renderChecklist(){let saved=JSON.parse(localStorage.getItem("checklist")||"{}");$("checklist").innerHTML=checklistItems.map(x=>`<label class="checkrow"><input type="checkbox" ${saved[x]?"checked":""} onchange="saveChecklist('${x}',this.checked)"> ${x}</label>`).join("")}
function saveChecklist(item,val){let saved=JSON.parse(localStorage.getItem("checklist")||"{}");saved[item]=val;localStorage.setItem("checklist",JSON.stringify(saved))}
function resetChecklist(){localStorage.removeItem("checklist");renderChecklist()}
function importGPX(e){let file=e.target.files[0];if(!file)return;let reader=new FileReader();reader.onload=function(){let xml=new DOMParser().parseFromString(reader.result,"text/xml"),pts=[...xml.getElementsByTagName("trkpt")],eles=[...xml.getElementsByTagName("ele")].map(x=>Number(x.textContent)),timesG=[...xml.getElementsByTagName("time")].map(x=>new Date(x.textContent));let dp=0;for(let i=1;i<eles.length;i++){let diff=eles[i]-eles[i-1];if(diff>0)dp+=diff}let duration="";if(timesG.length>1)duration=dur((timesG[timesG.length-1]-timesG[0])/60000);$("gpxResult").innerHTML=`GPX importé : ${pts.length} points · D+ estimé ${Math.round(dp)} m · durée ${duration||"non disponible"}`};reader.readAsText(file)}

function render(){
refreshSelect();loadRaceFields();
let startM=pc(race().start),goalM=pd(race().goal),finishTarget=startM+goalM,finishProj=projectionFinish(),diff=finishProj-finishTarget,l=last(),next=Math.min(l+1,points().length-1),p=points()[next],prev=points()[next-1]||points()[0];
$("targetFinish").innerText=fmt(finishTarget);$("projectedFinish").innerText=fmt(finishProj);
let rs=$("raceStatus");if(l===0){rs.innerText="En attente";rs.className=""}else if(diff<=-15){rs.innerText="Très bien";rs.className="ok"}else if(diff<=15){rs.innerText="Dans le plan";rs.className="warn"}else{rs.innerText="À gérer";rs.className="bad"}
$("progressBar").style.width=Math.min(100,(points()[l].km/totalKm())*100)+"%";$("progressText").innerText=points()[l].km+" km / "+totalKm()+" km · prochain : "+p.name+" à "+fmt(target(next));
$("remainingKm").innerText=(totalKm()-points()[l].km).toFixed(1);$("remainingDp").innerText=totalDp()-points()[l].dp;$("remainingTime").innerText=dur(finishProj-(times[l]?pc(times[l]):startM));
$("currentSector").innerText=(next===0?"Départ":prev.name+" → "+p.name);$("currentInfos").innerHTML="Secteur : <b>"+(p.km-prev.km).toFixed(1)+" km</b> · <b>+"+(p.dp-prev.dp)+" D+</b> · <b>-"+(p.dm-prev.dm)+" D-</b><br>Total : "+p.km+" km · "+p.dp+" D+ · "+p.dm+" D-";$("currentTarget").innerHTML="Passage prévu : <b>"+fmt(target(next))+"</b>";$("currentBarrier").innerHTML="Barrière : <b>"+(p.bh||"aucune")+"</b>";
let m=margin(next),cls=m===null?"small":m<0?"bad":m<45?"warn":"ok";$("currentMargin").className=cls;$("currentMargin").innerText=m===null?"Pas de barrière":"Marge barrière : "+delta(m);$("currentNutrition").innerText=p.nut;
if(hard&&m!==null){$("hardAdvice").classList.remove("hidden");$("hardAdvice").innerText="🛡️ Le Mur approche. Priorité : boire, manger, avancer. Marge estimée : "+Math.round(m)+" min."}else $("hardAdvice").classList.add("hidden");
$("mentalMap").innerHTML=points().map((pt,i)=>`<span class="dot">${i<l?"🟢":i===next?"🟡":"⚪"}</span>${pt.name}`).join("<br>");
let html="";for(let i=1;i<points().length;i++){let a=points()[i-1],b=points()[i],mi=margin(i),c=mi===null?"small":mi<0?"bad":mi<45?"warn":"ok";html+=`<div class="card ${i===next?"next":""}"><h3>⚔️ ${a.name} → ${b.name}</h3><div class="grid"><div><b>${(b.km-a.km).toFixed(1)} km</b><br><span class="small">distance</span></div><div><b>+${b.dp-a.dp} / -${b.dm-a.dm}</b><br><span class="small">D+ / D-</span></div></div><p>Total : ${b.km} km · ${b.dp} D+ · ${b.dm} D-</p><p>Prévu : <b>${fmt(target(i))}</b> · BH : <b>${b.bh||"aucune"}</b></p><p class="${c}">${mi===null?"Pas de barrière":"Marge : "+delta(mi)}</p><p class="small">${b.nut}</p><label>Horaire réel</label><input type="time" value="${times[i]||""}" onchange="times[${i}]=this.value;saveAll();render()"><button onclick="times[${i}]=now();saveAll();render()">Pointer maintenant</button></div>`}
$("sectors").innerHTML=html;if(!$("editor").classList.contains("hidden"))loadEditor();renderState();renderChecklist();
}

function bind(){
$("raceSelect").addEventListener("change",changeRace);$("startTime").addEventListener("change",saveSettings);$("goalTime").addEventListener("change",saveSettings);$("raceModeBtn").onclick=toggleRaceMode;$("shareBtn").onclick=shareCrew;$("editorBtn").onclick=toggleEditor;$("restoreBtn").onclick=restoreBelledonne;$("resetBtn").onclick=resetTimes;$("pointNextBtn").onclick=pointNext;$("hardBtn").onclick=toggleHard;$("closeRaceModeBtn").onclick=toggleRaceMode;$("saveStateBtn").onclick=saveStateNote;$("resetChecklistBtn").onclick=resetChecklist;$("saveRaceBtn").onclick=saveCourse;$("duplicateBtn").onclick=duplicateRace;$("deleteBtn").onclick=deleteRace;$("exportBtn").onclick=exportData;$("importBtn").onclick=importData;$("gpxFile").addEventListener("change",importGPX);$("copyJournalBtn").onclick=copyJournal;$("copyFullBtn").onclick=copyFullReport;["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>$(id).addEventListener("change",saveJournal));
}
if(!times[0])times[0]=race().start;bind();loadJournal();render();
if("serviceWorker" in navigator){navigator.serviceWorker.register("./service-worker.js")}
