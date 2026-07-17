const COURSE_DATA_VERSION="2026-07-17-route-v7-firebase-messages-fix";
const defaultRace={name:"UT4M 50 Belledonne",start:"08:00",goal:"08:15",version:COURSE_DATA_VERSION,notice:"Parcours modifié : passage par le col de Freydane supprimé en raison de névés persistants.",points:[{name:"Départ Rioupéroux",km:0,dp:0,dm:0,bh:"",w:0,nut:"Départ très calme. Bâtons prêts, manger et boire dès la première demi-heure."},{name:"Arselle",km:8.3,dp:1190,dm:105,bh:"11:30",w:0.225,nut:"Boire tôt. Gérer la montée sans ego et repartir sans perdre de temps."},{name:"Croix de Chamrousse",km:14.0,dp:1813,dm:117,bh:"13:15",w:0.405,nut:"Vrai ravitaillement : refaire les flasques et emporter assez de solide jusqu'à Pré Long."},{name:"Refuge de la Pra",km:20.6,dp:2150,dm:590,bh:"15:00",w:0.565,nut:"Point d’eau uniquement. Continuer à s’alimenter avec ce qui a été pris à Chamrousse."},{name:"Col de Pré Long",km:32.1,dp:2679,dm:2045,bh:"18:30",w:0.79,nut:"Secteur clé raccourci mais toujours exigeant. Manger même sans faim et protéger les quadriceps."},{name:"Villard-Bonnot",km:40.1,dp:2741,dm:3039,bh:"20:00",w:0.96,nut:"Fin de la longue descente. Relancer progressivement vers Le Versoud."},{name:"Arrivée Le Versoud",km:41.5,dp:2741,dm:3065,bh:"21:00",w:1,nut:"Dernier effort sur 1,4 km. Rester lucide jusqu’à l’arche."}]};
let races=JSON.parse(localStorage.getItem("trail_races")||"null")||[defaultRace],active=Number(localStorage.getItem("trail_active")||0);
// Mise à niveau automatique de l'ancien tracé UT4M, sans toucher aux autres courses créées.
let upgraded=false;
races=races.map(r=>{if(r&&r.name==="UT4M 50 Belledonne"&&r.version!==COURSE_DATA_VERSION){upgraded=true;return JSON.parse(JSON.stringify(defaultRace))}return r});
if(upgraded)localStorage.setItem("trail_races",JSON.stringify(races));if(active<0||active>=races.length)active=0;let times=JSON.parse(localStorage.getItem("trail_times_"+active)||"[]"),hard=false;const $=id=>document.getElementById(id);
function race(){return races[active]}function points(){return race().points}function saveAll(){localStorage.setItem("trail_races",JSON.stringify(races));localStorage.setItem("trail_active",active);localStorage.setItem("trail_times_"+active,JSON.stringify(times))}
function pc(t){if(!t)return null;let a=t.split(":").map(Number);return a[0]*60+a[1]}function pd(t){t=(t||"").toLowerCase().replace("h",":");let a=t.split(":").map(Number);return a[0]*60+(a[1]||0)}function fmt(m){m=Math.round(m);while(m<0)m+=1440;return String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}function dur(m){m=Math.max(0,Math.round(m));return Math.floor(m/60)+"h"+String(m%60).padStart(2,"0")}function delta(m){let s=m>=0?"+":"-";m=Math.abs(Math.round(m));return s+Math.floor(m/60)+"h"+String(m%60).padStart(2,"0")}function now(){let d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}function last(){let l=0;for(let i=0;i<times.length;i++){if(times[i])l=i}return l}function totalKm(){return points()[points().length-1].km}function totalDp(){return points()[points().length-1].dp}function totalDm(){return points()[points().length-1].dm}
function projectionFinish(){let startM=pc(race().start),goalM=pd(race().goal),l=last();if(l>0&&points()[l].w>0){let elapsed=pc(times[l])-startM;return startM+elapsed/points()[l].w}return startM+goalM}
function target(i){let startM=pc(race().start),goalM=pd(race().goal),l=last();if(times[i])return pc(times[i]);if(l>0){let lf=pc(times[l]),pf=projectionFinish(),denom=1-points()[l].w;if(denom<=0)return pf;return lf+(pf-lf)*((points()[i].w-points()[l].w)/denom)}return startM+goalM*points()[i].w}
function margin(i){if(!points()[i].bh)return null;return pc(points()[i].bh)-target(i)}function data(){let l=last(),next=Math.min(l+1,points().length-1),p=points()[next],prev=points()[next-1]||points()[0];return{l,next,p,prev}}function secLabel(m){if(m===null)return{txt:"Pas de barrière prochaine",cls:"small",emoji:"⚪"};if(m>=60)return{txt:"Excellent",cls:"ok",emoji:"🟢"};if(m>=30)return{txt:"Correct",cls:"ok",emoji:"🟢"};if(m>=15)return{txt:"Vigilance",cls:"warn",emoji:"🟡"};if(m>=0)return{txt:"Limite",cls:"warn",emoji:"🟠"};return{txt:"Critique",cls:"bad",emoji:"🔴"}}
function refreshSelect(){let s=$("raceSelect");s.innerHTML="";races.forEach((r,i)=>{let o=document.createElement("option");o.value=i;o.textContent=r.name;s.appendChild(o)});s.value=active}
function changeRace(){active=Number($("raceSelect").value);times=JSON.parse(localStorage.getItem("trail_times_"+active)||"[]");if(!times[0])times[0]=race().start;loadRaceFields();saveAll();render()}function loadRaceFields(){$("startTime").value=race().start;$("goalTime").value=race().goal}function saveSettings(){race().start=$("startTime").value;race().goal=$("goalTime").value;if(!times[0])times[0]=race().start;saveAll();render()}function pointNext(){let i=Math.min(last()+1,points().length-1);times[i]=now();localStorage.removeItem(manualPositionKey());saveAll();render()}function resetTimes(){if(confirm("Réinitialiser la course ? Tous les pointages, les informations d’état et les messages des proches seront supprimés.")){times=[];times[0]=race().start;localStorage.removeItem(CLOSE_HISTORY_KEY);localStorage.removeItem("state_notes");localStorage.removeItem(manualPositionKey());if($("closeMessage"))$("closeMessage").value="";saveAll();render();renderFamilyDashboard();alert("La course a été réinitialisée. Les pointages, les informations d’état et les messages des proches ont été supprimés.")}}function toggleRaceMode(){$("raceMode").classList.toggle("hidden");scrollTo({top:0,behavior:"smooth"});render()}function toggleHard(){hard=!hard;render()}function toggleCloseMode(){$("closeMode").classList.toggle("hidden");scrollTo({top:$("closeMode").offsetTop-70,behavior:"smooth"});render()}function toggleEditor(){$("editor").classList.toggle("hidden");loadEditor()}
function loadEditor(){$("editName").value=race().name;$("editData").value=points().map(p=>[p.name,p.km,p.dp,p.dm,p.bh,p.nut,p.w].join(";")).join("\n")}function saveCourse(){let lines=$("editData").value.split("\n").filter(Boolean);if(lines.length<2){alert("Il faut au moins un départ et une arrivée.");return}let pts=lines.map((line,i)=>{let a=line.split(";");return{name:a[0]||"Point "+i,km:Number(a[1])||0,dp:Number(a[2])||0,dm:Number(a[3])||0,bh:a[4]||"",nut:a[5]||"",w:a[6]!==undefined&&a[6]!==""?Number(a[6]):i/(lines.length-1)}});races[active]={name:$("editName").value||"Nouvelle course",start:$("startTime").value,goal:$("goalTime").value,version:race().version||"custom",notice:race().notice||"",points:pts};times=[];times[0]=races[active].start;saveAll();render()}function duplicateRace(){let c=JSON.parse(JSON.stringify(race()));c.name+=" copie";races.push(c);active=races.length-1;times=[];times[0]=c.start;saveAll();render()}function deleteRace(){if(races.length===1){alert("Tu dois garder au moins une course.");return}if(confirm("Supprimer cette course ?")){races.splice(active,1);active=0;times=JSON.parse(localStorage.getItem("trail_times_0")||"[]");if(!times[0])times[0]=race().start;saveAll();render()}}function restoreBelledonne(){let found=races.findIndex(r=>r.name==="UT4M 50 Belledonne");if(found===-1){races.push(JSON.parse(JSON.stringify(defaultRace)));active=races.length-1}else{races[found]=JSON.parse(JSON.stringify(defaultRace));active=found}times=[];times[0]=race().start;saveAll();render();alert("UT4M 50 Belledonne mis à jour avec le nouveau parcours.")}function exportData(){$("importExport").value=JSON.stringify(races,null,2)}function importData(){try{let imported=JSON.parse($("importExport").value);if(!Array.isArray(imported)){alert("Le JSON doit être une liste de courses.");return}races=imported;active=0;times=[];times[0]=races[0].start;saveAll();render()}catch(e){alert("JSON invalide.")}}
function saveJournal(){["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>{let el=$(id);if(el)localStorage.setItem(id,el.value)})}function loadJournal(){["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>{let v=localStorage.getItem(id),el=$(id);if(v&&el)el.value=v})}function copyJournal(){let txt=`Bilan ${race().name}\nTemps final : ${$("jTime").value}\nClassement/remarque : ${$("jScore").value}\nLien activité : ${$("activityLink").value}\n\nBien marché :\n${$("jGood").value}\n\nÀ corriger :\n${$("jImprove").value}`;navigator.clipboard.writeText(txt).then(()=>alert("Bilan copié"))}function copyFullReport(){let rows=points().map((p,i)=>`${p.name} | prévu ${fmt(target(i))} | réel ${times[i]||"-"} | BH ${p.bh||"-"} | marge ${margin(i)!==null?delta(margin(i)):"-"}`).join("\n");let txt=`${race().name}\nObjectif : ${race().goal}\nProjection : ${fmt(projectionFinish())}\n\n${rows}\n\nLien activité : ${$("activityLink").value}\n\nBilan :\n${$("jGood").value}\n\nÀ corriger :\n${$("jImprove").value}`;navigator.clipboard.writeText(txt).then(()=>alert("Bilan complet copié"))}
const CLOSE_HISTORY_KEY="close_history_v27";
const LEGACY_CLOSE_HISTORY_KEY="close_history_v26";
if(!localStorage.getItem(CLOSE_HISTORY_KEY)&&localStorage.getItem(LEGACY_CLOSE_HISTORY_KEY)){localStorage.setItem(CLOSE_HISTORY_KEY,localStorage.getItem(LEGACY_CLOSE_HISTORY_KEY));localStorage.removeItem(LEGACY_CLOSE_HISTORY_KEY)}
const phraseBank={
 physical:{verygood:"Je me sens très bien physiquement.",good:"Je me sens bien physiquement.",correct:"Physiquement, ça reste correct.",hard:"Physiquement, la course devient difficile.",veryhard:"Physiquement, c’est vraiment très difficile en ce moment."},
 mental:{motivated:"Je suis très motivé et le moral est bon.",focused:"Je reste concentré sur ma course.",confident:"La fatigue est là, mais je reste confiant.",low:"Je traverse un petit coup de moins bien mentalement.",holding:"Le mental est mis à l’épreuve, mais je m’accroche."},
 stomach:{normal:"J’arrive à manger normalement.",less:"J’ai moins faim, mais je continue à m’alimenter.",nausea:"J’ai quelques nausées, donc je mange par petites quantités.",blocked:"J’ai beaucoup de mal à manger pour le moment."},
 hydrationClose:{ok:"Je m’hydrate correctement et tout va bien de ce côté-là.",hot:"Il fait très chaud, alors je fais particulièrement attention à boire.",low:"Je commence à manquer d’eau et je dois mieux gérer mon hydratation.",difficult:"L’hydratation devient compliquée et je dois vraiment la surveiller."},
 legs:{excellent:"Mes jambes répondent très bien.",good:"Mes jambes répondent bien.",heavy:"Mes jambes commencent à être lourdes, mais je continue d’avancer.",cramps:"J’ai des crampes, donc je ralentis un peu pour les gérer.",painful:"Mes jambes sont très douloureuses et chaque pas demande davantage d’effort."}
};
const personalMessages={none:"",allgood:"Tout va bien.",enjoy:"Je profite.",dontworry:"Ne vous inquiétez pas.",thinking:"Je pense à vous.",suffering:"J’en bave.",encourage:"J’ai besoin d’encouragements."};
function selectedRadio(name){let el=document.querySelector(`input[name="${name}"]:checked`);return el?el.value:""}
function buildFirstPersonSummary(v){let parts=[phraseBank.physical[v.physical],phraseBank.mental[v.mental],phraseBank.stomach[v.stomach],phraseBank.hydrationClose[v.hydrationClose],phraseBank.legs[v.legs]].filter(Boolean);let text=parts.join(" ");let personal=personalMessages[v.personal]||"";let free=(v.free||"").trim();if(personal)text+="\n\n"+personal;if(free)text+="\n\n"+free;return text}
function currentHealthSelection(){return{physical:selectedRadio("physical"),mental:selectedRadio("mental"),stomach:selectedRadio("stomach"),hydrationClose:selectedRadio("hydrationClose"),legs:selectedRadio("legs"),personal:selectedRadio("closePersonal"),free:$("closeFreeMessage").value}}
function healthHistory(){try{return JSON.parse(localStorage.getItem(CLOSE_HISTORY_KEY)||"[]")}catch(e){return[]}}
function saveHealthHistory(hist){localStorage.setItem(CLOSE_HISTORY_KEY,JSON.stringify(hist.slice(-20)))}
function generateCloseMessage(){let values=currentHealthSelection(),summary=buildFirstPersonSummary(values),l=last(),entry={timestamp:new Date().toISOString(),time:now(),point:points()[l].name,summary,values};let hist=healthHistory();hist.push(entry);saveHealthHistory(hist);$("closeMessage").value=summary;renderCloseHistory();renderFamilyDashboard();}
async function shareCloseMessage(){let txt=$("closeMessage").value.trim();if(!txt){generateCloseMessage();txt=$("closeMessage").value.trim()}try{if(navigator.share)await navigator.share({title:"Nouvelles de Julien",text:txt});else{await navigator.clipboard.writeText(txt);alert("Résumé copié.")}}catch(e){}}
function renderCloseHistory(){let hist=healthHistory().slice(-6).reverse();$("closeHistory").innerHTML=hist.length?'<h3>Mes dernières mises à jour</h3>'+hist.map(h=>`<article class="health-history-item"><b>${h.time} · ${h.point}</b><p>${h.summary.replace(/\n/g,"<br>")}</p></article>`).join(""):"Aucune mise à jour enregistrée."}
function importGPX(e){let file=e.target.files[0];if(!file)return;let reader=new FileReader();reader.onload=function(){let xml=new DOMParser().parseFromString(reader.result,"text/xml"),pts=[...xml.getElementsByTagName("trkpt")],eles=[...xml.getElementsByTagName("ele")].map(x=>Number(x.textContent)),timesG=[...xml.getElementsByTagName("time")].map(x=>new Date(x.textContent));let dp=0;for(let i=1;i<eles.length;i++){let diff=eles[i]-eles[i-1];if(diff>0)dp+=diff}let duration="";if(timesG.length>1)duration=dur((timesG[timesG.length-1]-timesG[0])/60000);$("gpxResult").innerHTML=`GPX importé : ${pts.length} points · D+ estimé ${Math.round(dp)} m · durée ${duration||"non disponible"}`};reader.readAsText(file)}
function render(){refreshSelect();loadRaceFields();let startM=pc(race().start),goalM=pd(race().goal),finishTarget=startM+goalM,finishProj=projectionFinish(),diff=finishProj-finishTarget,{l,next,p,prev}=data(),doneKm=points()[l].km,pct=Math.round((doneKm/totalKm())*100),nextDist=p.km-prev.km,nextDp=p.dp-prev.dp,nextDm=p.dm-prev.dm,nextTime=target(next)-(times[l]?pc(times[l]):startM),m=margin(next),s=secLabel(m);$("targetFinish").innerText=fmt(finishTarget);$("projectedFinish").innerText=fmt(finishProj);let rs=$("raceStatus");if(l===0){rs.innerText="En attente";rs.className=""}else if(diff<=-15){rs.innerText="Très bien";rs.className="ok"}else if(diff<=15){rs.innerText="Dans le plan";rs.className="warn"}else{rs.innerText="À gérer";rs.className="bad"}$("progressBar").style.width=Math.min(100,pct)+"%";$("progressText").innerText=doneKm+" km / "+totalKm()+" km · prochain : "+p.name+" à "+fmt(target(next));$("routeNotice").innerText=race().notice||"";$("routeNotice").classList.toggle("hidden",!race().notice);$("progressPercent").innerText=pct+"%";$("remainingKm").innerText=(totalKm()-doneKm).toFixed(1);$("doneDp").innerText=points()[l].dp+" m";$("remainingDp").innerText=(totalDp()-points()[l].dp)+" m";$("remainingDm").innerText=(totalDm()-points()[l].dm)+" m";$("remainingTime").innerText=dur(finishProj-(times[l]?pc(times[l]):startM));$("securityLevel").innerHTML=`<span class="${s.cls}">${s.emoji} Niveau de sécurité : ${s.txt}${m!==null?" · marge "+delta(m):""}</span>`;$("missionTitle").innerText=p.name;$("missionDistance").innerText=nextDist.toFixed(1)+" km";$("missionElevation").innerText="+"+nextDp+" / -"+nextDm+" m";$("missionTime").innerText=dur(nextTime)+" estimée";$("missionAdvice").innerText=p.nut||"Boire, manger, avancer.";$("currentSector").innerText=(next===0?"Départ":prev.name+" → "+p.name);$("currentInfos").innerHTML="Secteur : <b>"+nextDist.toFixed(1)+" km</b> · <b>+"+nextDp+" D+</b> · <b>-"+nextDm+" D-</b><br>Total : "+p.km+" km · "+p.dp+" D+ · "+p.dm+" D-";if($("raceNextDistance"))$("raceNextDistance").innerText=nextDist.toFixed(1)+" km";if($("raceNextElevation"))$("raceNextElevation").innerText="+"+nextDp+" / -"+nextDm;if($("raceNextEta"))$("raceNextEta").innerText=fmt(target(next));$("currentTarget").innerHTML="Passage prévu : <b>"+fmt(target(next))+"</b>";$("currentBarrier").innerHTML="Barrière : <b>"+(p.bh||"aucune")+"</b>";$("currentMargin").className=s.cls;$("currentMargin").innerText=m===null?"Pas de barrière":"Marge barrière : "+delta(m);$("currentNutrition").innerText=p.nut;if(hard&&m!==null){$("hardAdvice").classList.remove("hidden");$("hardAdvice").innerText="🛡️ Le Mur approche. Priorité : boire, manger, avancer. Marge estimée : "+Math.round(m)+" min."}else $("hardAdvice").classList.add("hidden");$("mentalMap").innerHTML=points().map((pt,i)=>`<span class="dot">${i<l?"✅":i===next?"🔵":"⚪"}</span>${pt.name}`).join("<br>");let html="";for(let i=1;i<points().length;i++){let a=points()[i-1],b=points()[i],mi=margin(i),si=secLabel(mi);html+=`<div class="card ${i===next?"next":""}"><h3>⚔️ ${a.name} → ${b.name}</h3><div class="grid"><div><b>${(b.km-a.km).toFixed(1)} km</b><br><span class="small">distance</span></div><div><b>+${b.dp-a.dp} / -${b.dm-a.dm}</b><br><span class="small">D+ / D-</span></div></div><p>Total : ${b.km} km · ${b.dp} D+ · ${b.dm} D-</p><p>Prévu : <b>${fmt(target(i))}</b> · BH : <b>${b.bh||"aucune"}</b></p><p class="${si.cls}">${mi===null?"Pas de barrière":"Marge : "+delta(mi)}</p><p class="small">${b.nut}</p><label>Horaire réel</label><input type="time" value="${times[i]||""}" onchange="times[${i}]=this.value;saveAll();render()"><button onclick="times[${i}]=now();saveAll();render()">Pointer maintenant</button></div>`}$("sectors").innerHTML=html;if(!$("editor").classList.contains("hidden"))loadEditor();renderCloseHistory()}

// ===== V29 · position kilométrique manuelle =====
const MANUAL_POSITION_PREFIX="dtt_manual_position_v29_";
function manualPositionKey(){return MANUAL_POSITION_PREFIX+active}
function storedManualPosition(){
  try{
    const x=JSON.parse(localStorage.getItem(manualPositionKey())||"null");
    if(x&&Number.isFinite(Number(x.km)))return{km:Math.max(0,Math.min(totalKm(),Number(x.km))),updatedAt:x.updatedAt||""};
  }catch(e){}
  return null;
}
function currentPosition(){
  const manual=storedManualPosition();
  if(manual)return{km:manual.km,updatedAt:manual.updatedAt,source:"manual"};
  return{km:points()[last()].km,updatedAt:times[last()]||"",source:"checkpoint"};
}
function saveManualPosition(km,quiet=false){
  const value=Math.max(0,Math.min(totalKm(),Number(String(km).replace(",","."))||0));
  const d=new Date();
  localStorage.setItem(manualPositionKey(),JSON.stringify({km:value,updatedAt:d.toISOString()}));
  syncManualPositionControls();
  render();
  if(!quiet)alert(`Position mise à jour au km ${value.toFixed(1).replace(".",",")}. Elle est maintenant visible dans le Mode Proches.`);
}
function clearManualPosition(quiet=false){
  localStorage.removeItem(manualPositionKey());
  syncManualPositionControls();
  render();
  if(!quiet)alert("La position suit de nouveau le dernier pointage enregistré.");
}
function positionUpdatedLabel(pos=currentPosition()){
  if(pos.source!=="manual"||!pos.updatedAt)return"Position issue du dernier pointage.";
  const d=new Date(pos.updatedAt);
  if(Number.isNaN(d.getTime()))return"Position mise à jour manuellement.";
  return`Position mise à jour manuellement le ${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}.`;
}
function syncManualPositionControls(){
  const pos=currentPosition(),max=totalKm();
  if($("manualKmSlider")){ $("manualKmSlider").max=max; $("manualKmSlider").value=pos.km; }
  if($("manualKmInput")){ $("manualKmInput").max=max; $("manualKmInput").value=pos.km.toFixed(1); }
  if($("manualKmDisplay"))$("manualKmDisplay").textContent=pos.km.toFixed(1).replace(".",",")+" km";
}
function nextPointFromKm(km){return points().findIndex(p=>p.km>km+0.001)}
function previousPointFromKm(km){let i=0;points().forEach((p,n)=>{if(p.km<=km+0.001)i=n});return i}
function cumulativeProfileAt(km){
  let up=0,down=0,lastP=UT4M_PROFILE[0];
  for(let i=1;i<UT4M_PROFILE.length;i++){
    let p=UT4M_PROFILE[i];
    if(p[0]>km){p=[km,profileElevationAt(km)];}
    const d=p[1]-lastP[1];if(d>0)up+=d;else down-=d;
    lastP=p;if(p[0]>=km)break;
  }
  const rawUp=UT4M_PROFILE.slice(1).reduce((a,p,i)=>a+Math.max(0,p[1]-UT4M_PROFILE[i][1]),0)||1;
  const rawDown=UT4M_PROFILE.slice(1).reduce((a,p,i)=>a+Math.max(0,UT4M_PROFILE[i][1]-p[1]),0)||1;
  return{dp:Math.round(up*totalDp()/rawUp),dm:Math.round(down*totalDm()/rawDown)};
}

// ===== V28 · profil altimétrique issu du GPX fourni =====
const UT4M_PROFILE=[[0.0,546],[0.16,540],[0.32,532],[0.481,525],[0.641,519],[0.801,512],[0.961,506],[1.122,504],[1.282,498],[1.442,497],[1.602,481],[1.763,483],[1.923,498],[2.083,518],[2.243,524],[2.403,531],[2.564,537],[2.724,535],[2.884,520],[3.044,520],[3.205,545],[3.365,550],[3.525,585],[3.685,653],[3.846,725],[4.006,768],[4.166,829],[4.326,875],[4.486,934],[4.647,1003],[4.807,1048],[4.967,1101],[5.127,1188],[5.288,1290],[5.448,1361],[5.608,1435],[5.768,1492],[5.929,1544],[6.089,1588],[6.249,1604],[6.409,1608],[6.569,1621],[6.73,1616],[6.89,1616],[7.05,1620],[7.21,1627],[7.371,1625],[7.531,1618],[7.691,1614],[7.851,1616],[8.012,1620],[8.172,1625],[8.332,1636],[8.492,1643],[8.653,1651],[8.813,1648],[8.973,1647],[9.133,1656],[9.293,1657],[9.454,1671],[9.614,1694],[9.774,1712],[9.934,1731],[10.095,1771],[10.255,1809],[10.415,1858],[10.575,1875],[10.736,1882],[10.896,1916],[11.056,1914],[11.216,1924],[11.376,1950],[11.537,1968],[11.697,1998],[11.857,2023],[12.017,2031],[12.178,2065],[12.338,2060],[12.498,2072],[12.658,2076],[12.819,2119],[12.979,2148],[13.139,2159],[13.299,2171],[13.459,2196],[13.62,2226],[13.78,2246],[13.94,2242],[14.1,2244],[14.261,2215],[14.421,2189],[14.581,2161],[14.741,2123],[14.902,2105],[15.062,2074],[15.222,2041],[15.382,2006],[15.542,1995],[15.703,2000],[15.863,2012],[16.023,2009],[16.183,1994],[16.344,1947],[16.504,1931],[16.664,1920],[16.824,1919],[16.985,1916],[17.145,1921],[17.305,1939],[17.465,1903],[17.625,1858],[17.786,1838],[17.946,1865],[18.106,1888],[18.266,1910],[18.427,1952],[18.587,1988],[18.747,2007],[18.907,2036],[19.068,2030],[19.228,2036],[19.388,2039],[19.548,2049],[19.708,2051],[19.869,2049],[20.029,2050],[20.189,2080],[20.349,2085],[20.51,2094],[20.67,2121],[20.83,2145],[20.99,2154],[21.151,2125],[21.311,2097],[21.471,2073],[21.631,2060],[21.792,2042],[21.952,2025],[22.112,2003],[22.272,1986],[22.432,1981],[22.593,2036],[22.753,2087],[22.913,2114],[23.073,2151],[23.234,2193],[23.394,2227],[23.554,2255],[23.714,2272],[23.875,2335],[24.035,2354],[24.195,2326],[24.355,2277],[24.515,2240],[24.676,2212],[24.836,2187],[24.996,2154],[25.156,2132],[25.317,2123],[25.477,2098],[25.637,2022],[25.797,1952],[25.958,1890],[26.118,1854],[26.278,1786],[26.438,1734],[26.598,1719],[26.759,1694],[26.919,1675],[27.079,1641],[27.239,1600],[27.4,1571],[27.56,1518],[27.72,1488],[27.88,1466],[28.041,1441],[28.201,1426],[28.361,1413],[28.521,1426],[28.681,1426],[28.842,1412],[29.002,1411],[29.162,1396],[29.322,1384],[29.483,1378],[29.643,1378],[29.803,1361],[29.963,1362],[30.124,1370],[30.284,1358],[30.444,1350],[30.604,1349],[30.764,1341],[30.925,1322],[31.085,1290],[31.245,1261],[31.405,1240],[31.566,1215],[31.726,1193],[31.886,1185],[32.046,1179],[32.207,1202],[32.367,1225],[32.527,1241],[32.687,1224],[32.847,1215],[33.008,1187],[33.168,1172],[33.328,1136],[33.488,1092],[33.649,1050],[33.809,1004],[33.969,975],[34.129,947],[34.29,910],[34.45,871],[34.61,850],[34.77,812],[34.931,790],[35.091,775],[35.251,765],[35.411,747],[35.571,735],[35.732,730],[35.892,728],[36.052,723],[36.212,705],[36.373,678],[36.533,663],[36.693,657],[36.853,640],[37.014,629],[37.174,617],[37.334,605],[37.494,592],[37.654,565],[37.815,546],[37.975,508],[38.135,488],[38.295,480],[38.456,467],[38.616,463],[38.776,462],[38.936,465],[39.097,423],[39.257,402],[39.417,350],[39.577,313],[39.737,272],[39.898,250],[40.058,245],[40.218,238],[40.378,234],[40.539,231],[40.699,227],[40.859,225],[41.019,224],[41.18,222],[41.34,222],[41.5,222]];
function profileElevationAt(km){
  if(!UT4M_PROFILE.length)return 0;
  km=Math.max(0,Math.min(totalKm(),Number(km)||0));
  let i=0; while(i+1<UT4M_PROFILE.length&&UT4M_PROFILE[i+1][0]<km)i++;
  if(i+1>=UT4M_PROFILE.length)return UT4M_PROFILE[UT4M_PROFILE.length-1][1];
  const a=UT4M_PROFILE[i],b=UT4M_PROFILE[i+1],t=(km-a[0])/(b[0]-a[0]||1); return Math.round(a[1]+t*(b[1]-a[1]));
}
function renderElevationProfile(containerId,compact=false){
  const el=$(containerId); if(!el)return;
  if(race().name!=="UT4M 50 Belledonne"){el.innerHTML='<p class="small">Le profil détaillé est disponible pour l’UT4M 50 Belledonne.</p>';return}
  const W=760,H=compact?210:250,pad={l:42,r:15,t:18,b:34},minE=Math.min(...UT4M_PROFILE.map(p=>p[1]))-50,maxE=Math.max(...UT4M_PROFILE.map(p=>p[1]))+70;
  const x=km=>pad.l+(km/totalKm())*(W-pad.l-pad.r),y=e=>pad.t+(maxE-e)/(maxE-minE)*(H-pad.t-pad.b);
  const line=UT4M_PROFILE.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)).join(' ');
  const fill=line+' L'+x(totalKm()).toFixed(1)+','+(H-pad.b)+' L'+x(0).toFixed(1)+','+(H-pad.b)+' Z';
  const pos=currentPosition(),km=pos.km,ele=profileElevationAt(km),mx=x(km),my=y(ele);
  const donePts=UT4M_PROFILE.filter(p=>p[0]<=km); if(!donePts.length||donePts[donePts.length-1][0]<km)donePts.push([km,ele]);
  const done=donePts.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)).join(' ');
  let grid=''; [500,1000,1500,2000].forEach(e=>{if(e>=minE&&e<=maxE)grid+=`<line class="elevation-grid" x1="${pad.l}" y1="${y(e)}" x2="${W-pad.r}" y2="${y(e)}"/><text class="elevation-axis" x="4" y="${y(e)+4}">${e} m</text>`});
  [0,10,20,30,40].forEach(k=>grid+=`<line class="elevation-grid" x1="${x(k)}" y1="${pad.t}" x2="${x(k)}" y2="${H-pad.b}"/><text class="elevation-axis" text-anchor="middle" x="${x(k)}" y="${H-10}">${k} km</text>`);
  const cps=points().map((p,i)=>`<circle class="elevation-checkpoint" cx="${x(p.km)}" cy="${y(profileElevationAt(p.km))}" r="3"><title>${p.name} · ${p.km} km</title></circle>`).join('');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil altimétrique et position actuelle"><path class="elevation-fill" d="${fill}"/>${grid}<path class="elevation-line" d="${line}"/><path class="elevation-done" d="${done}"/>${cps}<line class="elevation-marker-line" x1="${mx}" y1="${my}" x2="${mx}" y2="${H-pad.b}"/><circle class="elevation-marker" cx="${mx}" cy="${my}" r="7"/><text class="elevation-label" text-anchor="${mx>W-150?'end':'start'}" x="${mx+(mx>W-150?-10:10)}" y="${Math.max(15,my-10)}">Vous êtes ici · ${km.toFixed(1)} km</text></svg>`;
  const cum=cumulativeProfileAt(km),nextIndex=nextPointFromKm(km),next=nextIndex<0?null:points()[nextIndex];
  const info=`<div><b>${km.toFixed(1)} km</b><span>position connue</span></div><div><b>${ele} m</b><span>altitude estimée</span></div><div><b>${Math.max(0,totalKm()-km).toFixed(1)} km</b><span>distance restante</span></div><div><b>${Math.max(0,totalDp()-cum.dp)} m</b><span>D+ restant</span></div><div><b>${Math.max(0,totalDm()-cum.dm)} m</b><span>D- restant</span></div><div><b>${next?next.name:'Arrivée'}</b><span>${next?`dans ${(next.km-km).toFixed(1)} km`:'course terminée'}</span></div>`;
  if(containerId==='runnerElevationProfile'&&$('elevationPositionInfo'))$('elevationPositionInfo').innerHTML=info;
  if(containerId==='familyElevationProfile'&&$('familyElevationPositionInfo')){
    $('familyElevationPositionInfo').innerHTML=info;
    if($('familyPositionUpdated'))$('familyPositionUpdated').textContent=positionUpdatedLabel(pos);
  }
}
function renderAllProfiles(){syncManualPositionControls();renderElevationProfile('runnerElevationProfile');renderElevationProfile('familyElevationProfile',true)}

function bind(){$("raceSelect").addEventListener("change",changeRace);$("startTime").addEventListener("change",saveSettings);$("goalTime").addEventListener("change",saveSettings);$("raceModeBtn").onclick=toggleRaceMode;$("closeModeBtn").onclick=toggleCloseMode;$("editorBtn").onclick=toggleEditor;$("restoreBtn").onclick=restoreBelledonne;$("resetBtn").onclick=resetTimes;$("pointNextBtn").onclick=pointNext;$("hardBtn").onclick=toggleHard;$("closeRaceModeBtn").onclick=toggleRaceMode;$("generateCloseBtn").onclick=generateCloseMessage;$("shareCloseBtn").onclick=shareCloseMessage;$("saveRaceBtn").onclick=saveCourse;$("duplicateBtn").onclick=duplicateRace;$("deleteBtn").onclick=deleteRace;$("exportBtn").onclick=exportData;$("importBtn").onclick=importData;$("gpxFile").addEventListener("change",importGPX);$("copyJournalBtn").onclick=copyJournal;$("copyFullBtn").onclick=copyFullReport;$("manualKmSlider").addEventListener("input",e=>{const v=Number(e.target.value);$("manualKmInput").value=v.toFixed(1);$("manualKmDisplay").textContent=v.toFixed(1).replace(".",",")+" km";saveManualPosition(v,true)});$("manualKmInput").addEventListener("input",e=>{let v=Math.max(0,Math.min(totalKm(),Number(String(e.target.value).replace(",","."))||0));$("manualKmSlider").value=v;$("manualKmDisplay").textContent=v.toFixed(1).replace(".",",")+" km"});$("manualKmInput").addEventListener("keydown",e=>{if(e.key==="Enter")saveManualPosition(e.target.value)});$("saveManualKmBtn").onclick=()=>saveManualPosition($("manualKmInput").value);$("useLastCheckpointBtn").onclick=()=>clearManualPosition();["jTime","jScore","jGood","jImprove","activityLink"].forEach(id=>$(id).addEventListener("change",saveJournal))}
if(!times[0])times[0]=race().start;bind();loadJournal();render();if("serviceWorker" in navigator){navigator.serviceWorker.register("./service-worker.js")}

// ===== V25 · expérience Coureur / Proches =====
const FAMILY_SETTINGS_KEY="dtt_family_settings_v25";
const ROLE_KEY="dtt_role_v25";
const defaultFamilySettings={julien:"",maroussia:"",ut4m:"",tracking:"https://ut4m.v3.livetrail.net/fr/2026/runners/6341?raceId=50B"};
const spectatorInfo={
 "Arselle":{access:"🚗 Accès routier à proximité",note:"Premier point pertinent, mais circulation et stationnement à anticiper."},
 "Croix de Chamrousse":{access:"🚡 Accès selon ouverture des remontées",note:"Vérifier les conditions et horaires le jour J."},
 "Refuge de la Pra":{access:"🥾 Accès pédestre uniquement",note:"Point isolé, déconseillé pour un suivi familial rapide."},
 "Col de Pré Long":{access:"🚗 Accès à confirmer localement",note:"Privilégier les consignes officielles et ne pas gêner l'organisation."},
 "Villard-Bonnot":{access:"🚗 Facilement accessible",note:"Très bon point avant l'arrivée."},
 "Arrivée Le Versoud":{access:"🏁 Zone d'arrivée",note:"Point recommandé pour retrouver Julien."}
};
function familySettings(){try{return Object.assign({},defaultFamilySettings,JSON.parse(localStorage.getItem(FAMILY_SETTINGS_KEY)||"{}"))}catch(e){return {...defaultFamilySettings}}}
function saveFamilySettings(){let x={julien:$("contactJulien").value.trim(),maroussia:$("contactMaroussia").value.trim(),ut4m:$("contactUt4m").value.trim(),tracking:$("trackingUrl").value.trim()};localStorage.setItem(FAMILY_SETTINGS_KEY,JSON.stringify(x));renderFamilyDashboard();alert("Contacts et lien enregistrés.")}
function cleanPhone(v){return(v||"").replace(/[^+0-9]/g,"")}
function openFamilyMode(){localStorage.setItem(ROLE_KEY,"family");document.body.classList.add("family-only-mode");document.body.classList.remove("runner-only-mode");$("familyDashboard").classList.remove("hidden");renderFamilyDashboard();window.scrollTo({top:0,behavior:"smooth"})}
function openRunnerMode(){localStorage.setItem(ROLE_KEY,"runner");document.body.classList.add("runner-only-mode");document.body.classList.remove("family-only-mode");$("familyDashboard").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function familyExit(){document.body.classList.remove("family-only-mode","runner-only-mode");$("familyDashboard").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function familyStatusText(){let l=last(),n=Math.min(l+1,points().length-1),p=points()[l],next=points()[n],proj=fmt(projectionFinish()),targ=fmt(pc(race().start)+pd(race().goal)),diff=projectionFinish()-(pc(race().start)+pd(race().goal));let tone=diff<=15?"🟢":"🟡",title=diff<=-15?"Julien est en avance sur son plan.":diff<=15?"Julien est dans son plan de course.":"Julien avance avec un peu de retard sur son objectif.";if(l===points().length-1){tone="🏁";title="Julien est arrivé !"}let pos=currentPosition(),nextKm=nextPointFromKm(pos.km),nextPos=nextKm<0?null:points()[nextKm],positionText=pos.source==="manual"?`Position déclarée : km ${pos.km.toFixed(1)} à environ ${profileElevationAt(pos.km)} m. `:"";return{tone,title,detail:`${positionText}Dernier pointage : ${p.name}${times[l]?` à ${times[l]}`:""}. ${nextPos?`Prochain point : ${nextPos.name}, à ${(nextPos.km-pos.km).toFixed(1)} km.`:"Course terminée."} Arrivée projetée : ${proj} (objectif ${targ}).`}}
function renderFamilyDashboard(){if(!$("familyDashboard"))return;let st=familyStatusText(),l=last(),n=Math.min(l+1,points().length-1);$("familyStatusCard").innerHTML=`<strong>${st.tone} ${st.title}</strong><span>${st.detail}</span>`;$("familyTimeline").innerHTML=points().map((p,i)=>{let cls=i<l?"done":i===n?"current":"",ico=i<l?"✅":i===n?"🔵":"⚪",real=times[i]?`<small>Réel ${times[i]}</small>`:"";return`<div class="timeline-row ${cls}"><span>${ico}</span><div><b>${p.name}</b><br><small>${p.km.toFixed(1)} km</small> ${real}</div><span class="timeline-time">${i===0?race().start:fmt(target(i))}</span></div>`}).join("");$("spectatorPoints").innerHTML=points().slice(1).map(p=>{let info=spectatorInfo[p.name]||{access:"ℹ️ Accès à vérifier",note:"Suivre les informations de l'organisation."};return`<div class="spectator-card"><b>${p.name}</b><span>${info.access}</span><p class="small">Passage estimé : ${fmt(target(points().indexOf(p)))}</p><p class="small">${info.note}</p></div>`}).join("");let health=healthHistory(),latest=health[health.length-1];
$("familyHealthUpdate").innerHTML=latest?`<article class="latest-health"><b>Mise à jour à ${latest.time} · ${latest.point}</b><p>${latest.summary.replace(/\n/g,"<br>")}</p></article>`:'<p class="small">Julien n’a pas encore envoyé de mise à jour sur son état.</p>';
$("familyHealthHistory").innerHTML=health.length?health.slice(0,-1).slice(-6).reverse().map(h=>`<article class="health-history-item"><b>${h.time} · ${h.point}</b><p>${h.summary.replace(/\n/g,"<br>")}</p></article>`).join(""):'<p class="small">Aucune mise à jour précédente.</p>';
let fs=familySettings();let contacts=[['Julien',fs.julien,'📞'],['Maroussia',fs.maroussia,'📞'],['Organisation',fs.ut4m,'☎️'],['Urgences','112','🆘']];$("contactButtons").innerHTML=contacts.map(([name,num,ico])=>num?`<a class="contact-link" href="tel:${cleanPhone(num)}">${ico} ${name}<br><small>${num}</small></a>`:`<button class="secondary" onclick="document.querySelector('.settings-box').open=true;document.getElementById('contact${name==='Organisation'?'Ut4m':name}').focus()">${ico} ${name}<br><small>À configurer</small></button>`).join("");$("contactJulien").value=fs.julien;$("contactMaroussia").value=fs.maroussia;$("contactUt4m").value=fs.ut4m;$("trackingUrl").value=fs.tracking;$("officialTrackingBtn").textContent=fs.tracking?"📍 Ouvrir le suivi officiel UT4M":"📍 Configurer le lien de suivi officiel"}
function openOfficialTracking(){let u=familySettings().tracking;if(u){window.open(u,"_blank","noopener")}else{document.querySelector('.settings-box').open=true;$("trackingUrl").focus();alert("Colle ici le lien officiel de suivi lorsqu'il sera disponible.")}}
function familySummary(){let st=familyStatusText(),hist=healthHistory(),latest=hist[hist.length-1],news=latest?`\n\nDernières nouvelles à ${latest.time} :\n${latest.summary}`:"";return`${st.title}\n${st.detail}${news}\n\n${race().name} · ${totalKm()} km · +${totalDp()} m / -${totalDm()} m`}
async function shareApp(){let data={title:"Suivre Julien — Damiani Trail Tracker",text:familySummary(),url:familyShareUrl()||location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text}\n${data.url}`);alert("Lien et résumé copiés.")}}catch(e){}}
async function copyFamilySummary(){try{await navigator.clipboard.writeText(familySummary());alert("Résumé copié.")}catch(e){alert(familySummary())}}
function initFamilyMode(){let saved=localStorage.getItem(ROLE_KEY);$("runnerHomeBtn").onclick=openRunnerMode;$("familyHomeBtn").onclick=openFamilyMode;$("floatingFamilyBtn").onclick=openFamilyMode;$("familyExitBtn").onclick=familyExit;$("refreshFamilyBtn").onclick=renderFamilyDashboard;$("officialTrackingBtn").onclick=openOfficialTracking;$("saveFamilySettingsBtn").onclick=saveFamilySettings;$("shareAppBtn").onclick=shareApp;$("copyFamilySummaryBtn").onclick=copyFamilySummary;$("chooseRunnerBtn").onclick=()=>{$("roleModal").classList.add("hidden");openRunnerMode()};$("chooseFamilyBtn").onclick=()=>{$("roleModal").classList.add("hidden");openFamilyMode()};if(!saved)$("roleModal").classList.remove("hidden");else if(saved==="family")openFamilyMode();else document.body.classList.add("runner-only-mode");renderFamilyDashboard()}
const originalRenderV25=render;render=function(){originalRenderV25();renderFamilyDashboard();renderAllProfiles()};
initFamilyMode();renderAllProfiles();

// ===== V30 · synchronisation Firebase Realtime Database =====
const SYNC_SETTINGS_KEY="dtt_sync_settings_v31";
const DEFAULT_FIREBASE_URL="https://damiani-trail-tracker-default-rtdb.europe-west1.firebasedatabase.app";
const DEFAULT_SYNC_KEY="JULIEN-UT4M-50B-2026";
let syncTimer=null,syncBusy=false,lastRemoteStamp=0;
function syncSettings(){
  try{return Object.assign({url:DEFAULT_FIREBASE_URL,key:DEFAULT_SYNC_KEY},JSON.parse(localStorage.getItem(SYNC_SETTINGS_KEY)||"{}"))}catch(e){return{url:DEFAULT_FIREBASE_URL,key:DEFAULT_SYNC_KEY}}
}
function normalizeFirebaseUrl(url){return String(url||"").trim().replace(/\/+$/,"")}
function safeSyncKey(key){return String(key||"").trim().replace(/[^a-zA-Z0-9_-]/g,"-").slice(0,100)}
function syncEndpoint(){const s=syncSettings();if(!s.url||!s.key)return"";return `${normalizeFirebaseUrl(s.url)}/damianiTrailTracker/${encodeURIComponent(safeSyncKey(s.key))}.json`}
function setSyncUi(state,text){
  const a=$("runnerSyncIndicator"),b=$("familySyncStatus");
  if(a)a.textContent=text;
  if(b){b.textContent=text;b.classList.remove("online","error");if(state==="online")b.classList.add("online");if(state==="error")b.classList.add("error")}
}
function currentSyncPayload(){
  const pos=currentPosition(),hist=healthHistory();
  return {version:34,updatedAt:new Date().toISOString(),raceName:race().name,position:{km:pos.km,source:pos.source,updatedAt:pos.updatedAt||new Date().toISOString()},times:[...times],health:hist.slice(-20),start:race().start,goal:race().goal,trackingUrl:familySettings().tracking};
}
async function pushSync(silent=false){
  const ep=syncEndpoint();if(!ep)return false;
  try{syncBusy=true;if(!silent)setSyncUi("pending","Envoi…");const r=await fetch(ep,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(currentSyncPayload())});if(!r.ok)throw new Error(`HTTP ${r.status}`);setSyncUi("online","Synchronisé à "+now());return true}catch(e){setSyncUi("error","Erreur de synchronisation");if(!silent)alert("Impossible d’envoyer les données. Vérifie l’adresse Firebase et les règles de la base.");return false}finally{syncBusy=false}
}
function applyRemotePayload(data){
  if(!data||!data.updatedAt)return false;const stamp=Date.parse(data.updatedAt)||0;if(stamp<=lastRemoteStamp)return false;lastRemoteStamp=stamp;
  if(Array.isArray(data.times)){times=data.times;localStorage.setItem("trail_times_"+active,JSON.stringify(times))}
  if(data.position&&Number.isFinite(Number(data.position.km))){localStorage.setItem(manualPositionKey(),JSON.stringify({km:Number(data.position.km),updatedAt:data.position.updatedAt||data.updatedAt}))}
  if(Array.isArray(data.health))saveHealthHistory(data.health);
  if(data.trackingUrl){const fs=familySettings();fs.tracking=data.trackingUrl;localStorage.setItem(FAMILY_SETTINGS_KEY,JSON.stringify(fs))}
  render();renderFamilyDashboard();renderAllProfiles();return true;
}
async function pullSync(silent=true){
  const ep=syncEndpoint();if(!ep)return false;
  try{const r=await fetch(ep,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const data=await r.json();if(data){applyRemotePayload(data);const d=new Date(data.updatedAt);setSyncUi("online","Dernière mise à jour : "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));}else setSyncUi("pending","En attente de la première publication");return true}catch(e){setSyncUi("error","Connexion impossible");if(!silent)alert("Impossible de lire le suivi. Vérifie l’adresse Firebase et le code.");return false}
}
function startSyncPolling(){if(syncTimer)clearInterval(syncTimer);if(!syncEndpoint())return;pullSync(true);syncTimer=setInterval(()=>{if(!document.hidden&&!syncBusy)pullSync(true)},5000)}
function saveRunnerSync(){const url=normalizeFirebaseUrl($("runnerFirebaseUrl").value),key=safeSyncKey($("runnerSyncKey").value);if(!url||!key){alert("Renseigne l’adresse Firebase et un code de suivi.");return}localStorage.setItem(SYNC_SETTINGS_KEY,JSON.stringify({url,key}));fillSyncFields();pushSync(false).then(()=>startSyncPolling())}
function saveFamilySync(){const url=normalizeFirebaseUrl($("familyFirebaseUrl").value),key=safeSyncKey($("familySyncKey").value);if(!url||!key){alert("Renseigne l’adresse Firebase et le code transmis par Julien.");return}localStorage.setItem(SYNC_SETTINGS_KEY,JSON.stringify({url,key}));fillSyncFields();pullSync(false).then(()=>startSyncPolling())}
function familyShareUrl(){const s=syncSettings();if(!s.key)return"";const u=new URL(location.href);u.search="";u.hash="";u.searchParams.set("suivi",safeSyncKey(s.key));return u.toString()}
async function shareSyncLink(){const url=familyShareUrl();if(!url){alert("Active d’abord la synchronisation.");return}const data={title:"Suivre Julien en direct",text:"Voici mon lien de suivi Damiani Trail Tracker. Ouvre-le pour accéder directement au mode Proches.",url};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(url);alert("Lien proches copié.")}}catch(e){}}
function fillSyncFields(){const s=syncSettings();["runnerFirebaseUrl","familyFirebaseUrl"].forEach(id=>{if($(id))$(id).value=s.url});["runnerSyncKey","familySyncKey"].forEach(id=>{if($(id))$(id).value=s.key});if(s.url&&s.key)setSyncUi("pending","Connexion…");else setSyncUi("offline","Hors ligne")}
function loadSyncFromUrl(){const q=new URLSearchParams(location.search),simpleKey=q.get("suivi"),legacyUrl=q.get("firebase"),legacyKey=q.get("sync"),key=safeSyncKey(simpleKey||legacyKey),url=normalizeFirebaseUrl(legacyUrl||DEFAULT_FIREBASE_URL);if(key){localStorage.setItem(SYNC_SETTINGS_KEY,JSON.stringify({url,key}));localStorage.setItem(ROLE_KEY,"family");document.body.classList.add("family-link-mode");history.replaceState({},"",location.pathname);return true}return false}
// publication automatique après toute modification importante
const _saveManualPositionV30=saveManualPosition;saveManualPosition=function(value,silent=false){_saveManualPositionV30(value,silent);pushSync(true)};
const _clearManualPositionV30=clearManualPosition;clearManualPosition=function(){_clearManualPositionV30();pushSync(true)};
const _pointNextV30=pointNext;pointNext=function(){_pointNextV30();pushSync(true)};
const _generateCloseMessageV30=generateCloseMessage;generateCloseMessage=function(){_generateCloseMessageV30();pushSync(true)};
const _resetTimesV30=resetTimes;resetTimes=function(){const before=JSON.stringify({times,health:healthHistory(),position:localStorage.getItem(manualPositionKey())});_resetTimesV30();const after=JSON.stringify({times,health:healthHistory(),position:localStorage.getItem(manualPositionKey())});if(before!==after){setTimeout(()=>pushSync(true),100);setTimeout(()=>clearRemoteMessages(true),150)}};
function initSyncV30(){
  const fromUrl=loadSyncFromUrl();
  if(!localStorage.getItem(SYNC_SETTINGS_KEY))localStorage.setItem(SYNC_SETTINGS_KEY,JSON.stringify({url:DEFAULT_FIREBASE_URL,key:DEFAULT_SYNC_KEY}));
  fillSyncFields();
  if($("runnerSaveSyncBtn"))$("runnerSaveSyncBtn").onclick=saveRunnerSync;
  if($("familyConnectSyncBtn"))$("familyConnectSyncBtn").onclick=saveFamilySync;
  if($("runnerShareSyncBtn"))$("runnerShareSyncBtn").onclick=shareSyncLink;
  if($("inviteFamilyBtn"))$("inviteFamilyBtn").onclick=shareSyncLink;
  if($("refreshFamilyBtn"))$("refreshFamilyBtn").onclick=()=>pullSync(false);
  if($("pointNextBtn"))$("pointNextBtn").onclick=pointNext;
  if($("generateCloseBtn"))$("generateCloseBtn").onclick=generateCloseMessage;
  if($("resetBtn"))$("resetBtn").onclick=resetTimes;
  if($("useLastCheckpointBtn"))$("useLastCheckpointBtn").onclick=clearManualPosition;
  if(fromUrl){$("roleModal")?.classList.add("hidden");openFamilyMode()}
  if(syncEndpoint()){
    const role=localStorage.getItem(ROLE_KEY);
    if(role==="family"||fromUrl)startSyncPolling();
    else pushSync(true).then(()=>startSyncPolling());
  }
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&syncEndpoint())pullSync(true)});
}
initSyncV30();


// ===== V32 · messagerie des proches vers Julien =====
const MESSAGE_NAME_KEY="dtt_family_sender_name_v32";
const MESSAGE_READ_KEY="dtt_messages_last_read_v32";
let remoteMessages=[];
function messagesEndpoint(){const ep=syncEndpoint();return ep?ep.replace(/\.json$/,"/messages.json"):""}
function normalizeRemoteMessages(raw){
  if(!raw)return[];
  const entries=Array.isArray(raw)?raw.map((v,i)=>[String(i),v]):Object.entries(raw);
  return entries.filter(([,v])=>v&&typeof v==="object"&&String(v.text||"").trim()).map(([id,v])=>({id,author:String(v.author||"Un proche").slice(0,40),text:String(v.text||"").slice(0,300),createdAt:v.createdAt||new Date().toISOString()})).sort((a,b)=>(Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0)).slice(-50);
}
function formatMessageDate(iso){const d=new Date(iso);return Number.isNaN(d.getTime())?"Heure inconnue":d.toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
function renderMessageList(containerId,limit=20,runner=false){
  const box=$(containerId);if(!box)return;
  const list=remoteMessages.slice(-limit).reverse();box.innerHTML="";
  if(!list.length){const e=document.createElement("div");e.className="messages-empty";e.textContent=runner?"Aucun message reçu pour le moment.":"Aucun message envoyé pour le moment.";box.appendChild(e);return}
  const lastRead=Number(localStorage.getItem(MESSAGE_READ_KEY)||0);
  list.forEach(m=>{const stamp=Date.parse(m.createdAt)||0,item=document.createElement("article");item.className="message-item"+(runner&&stamp>lastRead?" unread":"");const meta=document.createElement("div");meta.className="message-meta";const author=document.createElement("span");author.className="message-author";author.textContent=m.author;const date=document.createElement("span");date.textContent=formatMessageDate(m.createdAt);meta.append(author,date);const text=document.createElement("p");text.className="message-text";text.textContent=m.text;item.append(meta,text);box.appendChild(item)})
}
function renderMessages(){
  renderMessageList("familyMessagesList",8,false);renderMessageList("runnerMessagesList",30,true);renderMessageList("raceModeMessagesList",3,true);
  const badge=$("runnerUnreadBadge");if(badge){const lastRead=Number(localStorage.getItem(MESSAGE_READ_KEY)||0),n=remoteMessages.filter(m=>(Date.parse(m.createdAt)||0)>lastRead).length;badge.textContent=n+" nouveau"+(n>1?"x":"");badge.classList.toggle("hidden",!n);const rb=$("raceModeUnreadBadge");if(rb){rb.textContent=n+" nouveau"+(n>1?"x":"");rb.classList.toggle("hidden",!n)}}
}
async function sendFamilyMessage(){
  const author=String($("familySenderName")?.value||"").trim().slice(0,40);
  const text=String($("familyMessageText")?.value||"").trim().slice(0,300);
  const status=$("familyMessageSendStatus");
  const ep=syncEndpoint();
  if(!author){alert("Indique ton prénom.");$("familySenderName")?.focus();return}
  if(!text){alert("Écris un message avant de l’envoyer.");$("familyMessageText")?.focus();return}
  if(!ep){alert("Le suivi en direct n’est pas connecté.");return}
  localStorage.setItem(MESSAGE_NAME_KEY,author);
  if(status)status.textContent="Envoi…";
  const createdAt=new Date().toISOString();
  const id="msg_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);
  const payload={updatedAt:createdAt};
  payload["messages/"+id]={author,text,createdAt};
  try{
    const r=await fetch(ep,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!r.ok){const detail=await r.text().catch(()=>"");throw new Error("HTTP "+r.status+(detail?" · "+detail:""))}
    $("familyMessageText").value="";
    $("familyMessageCount").textContent="0 / 300";
    if(status)status.textContent="Message envoyé à Julien.";
    await pullSync(true);
  }catch(e){
    console.error("Erreur envoi message",e);
    if(status)status.textContent="Échec de l’envoi : "+e.message;
    alert("Le message n’a pas pu être envoyé. Vérifie Internet et les règles Firebase.\n\nDétail : "+e.message);
  }
}
function markMessagesRead(){localStorage.setItem(MESSAGE_READ_KEY,String(Date.now()));renderMessages()}
async function clearRemoteMessages(silent=false){const ep=messagesEndpoint();if(!ep)return;try{await fetch(ep,{method:"DELETE"});remoteMessages=[];renderMessages()}catch(e){if(!silent)alert("Impossible de supprimer les messages distants.")}}
function initMessagesV32(){
  if($("familySenderName"))$("familySenderName").value=localStorage.getItem(MESSAGE_NAME_KEY)||"";
  if($("familyMessageText"))$("familyMessageText").addEventListener("input",e=>{$("familyMessageCount").textContent=Math.min(300,e.target.value.length)+" / 300"});
  if($("sendFamilyMessageBtn"))$("sendFamilyMessageBtn").onclick=sendFamilyMessage;
  if($("markMessagesReadBtn"))$("markMessagesReadBtn").onclick=markMessagesRead;
  if($("refreshMessagesBtn"))$("refreshMessagesBtn").onclick=()=>pullSync(false);
  renderMessages();
}
const _applyRemotePayloadV32=applyRemotePayload;applyRemotePayload=function(data){if(data&&data.messages)remoteMessages=normalizeRemoteMessages(data.messages);else if(data&&!data.messages)remoteMessages=[];const changed=_applyRemotePayloadV32(data);renderMessages();return changed};
initMessagesV32();

// ===== V35 · hors ligne, fraîcheur, ergonomie Proches et verrouillage course =====
const V35_PENDING_KEY="dtt_pending_sync_v35";
const V35_LOCK_KEY="dtt_race_lock_v35";
let v35LastRemoteAt=0;
function v35Toast(text,delay=3500){const el=$("offlineToast");if(!el)return;el.textContent=text;el.classList.remove("hidden");clearTimeout(v35Toast.timer);v35Toast.timer=setTimeout(()=>el.classList.add("hidden"),delay)}
function v35QueuePayload(payload){localStorage.setItem(V35_PENDING_KEY,JSON.stringify(payload||currentSyncPayload()));setSyncUi("pending","Enregistré sur le téléphone · en attente d’envoi");$("runnerSyncIndicator")?.classList.add("pending-sync");v35Toast("☁️ Données sauvegardées hors ligne. Envoi automatique au retour du réseau.")}
async function v35FlushQueue(){const raw=localStorage.getItem(V35_PENDING_KEY),ep=syncEndpoint();if(!raw||!ep||!navigator.onLine)return false;try{const r=await fetch(ep,{method:"PATCH",headers:{"Content-Type":"application/json"},body:raw});if(!r.ok)throw new Error();localStorage.removeItem(V35_PENDING_KEY);$("runnerSyncIndicator")?.classList.remove("pending-sync");setSyncUi("online","Synchronisé à "+now());v35Toast("✅ Données hors ligne envoyées aux proches.");return true}catch(e){return false}}
const v34PushSync=pushSync;
pushSync=async function(silent=false){if(!navigator.onLine){v35QueuePayload(currentSyncPayload());return false}const ok=await v34PushSync(silent);if(!ok)v35QueuePayload(currentSyncPayload());else localStorage.removeItem(V35_PENDING_KEY);return ok};
const v34CurrentSyncPayload=currentSyncPayload;
currentSyncPayload=function(){const p=v34CurrentSyncPayload();p.version=35;p.connection={online:navigator.onLine,publishedAt:new Date().toISOString()};return p};
function v35Freshness(iso){const box=$("familyFreshness");if(!box)return;const stamp=Date.parse(iso||"")||v35LastRemoteAt;if(!stamp){box.className="freshness-banner stale";box.textContent="Aucune donnée reçue pour le moment.";return}const mins=Math.max(0,Math.floor((Date.now()-stamp)/60000));box.className="freshness-banner "+(mins<2?"live":mins<=10?"recent":"stale");box.textContent=mins<2?"🟢 En direct · mise à jour il y a moins de 2 min":mins<=10?`🟡 Mise à jour récente · il y a ${mins} min`:`🔴 Données anciennes · dernière mise à jour il y a ${mins} min`}
const v34ApplyRemotePayload=applyRemotePayload;
applyRemotePayload=function(data){if(data?.updatedAt)v35LastRemoteAt=Date.parse(data.updatedAt)||0;const out=v34ApplyRemotePayload(data);v35Freshness(data?.updatedAt);return out};
const v34PullSync=pullSync;
pullSync=async function(silent=true){const ok=await v34PullSync(silent);if(!ok)v35Freshness(null);return ok};
function v35StartAdaptivePolling(){if(syncTimer)clearInterval(syncTimer);if(!syncEndpoint())return;pullSync(true);const tick=()=>{if(!syncBusy)pullSync(true);syncTimer=setTimeout(tick,document.hidden?60000:10000)};syncTimer=setTimeout(tick,10000)}
startSyncPolling=v35StartAdaptivePolling;
function v35SetLocked(locked){localStorage.setItem(V35_LOCK_KEY,locked?"1":"0");document.body.classList.toggle("race-locked",locked);const b=$("raceLockBtn");if(b)b.textContent=locked?"🔓 Maintenir pour déverrouiller":"🔒 Verrouiller le mode course";const back=$("closeRaceModeBtn");if(back)back.textContent=locked?"🔓 Déverrouiller et revenir au tableau complet":"← Retour au tableau complet";if(locked){$("raceMode")?.classList.remove("hidden");v35Toast("🔒 Mode course verrouillé : les réglages sensibles sont masqués.")}else v35Toast("🔓 Mode course déverrouillé.")}
function v35InitLock(){const b=$("raceLockBtn");if(!b)return;v35SetLocked(localStorage.getItem(V35_LOCK_KEY)==="1");let timer=null;const start=()=>{timer=setTimeout(()=>v35SetLocked(!(localStorage.getItem(V35_LOCK_KEY)==="1")),1200)};const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};b.addEventListener("pointerdown",start);b.addEventListener("pointerup",cancel);b.addEventListener("pointerleave",cancel);b.addEventListener("click",()=>{if(localStorage.getItem(V35_LOCK_KEY)!=="1")v35SetLocked(true)})}
async function v35DeleteRemoteData(){const ep=syncEndpoint();if(!ep)return alert("La synchronisation n’est pas configurée.");if(!confirm("Supprimer définitivement les positions, états et messages stockés en ligne pour ce code de suivi ?"))return;try{const r=await fetch(ep,{method:"DELETE"});if(!r.ok)throw new Error(`HTTP ${r.status}`);localStorage.removeItem(V35_PENDING_KEY);alert("Les données distantes ont été supprimées.")}catch(e){alert("Suppression impossible. Vérifie la connexion et les règles Firebase.")}}
function v35InitUi(){
  document.querySelectorAll(".quick-message").forEach(b=>b.addEventListener("click",()=>{const t=$("familyMessageText");t.value=b.dataset.message||"";t.dispatchEvent(new Event("input"));t.focus()}));
  document.querySelectorAll(".family-jump").forEach(b=>b.addEventListener("click",()=>{$(b.dataset.target)?.scrollIntoView({behavior:"smooth",block:"start"})}));
  $("deleteRemoteDataBtn")?.addEventListener("click",v35DeleteRemoteData);
  $("raceRefreshMessagesBtn")?.addEventListener("click",()=>pullSync(false));
  $("raceMarkMessagesReadBtn")?.addEventListener("click",markMessagesRead);
  $("raceShareStateBtn")?.addEventListener("click",()=>{toggleCloseMode();setTimeout(()=>$("closeMode")?.scrollIntoView({behavior:"smooth",block:"start"}),50)});
  v35InitLock();v35Freshness(null);
  window.addEventListener("online",()=>{v35Toast("📶 Connexion retrouvée.");v35FlushQueue().then(()=>pullSync(true))});
  window.addEventListener("offline",()=>v35Toast("📴 Hors connexion : l’application reste utilisable."));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){v35FlushQueue();pullSync(true)}});
  if(localStorage.getItem(V35_PENDING_KEY))v35FlushQueue();
}
v35InitUi();

// V35.1 · état réseau dans le cockpit course
function v351UpdateRaceSync(){const el=$("raceCockpitSync");if(!el)return;const pending=!!localStorage.getItem(V35_PENDING_KEY);if(pending){el.className="race-sync-pill pending";el.textContent="● En attente"}else if(navigator.onLine&&syncEndpoint()){el.className="race-sync-pill online";el.textContent="● Synchronisé"}else if(navigator.onLine){el.className="race-sync-pill";el.textContent="● Local"}else{el.className="race-sync-pill offline";el.textContent="● Hors réseau"}}
window.addEventListener("online",v351UpdateRaceSync);window.addEventListener("offline",v351UpdateRaceSync);setInterval(v351UpdateRaceSync,5000);v351UpdateRaceSync();

// V35.2 · sortie de secours toujours accessible depuis le mode Course
function v352ExitRaceMode(){
  const locked=localStorage.getItem(V35_LOCK_KEY)==="1";
  if(locked&&!confirm("Déverrouiller le mode course et revenir au tableau complet ?"))return;
  if(locked)v35SetLocked(false);
  $("raceMode")?.classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
const v352BackButton=$("closeRaceModeBtn");
if(v352BackButton)v352BackButton.onclick=v352ExitRaceMode;
