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

/* =========================================================
   BUILDER ID SHARE CONFIG
   ========================================================= */

const BUILDER_ID_BASE_URL =
  "https://hhgoa-builder-id-delta.vercel.app/";

const X_POST_URL =
  "https://x.com/intent/post?text=";


/* =========================================================
   TEXT HELPERS
   ========================================================= */

function fitText(text, max, font, fallback = "") {
  text = text || fallback;
  ctx.font = font;

  if (ctx.measureText(text).width <= max) return text;

  while (
    text.length > 2 &&
    ctx.measureText(text + "…").width > max
  ) {
    text = text.slice(0, -1);
  }

  return text + "…";
}


/* =========================================================
   DRAWING HELPERS
   ========================================================= */

function roundRect(x, y, w, h, r, fill, stroke, lw = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}


function line(x1, y1, x2, y2, color, lw = 1, dash = []) {
  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.setLineDash(dash);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}


function circle(x, y, r, fill, stroke, lw = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}


/* =========================================================
   PALM
   ========================================================= */

function drawPalm(x, y, s, flip = 1) {
  ctx.save();

  ctx.translate(x, y);
  ctx.scale(flip * s, s);

  ctx.strokeStyle = "#0b5b40";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-8, -75, -1, -145);
  ctx.stroke();

  const leaves = [
    [-3, -140, -100, -175],
    [-5, -137, 85, -180],
    [-5, -125, -105, -110],
    [-3, -126, 105, -105],
    [-4, -145, -35, -225],
    [-3, -145, 45, -225]
  ];

  leaves.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo(
      (a[2] + a[4]) / 2,
      a[3] - 15,
      a[2],
      a[3]
    );
    ctx.stroke();
  });

  ctx.restore();
}


/* =========================================================
   SUNSET
   ========================================================= */

function drawSunset(x, y, s = 1) {
  ctx.save();

  ctx.translate(x, y);
  ctx.scale(s, s);

  const g = ctx.createRadialGradient(
    0,
    0,
    5,
    0,
    0,
    70
  );

  g.addColorStop(0, "#fff9a5");
  g.addColorStop(0.45, "#ffd31d");
  g.addColorStop(1, "#ff7655");

  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.arc(0, 0, 62, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 8;

  for (let i = -50; i <= 50; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 18);
    ctx.lineTo(i * 0.7, 30);
    ctx.stroke();
  }

  ctx.restore();
}


/* =========================================================
   PHOTO
   ========================================================= */

function drawPhoto(cx, cy, r) {
  circle(
    cx,
    cy,
    r + 12,
    "#f8f0d9",
    "#063b2a",
    5
  );

  circle(
    cx,
    cy,
    r + 5,
    null,
    "#f5c518",
    8
  );

  circle(
    cx,
    cy,
    r + 1,
    null,
    "#ff7655",
    5
  );

  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (photo) {
    const iw = photo.naturalWidth || photo.width;
    const ih = photo.naturalHeight || photo.height;

    const scale = Math.max(
      (r * 2) / iw,
      (r * 2) / ih
    );

    const w = iw * scale;
    const h = ih * scale;

    ctx.drawImage(
      photo,
      cx - w / 2,
      cy - h / 2,
      w,
      h
    );
  } else {
    ctx.fillStyle = "#9cb5a8";
    ctx.fillRect(
      cx - r,
      cy - r,
      r * 2,
      r * 2
    );

    ctx.fillStyle = "#244c3c";
    ctx.beginPath();
    ctx.arc(
      cx,
      cy - 20,
      58,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#d2b09a";
    ctx.beginPath();
    ctx.arc(
      cx,
      cy - 10,
      42,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#203b31";
    ctx.fillRect(
      cx - 65,
      cy + 42,
      130,
      90
    );
  }

  ctx.restore();
}


/* =========================================================
REAL QR CODE
========================================================= */
function drawQR(x, y, size) {
  const qrUrl = "https://hhgoa-builder-id-delta.vercel.app/";

  // Temporary hidden container for QRCode.js
  let qrContainer = document.getElementById("qrGenerator");

  if (!qrContainer) {
    qrContainer = document.createElement("div");
    qrContainer.id = "qrGenerator";
    qrContainer.style.position = "fixed";
    qrContainer.style.left = "-10000px";
    qrContainer.style.top = "-10000px";
    qrContainer.style.width = `${size}px`;
    qrContainer.style.height = `${size}px`;
    document.body.appendChild(qrContainer);
  }

  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: qrUrl,
    width: size,
    height: size,
    colorDark: "#063b2a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  const qrCanvas = qrContainer.querySelector("canvas");

  if (!qrCanvas) {
    console.error("QR code could not be generated.");
    return;
  }

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);

  // Draw the real QR onto your ID-card canvas
  ctx.drawImage(
    qrCanvas,
    x,
    y,
    size,
    size
  );
}
/* =========================================================
   DRAW CARD
   ========================================================= */

function drawCard() {
  const W = 1080;
  const H = 1350;

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#f8f0d9";
  ctx.fillRect(0, 0, W, H);

  roundRect(
    18,
    18,
    W - 36,
    H - 36,
    18,
    null,
    "#063b2a",
    12
  );

  roundRect(
    36,
    36,
    W - 72,
    H - 72,
    10,
    null,
    "#ff7655",
    3
  );

  ctx.strokeStyle = "#0d6a49";
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 7]);

  ctx.strokeRect(
    58,
    58,
    W - 116,
    H - 116
  );

  ctx.setLineDash([]);

  const dots = [
    "#f5c518",
    "#e8375f",
    "#ff7655"
  ];

  for (
    let x = 70, i = 0;
    x < 1010;
    x += 43, i++
  ) {
    circle(
      x,
      70,
      8,
      dots[i % 3]
    );
  }

  ctx.textAlign = "center";

  ctx.fillStyle = "#f5c518";
  ctx.font = '400 78px "Anton"';
  ctx.fillText("HACKER", 390, 150);

  ctx.fillStyle = "#e8375f";
  ctx.font = '400 60px "Bebas Neue"';
  ctx.fillText("गोवा", 540, 148);

  ctx.fillStyle = "#f5c518";
  ctx.font = '400 78px "Anton"';
  ctx.fillText("HOUSE", 735, 150);

  ctx.fillStyle = "#063b2a";
  ctx.font = '700 18px "JetBrains Mono"';

  ctx.fillText(
    "✦ BUILD IN GOA · SHIP FROM PARADISE ✦",
    540,
    185
  );

  circle(
    935,
    135,
    45,
    "#f8f0d9",
    "#063b2a",
    3
  );

  ctx.fillStyle = "#063b2a";
  ctx.font = '700 11px "JetBrains Mono"';

  ctx.fillText("BUILD IN", 935, 130);
  ctx.fillText("GOA ✦", 935, 147);

  drawPhoto(275, 430, 130);

  roundRect(
    145,
    575,
    260,
    58,
    28,
    "#e8375f"
  );

  ctx.fillStyle = "#fff";
  ctx.font = '700 22px "JetBrains Mono"';

  ctx.fillText(
    "✦ BUILDER ✦",
    275,
    613
  );

  ctx.textAlign = "left";

  const name = fitText(
    fields.name.value.toUpperCase(),
    500,
    '700 62px "Anton"',
    "Your Name"
  );

  ctx.fillStyle = "#063b2a";
  ctx.font = '700 62px "Anton"';

  ctx.fillText(
    name,
    485,
    405
  );

  ctx.fillStyle = "#e8375f";
  ctx.font = '700 26px "Space Grotesk"';

  ctx.fillText(
    "✦ BUILDER ✦",
    488,
    452
  );

  line(
    485,
    478,
    950,
    478,
    "#0d6a49",
    2,
    [3, 8]
  );

  const rows = [
    [
      "BUILDER CLASS",
      fields.cls.value || "",
      "#e8375f"
    ],
    [
      "SKILLS / STACK",
      fields.stack.value || "",
      "#f5c518"
    ],
    [
      "TEAM VIBE",
      fields.vibe.value || "",
      "#e8375f"
    ]
  ];

  rows.forEach((r, i) => {
    const y = 535 + i * 112;

    circle(
      505,
      y - 5,
      19,
      r[2]
    );

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = '700 16px "JetBrains Mono"';

    ctx.fillText(
      i === 1 ? "▣" : "✦",
      505,
      y + 1
    );

    ctx.textAlign = "left";

    ctx.fillStyle = "#063b2a";
    ctx.font = '700 13px "JetBrains Mono"';

    ctx.fillText(
      r[0],
      545,
      y - 10
    );

    ctx.fillStyle = r[2];
    ctx.font = '600 24px "Space Grotesk"';

    ctx.fillText(
      fitText(
        r[1],
        390,
        '600 24px "Space Grotesk"'
      ),
      545,
      y + 25
    );
  });

  line(
    95,
    840,
    985,
    840,
    "#8aa999",
    2
  );

  drawSunset(300, 925, 0.72);
  drawPalm(400, 970, 0.38, 1);
  drawPalm(185, 970, 0.32, -1);

  ctx.textAlign = "center";

  [
    ["BUILD", "#f5c518"],
    ["SHIP", "#e8375f"],
    ["REPEAT", "#f5c518"]
  ].forEach((a, i) => {
    roundRect(
      82,
      940 + i * 58,
      170,
      46,
      8,
      a[1]
    );

    ctx.fillStyle = "#063b2a";
    ctx.font = '700 17px "JetBrains Mono"';

    ctx.fillText(
      a[0],
      167,
      970 + i * 58
    );
  });

  ctx.fillStyle = "#e8375f";
  ctx.font = "30px serif";
  ctx.fillText("✦", 920, 730);

  ctx.fillStyle = "#f5c518";
  ctx.fillText("✦", 945, 780);

  roundRect(
    58,
    1040,
    964,
    220,
    12,
    "#063b2a",
    "#f5c518",
    4
  );

  ctx.textAlign = "left";

  ctx.fillStyle = "#d7e7d7";
  ctx.font = '700 11px "JetBrains Mono"';

  ctx.fillText(
    "BUILDER ID",
    82,
    1080
  );

  ctx.fillStyle = "#f5c518";
  ctx.font = '700 22px "JetBrains Mono"';

  ctx.fillText(
    "#HH26-" +
      String(
        Math.floor(
          1000 + Math.random() * 8999
        )
      ),
    82,
    1112
  );

  ctx.fillStyle = "#d7e7d7";
  ctx.font = '700 11px "JetBrains Mono"';

  ctx.fillText(
    "VENUE · DATE",
    420,
    1080
  );

  ctx.fillStyle = "#fff";
  ctx.font = '600 17px "JetBrains Mono"';

  ctx.fillText(
    "GOA, INDIA · 28–31 OCT 2026",
    420,
    1110
  );

 ctx.textAlign = "center";

  ctx.fillStyle = "#fff";
  ctx.font = '700 12px "JetBrains Mono"';

  ctx.fillText(
    "BUILD · SHIP · REPEAT",
    540,
    1215
  );
  drawQR(895, 1080, 140);
}


/* =========================================================
   DRAW FRAME
   ========================================================= */

function drawFrame() {
  const W = 1080;
  const H = 1350;

  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#063b2a";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#f8f0d9";

  ctx.beginPath();
  ctx.arc(
    W / 2,
    H / 2 - 40,
    345,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.lineWidth = 22;
  ctx.strokeStyle = "#f5c518";
  ctx.stroke();

  drawPhoto(
    W / 2,
    H / 2 - 40,
    285
  );

  ctx.textAlign = "center";

  ctx.fillStyle = "#f5c518";
  ctx.font = '400 82px "Anton"';

  ctx.fillText(
    "HACKER",
    540,
    150
  );

  ctx.fillStyle = "#e8375f";
  ctx.font = '400 62px "Bebas Neue"';

  ctx.fillText(
    "गोवा",
    540,
    210
  );

  ctx.fillStyle = "#f5c518";
  ctx.font = '400 82px "Anton"';

  ctx.fillText(
    "HOUSE",
    540,
    275
  );

  ctx.fillStyle = "#fff";
  ctx.font = '700 24px "JetBrains Mono"';

  ctx.fillText(
    "BUILD IN GOA · SHIP FROM PARADISE",
    540,
    1130
  );

  ctx.fillStyle = "#e8375f";
  ctx.font = '700 30px "Space Grotesk"';

  ctx.fillText(
    (fields.name.value || "").toUpperCase(),
    540,
    1190
  );
}


/* =========================================================
   RENDER
   ========================================================= */

function render() {
  mode === "card"
    ? drawCard()
    : drawFrame();
}

Object.values(fields).forEach(el => {
  el.addEventListener("input", render);
});


/* =========================================================
   MODE BUTTONS
   ========================================================= */

$("modeCardBtn").onclick = () => {
  mode = "card";

  $("modeCardBtn").classList.add("active");
  $("modeFrameBtn").classList.remove("active");

  render();
};


$("modeFrameBtn").onclick = () => {
  mode = "frame";

  $("modeFrameBtn").classList.add("active");
  $("modeCardBtn").classList.remove("active");

  render();
};


/* =========================================================
   PHOTO UPLOAD
   ========================================================= */

function loadPhoto(file) {
  if (!file) return;

  const img = new Image();

  img.onload = () => {
    photo = img;

    $("uploadTitle").textContent =
      "Photo loaded — tap to change";

    render();
  };

  img.onerror = () => {
    $("heicNote").textContent =
      "Could not read this image in your browser.";
  };

  img.src = URL.createObjectURL(file);
}


$("photoInput").addEventListener(
  "change",
  e => loadPhoto(e.target.files[0])
);


/* =========================================================
   CAMERA
   ========================================================= */

const cameraModal = $("cameraModal");
const cameraVideo = $("cameraVideo");
const cameraCanvas = $("cameraCanvas");
const cameraStatus = $("cameraStatus");
const selfieBox = $("selfieBox");
const closeCameraBtn = $("closeCameraBtn");
const cancelCameraBtn = $("cancelCameraBtn");
const captureBtn = $("captureBtn");

let cameraStream = null;


async function openCamera() {
  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    cameraStatus.textContent =
      "Camera API is not supported in this browser.";

    cameraModal.classList.add("open");
    cameraModal.setAttribute(
      "aria-hidden",
      "false"
    );

    return;
  }

  cameraModal.classList.add("open");

  cameraModal.setAttribute(
    "aria-hidden",
    "false"
  );

  cameraStatus.textContent =
    "Requesting camera permission…";

  try {
    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "user"
          },
          width: {
            ideal: 1080
          },
          height: {
            ideal: 1440
          }
        },
        audio: false
      });

    cameraVideo.srcObject = cameraStream;

    await cameraVideo.play();

    cameraStatus.textContent =
      "Position yourself, then press Capture.";
  } catch (err) {
    cameraStatus.textContent =
      err.name === "NotAllowedError"
        ? "Camera permission was blocked. Allow camera access and try again."
        : "Could not open the camera. Make sure your device has a camera.";
  }
}


function closeCamera() {
  if (cameraStream) {
    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }

  cameraVideo.srcObject = null;

  cameraModal.classList.remove("open");

  cameraModal.setAttribute(
    "aria-hidden",
    "true"
  );

  cameraStatus.textContent = "";
}


function captureSelfie() {
  if (
    !cameraStream ||
    cameraVideo.readyState < 2
  ) {
    cameraStatus.textContent =
      "Camera is not ready yet.";

    return;
  }

  const w = cameraVideo.videoWidth;
  const h = cameraVideo.videoHeight;

  if (!w || !h) {
    cameraStatus.textContent =
      "Camera is still starting…";

    return;
  }

  cameraCanvas.width = w;
  cameraCanvas.height = h;

  const cctx =
    cameraCanvas.getContext("2d");

  cctx.save();

  cctx.translate(w, 0);
  cctx.scale(-1, 1);

  cctx.drawImage(
    cameraVideo,
    0,
    0,
    w,
    h
  );

  cctx.restore();

  const img = new Image();

  img.onload = () => {
    photo = img;

    $("uploadTitle").textContent =
      "Selfie loaded — tap to change";

    closeCamera();

    render();

    $("statusMsg").textContent =
      "Selfie captured ✦";
  };

  img.src =
    cameraCanvas.toDataURL(
      "image/jpeg",
      0.92
    );
}


selfieBox.addEventListener(
  "click",
  openCamera
);

closeCameraBtn.addEventListener(
  "click",
  closeCamera
);

cancelCameraBtn.addEventListener(
  "click",
  closeCamera
);

captureBtn.addEventListener(
  "click",
  captureSelfie
);

cameraModal.addEventListener(
  "click",
  e => {
    if (e.target === cameraModal) {
      closeCamera();
    }
  }
);

document.addEventListener(
  "keydown",
  e => {
    if (
      e.key === "Escape" &&
      cameraModal.classList.contains("open")
    ) {
      closeCamera();
    }
  }
);


/* =========================================================
   RANDOM BUILDER CLASS
   ========================================================= */

const classes = [
  "Terminal Wizard",
  "Prompt Pirate",
  "Pixel Pilot",
  "Code Surfer",
  "Ship Captain",
  "Bug Bounty Hunter",
  "Full Stack Nomad"
];

$("randClassBtn").onclick = () => {
  fields.cls.value =
    classes[
      Math.floor(
        Math.random() * classes.length
      )
    ];

  render();
};


/* =========================================================
   DOWNLOAD
   ========================================================= */

$("downloadBtn").onclick = () => {
  const a = document.createElement("a");

  a.download =
    "hhgoa-builder-card.png";

  a.href =
    canvas.toDataURL("image/png");

  a.click();

  $("statusMsg").textContent =
    "Image downloaded ✦";
};


/* =========================================================
   UNIQUE BUILDER ID URL
   =========================================================

   We encode the user's Builder ID data into ?b=...

   Example:

   https://hhgoa-builder-id-delta.vercel.app/?b=....

   The destination page can decode this data and render
   the correct Builder ID / social preview.
   ========================================================= */

/* =========================================================
CLOUDINARY CONFIG
========================================================= */

const CLOUDINARY_CLOUD_NAME = "th1ommgn";
const CLOUDINARY_UPLOAD_PRESET = "hhgoa_builder";

/* =========================================================
UPLOAD CANVAS TO CLOUDINARY
========================================================= */

async function uploadCardToCloudinary() {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Could not create card image.");
  }

  const formData = new FormData();

  formData.append("file", blob, "hh-goa-builder.png");
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "hh-goa-2026");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cloudinary error:", errorText);
    throw new Error("Cloudinary upload failed.");
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return data.secure_url;
}

/* =========================================================
SHARE TO X
========================================================= */

async function shareBuilderCard() {
  const status = $("statusMsg");

  try {
    status.textContent =
      "Creating your Builder ID image…";

    /* Make sure the latest card is rendered */
    render();

    /* Upload current canvas to Cloudinary */
    const imageURL =
      await uploadCardToCloudinary();

    console.log(
      "Cloudinary image URL:",
      imageURL
    );

    /* X post text */
   const text =
`I just forged my Hacker House Goa 2026 Builder Identity! 🌴

${imageURL}

Live Link:
https://hhgoa-builder-id-delta.vercel.app/

#HHGoa2026 #FrameInGoa #HackerHouse`;

    /* Open X composer */
    const xUrl =
      "https://x.com/intent/post?text=" +
      encodeURIComponent(text);

    const xWindow = window.open(
      xUrl,
      "_blank",
      "noopener,noreferrer"
    );

    /* Popup blocker fallback */
    if (!xWindow) {
      window.location.href = xUrl;
      return;
    }

    status.textContent =
      "Builder ID uploaded ✦ X opened!";

  } catch (error) {

    console.error(
      "Builder ID sharing failed:",
      error
    );

    status.textContent =
      "Upload failed. Check Cloudinary settings.";
  }
}

/* =========================================================
CONNECT SHARE BUTTON
========================================================= */

$("shareBtn").addEventListener(
  "click",
  shareBuilderCard
);

/* =========================================================
START APP
========================================================= */

render();