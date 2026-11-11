const PARTS = [
 {id:"resistor",name:"Resistor",value:"10 kΩ",cat:"Passive",pins:["1","2"],desc:"Through-hole carbon film resistor",kind:"resistor"},
 {id:"capacitor",name:"Electrolytic capacitor",value:"100 µF · 25 V",cat:"Passive",pins:["+","−"],desc:"Polarized radial capacitor",kind:"capacitor"},
 {id:"ceramic",name:"Ceramic capacitor",value:"100 nF",cat:"Passive",pins:["1","2"],desc:"Radial ceramic disc capacitor",kind:"ceramic"},
 {id:"led",name:"LED",value:"Red · 5 mm",cat:"Semiconductor",pins:["A","K"],desc:"Through-hole light emitting diode",kind:"led"},
 {id:"diode",name:"Rectifier diode",value:"1N4007",cat:"Semiconductor",pins:["A","K"],desc:"General purpose rectifier diode",kind:"diode"},
 {id:"transistor",name:"NPN transistor",value:"BC547",cat:"Semiconductor",pins:["C","B","E"],desc:"TO-92 bipolar junction transistor",kind:"transistor"},
 {id:"ic555",name:"Timer IC",value:"NE555 · DIP-8",cat:"IC",pins:["GND","TRIG","OUT","RESET","CTRL","THR","DIS","VCC"],desc:"8-pin timer integrated circuit",kind:"ic"},
 {id:"opamp",name:"Op-amp",value:"LM358 · DIP-8",cat:"IC",pins:["OUT A","−IN A","+IN A","VCC−","+IN B","−IN B","OUT B","VCC+"],desc:"Dual operational amplifier",kind:"ic"},
 {id:"button",name:"Push button",value:"Tactile · 4 pin",cat:"Input/Output",pins:["1A","1B","2A","2B"],desc:"Momentary tactile switch",kind:"button"},
 {id:"buzzer",name:"Buzzer",value:"5 V active",cat:"Input/Output",pins:["+","−"],desc:"Piezoelectric buzzer",kind:"buzzer"},
 {id:"motor",name:"DC motor",value:"6 V",cat:"Input/Output",pins:["+","−"],desc:"Brushed DC motor",kind:"motor"},
 {id:"battery",name:"Battery",value:"9 V",cat:"Power",pins:["+","−"],desc:"9 volt battery source",kind:"battery"},
 {id:"arduino",name:"Arduino-style board",value:"ATmega328P",cat:"IC",pins:["5V","GND","D2","D3","D4","D5"],desc:"Microcontroller development board illustration",kind:"arduino"},
 {id:"sensor",name:"Ultrasonic sensor",value:"HC-SR04",cat:"Input/Output",pins:["VCC","TRIG","ECHO","GND"],desc:"Ultrasonic distance sensor module",kind:"sensor"}
];
const NS="http://www.w3.org/2000/svg";
const $=id=>document.getElementById(id);
let state={mode:"schematic",tool:"select",category:"All",search:"",parts:[],wires:[],selected:null,pending:null,scale:1,offset:{x:0,y:0},placing:null,drag:null};
const workspace=$("workspace"), componentLayer=$("componentLayer"), wireLayer=$("wireLayer"), boardLayer=$("boardLayer");
function svg(tag,attrs={},parent){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.appendChild(e);return e}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2100)}
function pinPositions(kind){if(kind==="transistor")return [[-28,0],[0,-24],[28,0]];if(kind==="ic")return [[-48,-32],[-48,-20],[-48,-8],[-48,8],[-48,20],[-48,32],[48,-20],[48,20]];if(kind==="arduino")return [[-55,-28],[-55,0],[-55,28],[55,-28],[55,0],[55,28]];if(kind==="sensor")return [[-30,28],[-10,28],[10,28],[30,28]];if(kind==="button")return [[-18,-12],[-18,12],[18,-12],[18,12]];return [[-32,0],[32,0]]}
function physicalArt(kind,g){
 const line=(x1,y1,x2,y2,stroke="#737f90",w=3)=>svg("line",{x1,y1,x2,y2,stroke,"stroke-width":w,"stroke-linecap":"round"},g);
 if(kind==="resistor"){line(-25,0,-12,0);line(12,0,25,0);svg("rect",{x:-13,y:-8,width:26,height:16,rx:7,fill:"#d8b77a",stroke:"#9e8050","stroke-width":1.5},g);[-6,0,6].forEach((x,i)=>svg("rect",{x:x-1,y:-8,width:2,height:16,fill:["#8b4b24","#b52f2b","#b58b27"][i]},g))}
 else if(kind==="capacitor"){line(-25,0,-9,0);line(9,0,25,0);svg("rect",{x:-9,y:-15,width:18,height:30,rx:5,fill:"#303e4e",stroke:"#172230"},g);svg("path",{d:"M-9 -8H9",stroke:"#aeb7c3","stroke-width":2},g);svg("text",{x:0,y:4,"text-anchor":"middle",fill:"#fff","font-size":7},g).textContent="+"}
 else if(kind==="ceramic"){line(-25,0,-8,0);line(8,0,25,0);svg("ellipse",{cx:0,cy:0,rx:9,ry:12,fill:"#d7a94d",stroke:"#9e7831","stroke-width":1.5},g)}
 else if(kind==="led"){line(-23,0,-7,0);line(7,0,23,0);svg("path",{d:"M-7 -10L9 0L-7 10Z",fill:"#e84f55",stroke:"#a92e36","stroke-width":1.5},g);line(9,-10,9,10,"#a92e36",2);svg("path",{d:"M-2 -17L5 -23M4 -13L11 -19",stroke:"#e84f55","stroke-width":1.7,fill:"none"},g)}
 else if(kind==="diode"){line(-24,0,-9,0);line(9,0,24,0);svg("path",{d:"M-9 -10L9 0L-9 10Z",fill:"#d5dce5",stroke:"#566477","stroke-width":1.5},g);line(9,-11,9,11,"#45556a",2.5)}
 else if(kind==="transistor"){line(-28,0,-7,0);line(0,-24,0,-10);line(7,0,28,0);svg("circle",{cx:0,cy:0,r:12,fill:"#273442",stroke:"#101b28","stroke-width":1.5},g);svg("path",{d:"M-7 -5L7 5M-7 5L7 -5",stroke:"#c9d3df","stroke-width":1.5},g)}
 else if(kind==="ic"){svg("rect",{x:-30,y:-24,width:60,height:48,rx:4,fill:"#202a37",stroke:"#0e1722","stroke-width":2},g);for(let i=0;i<4;i++){line(-40,-18+i*12,-30,-18+i*12);line(30,-18+i*12,40,-18+i*12)}svg("path",{d:"M-7 -24A7 7 0 0 0 7 -24",fill:"none",stroke:"#aeb8c5","stroke-width":1.5},g);svg("text",{x:0,y:4,"text-anchor":"middle",fill:"#dbe2eb","font-size":8},g).textContent="IC"}
 else if(kind==="button"){svg("rect",{x:-17,y:-13,width:34,height:26,rx:4,fill:"#303c4b",stroke:"#1a2634","stroke-width":1.5},g);svg("rect",{x:-8,y:-8,width:16,height:16,rx:3,fill:"#dce3eb",stroke:"#9ba8b8"},g);[[-18,-12],[-18,12],[18,-12],[18,12]].forEach(p=>line(p[0],p[1],p[0]*1.5,p[1]*1.4))}
 else if(kind==="buzzer"){line(-24,0,-11,0);line(11,0,24,0);svg("path",{d:"M-11 -11Q0 -16 11 -11V11Q0 16 -11 11Z",fill:"#303d4c",stroke:"#172331","stroke-width":1.5},g);svg("text",{x:0,y:3,"text-anchor":"middle",fill:"#fff","font-size":8},g).textContent="+"}
 else if(kind==="motor"){line(-27,0,-14,0);line(14,0,27,0);svg("circle",{cx:0,cy:0,r:14,fill:"#9da9b7",stroke:"#586779","stroke-width":2},g);svg("circle",{cx:0,cy:0,r:5,fill:"#536174"},g);svg("text",{x:0,y:4,"text-anchor":"middle",fill:"#fff","font-size":8},g).textContent="M"}
 else if(kind==="battery"){line(-23,0,-8,0);line(8,0,23,0);line(-7,-13,-7,13,"#586779",3);line(7,-8,7,8,"#586779",3);svg("text",{x:0,y:-18,"text-anchor":"middle",fill:"#68778a","font-size":8},g).textContent="9V"}
 else if(kind==="arduino"){svg("rect",{x:-43,y:-24,width:86,height:48,rx:5,fill:"#267b70",stroke:"#15574f","stroke-width":2},g);svg("rect",{x:-12,y:-12,width:24,height:24,rx:2,fill:"#293847",stroke:"#121c27"},g);svg("rect",{x:-43,y:-9,width:13,height:18,rx:2,fill:"#bac5d0",stroke:"#758394"},g);svg("text",{x:0,y:4,"text-anchor":"middle",fill:"#fff","font-size":7},g).textContent="MCU";[ -16,-6,4,14].forEach(y=>line(-48,y,-43,y,"#c39a43",2))}
 else if(kind==="sensor"){svg("rect",{x:-32,y:-22,width:64,height:44,rx:5,fill:"#267b70",stroke:"#15574f","stroke-width":1.5},g);[-17,17].forEach(x=>svg("circle",{cx:x,cy:-3,r:10,fill:"#b9c6d2",stroke:"#66788a","stroke-width":2},g));line(-25,22,-25,30);line(-8,22,-8,30);line(8,22,8,30);line(25,22,25,30)}
}
function schematicArt(kind,g){
 const stroke="#58677a",sw=2.2;
 if(kind==="resistor"){svg("path",{d:"M-32 0H-20L-14 -9L-6 9L2 -9L10 9L17 -9L22 0H32",fill:"none",stroke,"stroke-width":sw},g)}
 else if(kind==="capacitor"||kind==="ceramic"){svg("path",{d:"M-32 0H-5M-5 -14V14M5 -14V14M5 0H32",fill:"none",stroke,"stroke-width":sw},g)}
 else if(kind==="led"){svg("path",{d:"M-32 0H-9M-9 -12L10 0L-9 12ZM10 -13V13M10 0H32M-1 -18L7 -26M6 -17L14 -25",fill:"none",stroke,"stroke-width":sw},g)}
 else if(kind==="diode"){svg("path",{d:"M-32 0H-10L10 -12V12L-10 0M10 -13V13M10 0H32",fill:"none",stroke,"stroke-width":sw},g)}
 else if(kind==="transistor"){svg("circle",{cx:0,cy:0,r:17,fill:"none",stroke,"stroke-width":sw},g);svg("path",{d:"M-30 0H-9M-4 -28V-9M-4 9L13 25M-4 -9L12 -22",fill:"none",stroke,"stroke-width":sw},g);svg("path",{d:"M8 18L13 25L5 23",fill:"none",stroke,"stroke-width":sw},g)}
 else if(kind==="ic"||kind==="arduino"||kind==="sensor"){svg("rect",{x:-26,y:-23,width:52,height:46,rx:2,fill:"#fff",stroke,"stroke-width":sw},g);for(let i=0;i<4;i++){svg("path",{d:`M-36 ${-15+i*10}H-26 M26 ${-15+i*10}H36`,stroke,"stroke-width":sw},g)}svg("text",{x:0,y:4,"text-anchor":"middle",fill:stroke,"font-size":10},g).textContent=kind==="ic"?"IC":kind==="sensor"?"SENS":"MCU"}
 else if(kind==="battery"){svg("path",{d:"M-32 0H-7M-7 -14V14M7 -8V8M7 0H32",stroke,"stroke-width":sw,fill:"none"},g)}
 else if(kind==="motor"){svg("circle",{cx:0,cy:0,r:17,fill:"none",stroke,"stroke-width":sw},g);svg("text",{x:0,y:4,"text-anchor":"middle",fill:stroke,"font-size":12},g).textContent="M";svg("path",{d:"M-32 0H-17M17 0H32",stroke,"stroke-width":sw},g)}
 else if(kind==="button"){svg("path",{d:"M-30 10H-8V-5M8 -5V10H30M-8 -5L8 -15",stroke,"stroke-width":sw,fill:"none"},g)}
 else if(kind==="buzzer"){svg("path",{d:"M-32 0H-12M-12 -12V12H8V-12ZM14 -10Q27 0 14 10M20 -16Q39 0 20 16",stroke,"stroke-width":sw,fill:"none"},g)}
}
function renderPart(p){
 const def=PARTS.find(x=>x.id===p.type);if(!def)return;
 const g=svg("g",{class:"component"+(state.selected===p.uid?" selected":""),transform:`translate(${p.x} ${p.y})`, "data-uid":p.uid},componentLayer);
 svg("rect",{class:"select-outline",x:-58,y:-48,width:116,height:90,rx:8,fill:"none",stroke:"none"},g);
 const art=svg("g",{},g);
 if(state.mode==="schematic")schematicArt(def.kind,art);else physicalArt(def.kind,art);
 const positions=pinPositions(def.kind);
 positions.forEach((pos,i)=>{const pin=svg("circle",{class:"pin",cx:pos[0],cy:pos[1],r:5,fill:"#c99b42","data-uid":p.uid,"data-pin":i},g);});
 const label=svg("text",{x:0,y:48,"text-anchor":"middle",class:state.mode==="schematic"?"schem-label":"part-label"},g);label.textContent=p.ref+" · "+p.value;
}
function renderBoard(){
 boardLayer.innerHTML="";
 if(state.mode==="breadboard"){
  svg("rect",{x:100,y:150,width:1000,height:460,rx:18,fill:"#f3ead5",stroke:"#d9c9a7","stroke-width":2},boardLayer);
  [0,1].forEach(row=>{for(let i=0;i<42;i++){let x=130+i*22;for(let j=0;j<5;j++){let y=205+row*225+j*22;svg("circle",{cx:x,cy:y,r:4,fill:"#b4a68b",stroke:"#93866e","stroke-width":.6},boardLayer)}}});
  [180,180+22*4,410,410+22*4].forEach(y=>{svg("path",{d:`M125 ${y}H1075`,stroke:"#d66b69","stroke-width":2,opacity:.65},boardLayer)});
  svg("text",{x:125,y:175,class:"board-title"},boardLayer).textContent="POWER RAIL";
  svg("text",{x:125,y:390,class:"board-title"},boardLayer).textContent="TERMINAL STRIPS";
 } else if(state.mode==="perfboard"||state.mode==="pcb"){
  svg("rect",{x:120,y:115,width:960,height:530,rx:12,fill:state.mode==="pcb"?"#236e57":"#d7c7a8",stroke:state.mode==="pcb"?"#15523f":"#b6a37e","stroke-width":3},boardLayer);
  for(let x=145;x<1060;x+=22)for(let y=140;y<625;y+=22){svg("circle",{cx:x,cy:y,r:state.mode==="pcb"?3:4,fill:state.mode==="pcb"?"#d9b66d":"#8f7c5d",stroke:state.mode==="pcb"?"#a98a4d":"#766449","stroke-width":.5},boardLayer)}
  svg("text",{x:145,y:100,class:"board-title"},boardLayer).textContent=state.mode==="pcb"?"PCB PREVIEW · TOP LAYER":"PERFBOARD · HOLE GRID";
 }
}
function renderWires(){
 wireLayer.innerHTML="";
 state.wires.forEach(w=>{const a=state.parts.find(p=>p.uid===w.a),b=state.parts.find(p=>p.uid===w.b);if(!a||!b)return;const ap=pinPositions(PARTS.find(x=>x.id===a.type).kind)[w.ap],bp=pinPositions(PARTS.find(x=>x.id===b.type).kind)[w.bp];let x1=a.x+ap[0],y1=a.y+ap[1],x2=b.x+bp[0],y2=b.y+bp[1],mx=(x1+x2)/2;svg("path",{class:"wire",d:`M${x1} ${y1} H${mx} V${y2} H${x2}`},wireLayer);svg("circle",{class:"wire-dot",cx:x1,cy:y1,r:3.5},wireLayer);svg("circle",{class:"wire-dot",cx:x2,cy:y2,r:3.5},wireLayer)});
 if(state.pending){const p=state.parts.find(x=>x.uid===state.pending.uid);if(p){const pos=pinPositions(PARTS.find(x=>x.id===p.type).kind)[state.pending.pin];svg("circle",{cx:p.x+pos[0],cy:p.y+pos[1],r:9,fill:"#3975d8",opacity:.2},wireLayer)}}
}
function render(){renderBoard();componentLayer.innerHTML="";state.parts.forEach(renderPart);renderWires();$("componentTotal").textContent=state.parts.length+" components";$("wireTotal").textContent=state.wires.length+" connections";$("partCount").textContent=PARTS.length;updateInspector();$("canvasHint").textContent=state.tool==="wire"?(state.pending?"Choose a second pin to finish the wire.":"Choose the first component pin, then its destination."):(state.placing?"Tap the canvas to place "+PARTS.find(p=>p.id===state.placing).name+".":"Choose a component from the library, then tap the canvas to place it.");}
function updateInspector(){
 const p=state.parts.find(x=>x.uid===state.selected),box=$("inspectorContent");if(!p){box.innerHTML='<div class="empty-inspector"><div class="empty-symbol">⌗</div><b>Nothing selected</b><p>Select a component on the canvas to inspect its properties and pin details.</p></div>';return}
 const d=PARTS.find(x=>x.id===p.type);
 box.innerHTML=`<div class="property-card"><h3>${esc(d.name)}</h3><div class="prop-row"><span>Reference</span><b>${esc(p.ref)}</b></div><div class="prop-row"><span>Value</span><b>${esc(p.value)}</b></div><div class="prop-row"><span>Category</span><b>${esc(d.cat)}</b></div><div class="prop-row"><span>View</span><b>${esc(state.mode)}</b></div><div class="prop-row"><span>Position</span><b>${Math.round(p.x)}, ${Math.round(p.y)}</b></div></div><div class="property-card"><h3>Pin configuration</h3><div class="pin-list">${d.pins.map((pin,i)=>`<div class="pin-item"><span>Pin ${i+1}</span><code>${esc(pin)}</code></div>`).join("")}</div></div><div class="property-card"><h3>Part information</h3><div style="font-size:10px;line-height:1.6;color:#8290a1">${esc(d.desc)}. Physical dimensions and manufacturer-specific footprint are not yet verified in V1.</div></div><button class="btn" style="width:100%;margin-top:12px" id="deleteSelected">Delete component</button>`;
 $("deleteSelected").onclick=()=>deleteSelected();
}
function renderLibrary(){const list=$("componentList");list.innerHTML="";const filtered=PARTS.filter(p=>(state.category==="All"||p.cat===state.category)&&(p.name+" "+p.value+" "+p.id).toLowerCase().includes(state.search.toLowerCase()));filtered.forEach(p=>{const b=document.createElement("button");b.className="part";b.innerHTML=`<span class="part-art">${miniSvg(p.kind)}</span><span class="part-info"><b>${esc(p.name)}</b><small>${esc(p.value)}</small></span>`;b.onclick=()=>{state.placing=p.id;state.tool="select";setTool("select");toast("Tap the workspace to place "+p.name)};list.appendChild(b)});if(!filtered.length)list.innerHTML='<div style="padding:15px;color:#9aa5b4;font-size:11px">No matching components.</div>'}
function miniSvg(kind){let body="";if(kind==="resistor")body='<path d="M2 15H9L12 7L17 23L22 7L27 23L31 15H38" fill="none" stroke="#8b6b42" stroke-width="2"/><rect x="10" y="10" width="19" height="10" rx="5" fill="#d8b77a"/>';else if(kind==="capacitor")body='<path d="M2 15H16M16 5V25M23 5V25M23 15H38" stroke="#657487" stroke-width="2" fill="none"/>';else if(kind==="led")body='<path d="M8 7L27 15L8 23Z" fill="#e6535a"/><path d="M27 6V24M2 15H8M27 15H38" stroke="#a83c43" stroke-width="2"/>';else if(kind==="transistor")body='<circle cx="20" cy="15" r="9" fill="#283747"/><path d="M2 15H11M20 2V7M29 15H38" stroke="#667588" stroke-width="2"/>';else if(kind==="ic"||kind==="arduino"||kind==="sensor")body='<rect x="9" y="5" width="22" height="20" rx="3" fill="#283747"/><path d="M4 8H9M4 14H9M4 20H9M31 8H36M31 14H36M31 20H36" stroke="#b18a45" stroke-width="2"/>';else body='<circle cx="20" cy="15" r="10" fill="#aeb9c6" stroke="#637286"/><path d="M2 15H10M30 15H38" stroke="#637286" stroke-width="2"/>';return `<svg viewBox="0 0 40 30">${body}</svg>`}
function setTool(tool){state.tool=tool;["selectTool","wireTool","deleteTool"].forEach(id=>$(id).classList.remove("active"));({select:"selectTool",wire:"wireTool",delete:"deleteTool"})[tool]&&({select:"selectTool",wire:"wireTool",delete:"deleteTool"})[tool]&&$( ({select:"selectTool",wire:"wireTool",delete:"deleteTool"})[tool]).classList.add("active");state.pending=null;render()}
function setMode(mode){state.mode=mode;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));const names={schematic:"Schematic editor",breadboard:"Breadboard view",perfboard:"Perfboard layout",pcb:"PCB layout preview"};$("modeTitle").textContent=names[mode];render()}
function point(evt){const r=workspace.getBoundingClientRect(),x=(evt.clientX-r.left)/r.width*1200,y=(evt.clientY-r.top)/r.height*760;return {x,y}}
function addPart(type,x,y){const d=PARTS.find(p=>p.id===type);const n=state.parts.filter(p=>p.type===type).length+1;const prefix=({resistor:"R",capacitor:"C",ceramic:"C",led:"D",diode:"D",transistor:"Q",ic555:"U",opamp:"U",arduino:"U",sensor:"S",button:"SW",buzzer:"BZ",motor:"M",battery:"BT"})[type]||"X";const p={uid:"p"+Date.now()+Math.random().toString(16).slice(2,6),type,ref:prefix+n,value:d.value,x:Math.round(x/10)*10,y:Math.round(y/10)*10};state.parts.push(p);state.selected=p.uid;state.placing=null;render();toast(d.name+" placed")}
function deleteSelected(){if(!state.selected)return;state.parts=state.parts.filter(p=>p.uid!==state.selected);state.wires=state.wires.filter(w=>w.a!==state.selected&&w.b!==state.selected);state.selected=null;render();toast("Component deleted")}
workspace.addEventListener("pointerdown",e=>{
 const pin=e.target.closest?.(".pin"),comp=e.target.closest?.(".component");
 if(pin){e.stopPropagation();const uid=pin.dataset.uid,pn=Number(pin.dataset.pin);if(state.tool==="wire"){if(!state.pending){state.pending={uid,pin:pn};renderWires();$("statusText").textContent="Wire start selected · choose destination pin"};}else if(state.pending){if(state.pending.uid!==uid||state.pending.pin!==pn){state.wires.push({a:state.pending.uid,ap:state.pending.pin,b:uid,bp:pn});state.pending=null;render();toast("Connection added")} }return}
 if(comp){const uid=comp.dataset.uid;if(state.tool==="delete"){state.selected=uid;deleteSelected();return}if(state.tool==="wire"){state.selected=uid;return}state.selected=uid;const p=state.parts.find(x=>x.uid===uid);state.drag={uid,start:point(e),orig:{x:p.x,y:p.y}};workspace.setPointerCapture(e.pointerId);render();return}
 const pt=point(e);if(state.placing){addPart(state.placing,pt.x,pt.y);return}if(state.tool==="wire"&&state.pending){state.pending=null;renderWires();return}state.selected=null;render();
});
workspace.addEventListener("pointermove",e=>{if(!state.drag)return;const p=state.parts.find(x=>x.uid===state.drag.uid);if(!p)return;const pt=point(e);p.x=Math.max(55,Math.min(1145,state.drag.orig.x+pt.x-state.drag.start.x));p.y=Math.max(55,Math.min(705,state.drag.orig.y+pt.y-state.drag.start.y));const g=componentLayer.querySelector(`[data-uid="${p.uid}"]`);if(g)g.setAttribute("transform",`translate(${p.x} ${p.y})`);renderWires()});
workspace.addEventListener("pointerup",()=>{if(state.drag){state.drag=null;render()}});
workspace.addEventListener("pointercancel",()=>{state.drag=null;render()});
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
$("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;state.category=b.dataset.category;document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("selected",c===b));renderLibrary()});
$("searchInput").addEventListener("input",e=>{state.search=e.target.value;renderLibrary()});
$("selectTool").onclick=()=>setTool("select");$("wireTool").onclick=()=>setTool("wire");$("deleteTool").onclick=()=>setTool("delete");
$("zoomIn").onclick=()=>zoom(1.15);$("zoomOut").onclick=()=>zoom(.87);$("fitBtn").onclick=()=>{state.scale=1;$("zoomLabel").textContent="100%";toast("Canvas fitted")};function zoom(f){state.scale=Math.max(.5,Math.min(2.2,state.scale*f));$("zoomLabel").textContent=Math.round(state.scale*100)+"%";workspace.style.transform=`scale(${state.scale})`;workspace.style.transformOrigin="center center"}
function saveProject(){const data={app:"NEXUS Engineering Studio",version:1,name:$("projectName").value,mode:state.mode,parts:state.parts,wires:state.wires};localStorage.setItem("nexusProject",JSON.stringify(data));toast("Project saved in this browser")}
$("saveBtn").onclick=saveProject;
$("openBtn").onclick=()=>$("importFile").click();
$("newBtn").onclick=()=>{if((state.parts.length||state.wires.length)&&!confirm("Start a new project? Unsaved canvas changes will be cleared."))return;state.parts=[];state.wires=[];state.selected=null;state.pending=null;$("projectName").value="Untitled Circuit";render();toast("New project created")};
$("exportBtn").onclick=()=>{const data={app:"NEXUS Engineering Studio",version:1,name:$("projectName").value,mode:state.mode,parts:state.parts,wires:state.wires};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=($("projectName").value||"nexus-project").replace(/[^a-z0-9-_]/gi,"-")+".json";a.click();URL.revokeObjectURL(a.href);toast("Project JSON exported")};
$("importFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.parts)||!Array.isArray(d.wires))throw Error();state.parts=d.parts;state.wires=d.wires;state.selected=null;$("projectName").value=d.name||"Imported project";setMode(d.mode||"schematic");toast("Project imported")}catch{toast("Invalid NEXUS project file")}};r.readAsText(f);e.target.value=""};
$("newBtn").addEventListener("contextmenu",e=>{e.preventDefault();$("importFile").click()});
$("zoomLabel").title="Zoom percentage";
function restoreProject(){const raw=localStorage.getItem("nexusProject");if(!raw)return;try{const d=JSON.parse(raw);if(Array.isArray(d.parts)&&Array.isArray(d.wires)){state.parts=d.parts;state.wires=d.wires;$("projectName").value=d.name||"Restored project";state.mode=d.mode||"schematic";document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===state.mode));$("modeTitle").textContent=({schematic:"Schematic editor",breadboard:"Breadboard view",perfboard:"Perfboard layout",pcb:"PCB layout preview"})[state.mode]||"Schematic editor";}}catch{}}
restoreProject();renderLibrary();render();