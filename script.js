const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);
const fields = {
  name: $("fName"),
  role: $("fRole"),
  cls: $("fClass"),
  stack: $("fStack"),
  vibe: $("fVibe")
};

let photo = null;
let mode = "card";
let qrData = "https://hhgoa.com";

function fitText(text, max, font, fallback=""){
  text = text || fallback;
  ctx.font = font;
  if(ctx.measureText(text).width <= max) return text;
  while(text.length > 2 && ctx.measureText(text + "…").width > max) text = text.slice(0,-1);
  return text + "…";
}

function roundRect(x,y,w,h,r,fill,stroke,lw=1){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
}

function line(x1,y1,x2,y2,color,lw=1,dash=[]){
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.setLineDash(dash);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}

function circle(x,y,r,fill,stroke,lw=1){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}
}

function drawPalm(x,y,s,flip=1){
  ctx.save();ctx.translate(x,y);ctx.scale(flip*s,s);
  ctx.strokeStyle="#0b5b40";ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-8,-75,-1,-145);ctx.stroke();
  const leaves=[[-3,-140,-100,-175],[-5,-137,85,-180],[-5,-125,-105,-110],[-3,-126,105,-105],[-4,-145,-35,-225],[-3,-145,45,-225]];
  leaves.forEach(a=>{
    ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo((a[2]+a[4])/2,a[3]-15,a[2],a[3]);ctx.stroke();
  });
  ctx.restore();
}

function drawSunset(x,y,s=1){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const g=ctx.createRadialGradient(0,0,5,0,0,70);
  g.addColorStop(0,"#fff9a5");g.addColorStop(.45,"#ffd31d");g.addColorStop(1,"#ff7655");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,62,Math.PI,0);ctx.fill();
  ctx.strokeStyle="#f5c518";ctx.lineWidth=8;
  for(let i=-50;i<=50;i+=18){ctx.beginPath();ctx.moveTo(i,18);ctx.lineTo(i*.7,30);ctx.stroke()}
  ctx.restore();
}

function drawPhoto(cx,cy,r){
  circle(cx,cy,r+12,"#f8f0d9","#063b2a",5);
  circle(cx,cy,r+5,null,"#f5c518",8);
  circle(cx,cy,r+1,null,"#ff7655",5);

  ctx.save();
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
  if(photo){
    const iw=photo.naturalWidth||photo.width, ih=photo.naturalHeight||photo.height;
    const scale=Math.max((r*2)/iw,(r*2)/ih);
    const w=iw*scale,h=ih*scale;
    ctx.drawImage(photo,cx-w/2,cy-h/2,w,h);
  }else{
    ctx.fillStyle="#9cb5a8";ctx.fillRect(cx-r,cy-r,r*2,r*2);
    ctx.fillStyle="#244c3c";ctx.beginPath();ctx.arc(cx,cy-20,58,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#d2b09a";ctx.beginPath();ctx.arc(cx,cy-10,42,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#203b31";ctx.fillRect(cx-65,cy+42,130,90);
  }
  ctx.restore();
}

function drawQR(x,y,size){
  // Decorative QR-style code that remains crisp when downloaded.
  const n=21, cell=size/n;
  ctx.fillStyle="#fff";ctx.fillRect(x,y,size,size);
  ctx.fillStyle="#063b2a";
  const seed=(fields.name.value+fields.cls.value+qrData).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  function finder(px,py){
    ctx.fillStyle="#063b2a";ctx.fillRect(x+px*cell,y+py*cell,7*cell,7*cell);
    ctx.fillStyle="#fff";ctx.fillRect(x+(px+1)*cell,y+(py+1)*cell,5*cell,5*cell);
    ctx.fillStyle="#063b2a";ctx.fillRect(x+(px+2)*cell,y+(py+2)*cell,3*cell,3*cell);
  }
  finder(0,0);finder(14,0);finder(0,14);
  let s=seed||17;
  for(let row=0;row<n;row++)for(let col=0;col<n;col++){
    if((col<8&&row<8)||(col>12&&row<8)||(col<8&&row>12)) continue;
    s=(s*9301+49297)%233280;
    if(s/233280>.56)ctx.fillRect(x+col*cell,y+row*cell,cell,cell);
  }
}

function drawCard(){
  const W=1080,H=1350;
  ctx.clearRect(0,0,W,H);

  // Cream ID card
  ctx.fillStyle="#f8f0d9";ctx.fillRect(0,0,W,H);
  roundRect(18,18,W-36,H-36,18,null,"#063b2a",12);
  roundRect(36,36,W-72,H-72,10,null,"#ff7655",3);
  ctx.strokeStyle="#0d6a49";ctx.lineWidth=2;ctx.setLineDash([3,7]);
  ctx.strokeRect(58,58,W-116,H-116);ctx.setLineDash([]);

  // top dot pattern
  const dots=["#f5c518","#e8375f","#ff7655"];
  for(let x=70,i=0;x<1010;x+=43,i++) circle(x,70,8,dots[i%3]);

  // Header
  ctx.textAlign="center";
  ctx.fillStyle="#f5c518";
  ctx.font='400 78px "Anton"';
  ctx.fillText("HACKER",390,150);
  ctx.fillStyle="#e8375f";ctx.font='400 60px "Bebas Neue"';ctx.fillText("गोवा",540,148);
  ctx.fillStyle="#f5c518";ctx.font='400 78px "Anton"';ctx.fillText("HOUSE",735,150);
  ctx.fillStyle="#063b2a";ctx.font='700 18px "JetBrains Mono"';
  ctx.fillText("✦ BUILD IN GOA · SHIP FROM PARADISE ✦",540,185);

  circle(935,135,45,"#f8f0d9","#063b2a",3);
  ctx.fillStyle="#063b2a";ctx.font='700 11px "JetBrains Mono"';
  ctx.fillText("BUILD IN",935,130);ctx.fillText("GOA ✦",935,147);

  // photo
  drawPhoto(275,430,130);

  // builder badge
  roundRect(145,575,260,58,28,"#e8375f");
  ctx.fillStyle="#fff";ctx.font='700 22px "JetBrains Mono"';ctx.fillText("✦ BUILDER ✦",275,613);

  // identity section
  ctx.textAlign="left";
  const name=fitText(fields.name.value.toUpperCase(),500,'700 62px "Anton"',"Your Name");
  ctx.fillStyle="#063b2a";ctx.font='700 62px "Anton"';ctx.fillText(name,485,405);

  ctx.fillStyle="#e8375f";ctx.font='700 26px "Space Grotesk"';ctx.fillText("✦ BUILDER ✦",488,452);
  line(485,478,950,478,"#0d6a49",2,[3,8]);

  const rows=[
  ["BUILDER CLASS",fields.cls.value || "","#e8375f"],
  ["SKILLS / STACK",fields.stack.value || "","#f5c518"],
  ["TEAM VIBE",fields.vibe.value || "","#e8375f"]
  ];
  rows.forEach((r,i)=>{
    const y=535+i*112;
    circle(505,y-5,19,r[2]);
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font='700 16px "JetBrains Mono"';ctx.fillText(i===1?"▣":"✦",505,y+1);
    ctx.textAlign="left";ctx.fillStyle="#063b2a";ctx.font='700 13px "JetBrains Mono"';ctx.fillText(r[0],545,y-10);
    ctx.fillStyle=r[2];ctx.font='600 24px "Space Grotesk"';
    ctx.fillText(fitText(r[1],390,'600 24px "Space Grotesk"'),545,y+25);
  });

  line(95,840,985,840,"#8aa999",2);

  // small tropical sunset
  drawSunset(300,925,.72);
  drawPalm(400,970,.38,1);
  drawPalm(185,970,.32,-1);

  // build/ship/repeat
  ctx.textAlign="center";
  [["BUILD","#f5c518"],["SHIP","#e8375f"],["REPEAT","#f5c518"]].forEach((a,i)=>{
    roundRect(82,940+i*58,170,46,8,a[1]);
    ctx.fillStyle="#063b2a";ctx.font='700 17px "JetBrains Mono"';ctx.fillText(a[0],167,970+i*58);
  });

  // tiny stars
  ctx.fillStyle="#e8375f";ctx.font="30px serif";ctx.fillText("✦",920,730);
  ctx.fillStyle="#f5c518";ctx.fillText("✦",945,780);

  // footer
  roundRect(58,1040,964,220,12,"#063b2a","#f5c518",4);
  ctx.textAlign="left";
  ctx.fillStyle="#d7e7d7";ctx.font='700 11px "JetBrains Mono"';ctx.fillText("BUILDER ID",82,1080);
  ctx.fillStyle="#f5c518";ctx.font='700 22px "JetBrains Mono"';
  ctx.fillText("#HH26-"+String(Math.floor(1000+Math.random()*8999)),82,1112);

  ctx.fillStyle="#d7e7d7";ctx.font='700 11px "JetBrains Mono"';ctx.fillText("VENUE · DATE",420,1080);
  ctx.fillStyle="#fff";ctx.font='600 17px "JetBrains Mono"';
  ctx.fillText("GOA, INDIA · 28–31 OCT 2026",420,1110);

  drawQR(895,1080,105);

  ctx.textAlign="center";
  ctx.fillStyle="#fff";ctx.font='700 12px "JetBrains Mono"';
  ctx.fillText("BUILD · SHIP · REPEAT",540,1215);
}

function drawFrame(){
  // PFP mode uses the same visual language but a square social frame.
  const W=1080,H=1350;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#063b2a";ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#f8f0d9";ctx.beginPath();ctx.arc(W/2,H/2-40,345,0,Math.PI*2);ctx.fill();
  ctx.lineWidth=22;ctx.strokeStyle="#f5c518";ctx.stroke();
  drawPhoto(W/2,H/2-40,285);
  ctx.textAlign="center";
  ctx.fillStyle="#f5c518";ctx.font='400 82px "Anton"';ctx.fillText("HACKER",540,150);
  ctx.fillStyle="#e8375f";ctx.font='400 62px "Bebas Neue"';ctx.fillText("गोवा",540,210);
  ctx.fillStyle="#f5c518";ctx.font='400 82px "Anton"';ctx.fillText("HOUSE",540,275);
  ctx.fillStyle="#fff";ctx.font='700 24px "JetBrains Mono"';
  ctx.fillText("BUILD IN GOA · SHIP FROM PARADISE",540,1130);
  ctx.fillStyle="#e8375f";ctx.font='700 30px "Space Grotesk"';
  ctx.fillText((fields.name.value || "").toUpperCase(),540,1190);
}

function render(){ mode==="card" ? drawCard() : drawFrame(); }

Object.values(fields).forEach(el=>el.addEventListener("input",render));

$("modeCardBtn").onclick=()=>{
  mode="card";$("modeCardBtn").classList.add("active");$("modeFrameBtn").classList.remove("active");render();
};
$("modeFrameBtn").onclick=()=>{
  mode="frame";$("modeFrameBtn").classList.add("active");$("modeCardBtn").classList.remove("active");render();
};

function loadPhoto(file){
  if(!file)return;
  const img=new Image();
  img.onload=()=>{photo=img;$("uploadTitle").textContent="Photo loaded — tap to change";render();};
  img.onerror=()=>{$("heicNote").textContent="Could not read this image in your browser.";};
  img.src=URL.createObjectURL(file);
}
$("photoInput").addEventListener("change",e=>loadPhoto(e.target.files[0]));

// ================= REAL CAMERA SELFIE =================
const cameraModal = $("cameraModal");
const cameraVideo = $("cameraVideo");
const cameraCanvas = $("cameraCanvas");
const cameraStatus = $("cameraStatus");
const selfieBox = $("selfieBox");
const closeCameraBtn = $("closeCameraBtn");
const cancelCameraBtn = $("cancelCameraBtn");
const captureBtn = $("captureBtn");
let cameraStream = null;

async function openCamera(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    cameraStatus.textContent = "Camera API is not supported in this browser.";
    cameraModal.classList.add("open");
    cameraModal.setAttribute("aria-hidden","false");
    return;
  }

  cameraModal.classList.add("open");
  cameraModal.setAttribute("aria-hidden","false");
  cameraStatus.textContent = "Requesting camera permission…";

  try{
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 1080 },
        height: { ideal: 1440 }
      },
      audio: false
    });

    cameraVideo.srcObject = cameraStream;
    await cameraVideo.play();
    cameraStatus.textContent = "Position yourself, then press Capture.";
  }catch(err){
    cameraStatus.textContent =
      err.name === "NotAllowedError"
        ? "Camera permission was blocked. Allow camera access and try again."
        : "Could not open the camera. Make sure your device has a camera.";
  }
}

function closeCamera(){
  if(cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraVideo.srcObject = null;
  cameraModal.classList.remove("open");
  cameraModal.setAttribute("aria-hidden","true");
  cameraStatus.textContent = "";
}

function captureSelfie(){
  if(!cameraStream || cameraVideo.readyState < 2){
    cameraStatus.textContent = "Camera is not ready yet.";
    return;
  }

  const w = cameraVideo.videoWidth;
  const h = cameraVideo.videoHeight;
  if(!w || !h){
    cameraStatus.textContent = "Camera is still starting…";
    return;
  }

  cameraCanvas.width = w;
  cameraCanvas.height = h;

  const cctx = cameraCanvas.getContext("2d");

  // Keep the selfie mirrored, matching the live preview.
  cctx.save();
  cctx.translate(w,0);
  cctx.scale(-1,1);
  cctx.drawImage(cameraVideo,0,0,w,h);
  cctx.restore();

  const img = new Image();
  img.onload = ()=>{
    photo = img;
    $("uploadTitle").textContent = "Selfie loaded — tap to change";
    closeCamera();
    render();
    $("statusMsg").textContent = "Selfie captured ✦";
  };
  img.src = cameraCanvas.toDataURL("image/jpeg",0.92);
}

selfieBox.addEventListener("click", openCamera);
closeCameraBtn.addEventListener("click", closeCamera);
cancelCameraBtn.addEventListener("click", closeCamera);
captureBtn.addEventListener("click", captureSelfie);

cameraModal.addEventListener("click", e=>{
  if(e.target === cameraModal) closeCamera();
});

document.addEventListener("keydown", e=>{
  if(e.key === "Escape" && cameraModal.classList.contains("open")) closeCamera();
});

const classes=["Terminal Wizard","Prompt Pirate","Pixel Pilot","Code Surfer","Ship Captain","Bug Bounty Hunter","Full Stack Nomad"];
$("randClassBtn").onclick=()=>{
  fields.cls.value=classes[Math.floor(Math.random()*classes.length)];
  render();
};

$("downloadBtn").onclick=()=>{
  const a=document.createElement("a");
  a.download="hhgoa-builder-card.png";
  a.href=canvas.toDataURL("image/png");
  a.click();
  $("statusMsg").textContent="Image downloaded ✦";
};

async function shareBuilderCard(){
  const text =
`I just made my Hacker House Goa 2026 Builder ID ✦
#FrameInGoa #HHGoa #HackerHouse`;

  // Generate the actual card image as a File.
  const blob = await new Promise(resolve =>
    canvas.toBlob(resolve, "image/png")
  );

  if(!blob){
    $("statusMsg").textContent = "Could not generate the card image.";
    return;
  }

  const file = new File(
    [blob],
    "hhgoa-builder-card.png",
    { type: "image/png" }
  );

  /*
   * PART 1 — Real image attachment:
   * On phones/tablets that support Web Share with files, the native
   * share sheet receives BOTH the generated image and the caption.
   * If the user chooses X, X gets the actual image as an attachment.
   */
  try{
    const shareData = {
      title: "Hacker House Goa 2026 Builder ID",
      text,
      files: [file]
    };

    if(
      navigator.share &&
      (!navigator.canShare || navigator.canShare({ files: [file] }))
    ){
      await navigator.share(shareData);
      $("statusMsg").textContent =
        "Shared ✦ Choose X in the share sheet to post the image + caption.";
      return;
    }
  }catch(err){
    // User closing the share sheet is not an error we need to show.
    if(err && err.name === "AbortError") return;
  }

  /*
   * FALLBACK — Desktop / browsers without file sharing:
   * X Intent can prefill text, but X does not allow a normal webpage
   * to upload/attach a canvas image through the Intent URL.
   */
  const xUrl =
    "https://x.com/intent/post?text=" + encodeURIComponent(text);

  const xWindow = window.open(xUrl, "_blank");
  if(!xWindow){
    window.location.href = xUrl;
  }

  // Also download the image so it is ready to attach manually.
  const a = document.createElement("a");
  a.download = "hhgoa-builder-card.png";
  a.href = URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(a.href), 1500);

  $("statusMsg").textContent =
    "X opened with your caption ✦ Image downloaded — attach it to the post.";
}

$("shareBtn").onclick = shareBuilderCard;

render();