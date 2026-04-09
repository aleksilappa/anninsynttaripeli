const imageCache = {};

function preloadImages(paths, callback) {
  let loaded = 0;

  paths.forEach(path => {
    const img = new Image();
    img.src = path;
    imageCache[path] = img;

    img.onload = () => {
      loaded++;
      if (loaded === paths.length && callback) {
        callback();
      }
    };
  });
}

const imagesToPreload = [
  "images/bar/bar1.png",
  "images/bar/bar2.png",
  "images/bar/bar3.png",
  "images/bar/bar4.png",

  "images/character/idle_left.png",
  "images/character/idle_right.png",
  "images/character/walk_left_1.png",
  "images/character/walk_left_2.png",
  "images/character/walk_right_1.png",
  "images/character/walk_right_2.png"
];

const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const bgFar = document.getElementById("bg-far");
const bgMid = document.getElementById("bg-mid");
const bgFront = document.getElementById("bg-front");
const doorsLayer = document.getElementById("doorsLayer");
const car = document.getElementById("car");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const controls = document.getElementById("controls");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const clock = document.getElementById("clock");
const music = document.getElementById("music");
const correctSound = document.getElementById("correctSound");
const doorSound = document.getElementById("doorSound");
const typingSound = document.getElementById("typingSound");

const barScreen = document.getElementById("barScreen");
const barImg = document.getElementById("barImg");
const goToCounter = document.getElementById("goToCounter");
const barUI = document.getElementById("barUI");
const orderInput = document.getElementById("orderInput");
const submitOrder = document.getElementById("submitOrder");
const barResponse = document.getElementById("barResponse");

const fadeOverlay = document.getElementById("fadeOverlay");

/* ================= FADE ================= */
function fadeOut(callback) {
  fadeOverlay.classList.add("active");
  setTimeout(() => callback && callback(), 1000);
}

function fadeIn(callback) {
  fadeOverlay.classList.remove("active");
  callback && callback();
}

/* ================= BUTTONIT ================= */
const lookAtTableBtn = document.createElement("button");
lookAtTableBtn.textContent = "Katso pöytään";
barUI.appendChild(lookAtTableBtn);

const lookSideBtn = document.createElement("button");
lookSideBtn.textContent = "Katso sivulle";
barUI.appendChild(lookSideBtn);

/* ================= WORLD ================= */
const WORLD_LEFT = 0;
const WORLD_RIGHT = 7200 - 700;
const VIEWPORT_WIDTH = 568;
const PUB_DOOR_X = 6440;

/* ================= PLAYER ================= */
let playerX = WORLD_LEFT;
let movingLeft = false;
let movingRight = false;
let walkFrame = 0;
let facing = "right";
let gameStarted = false;
let enteringPub = false;
let friendsHaveShouted = false;

/* ================= AUTO ================= */
let carObj = { x: WORLD_RIGHT, speed: 2 };
const CAR_LEFT_LIMIT = -200;

/* ================= SCALE ================= */
function scaleGame() {
  const scale = Math.min(window.innerWidth / VIEWPORT_WIDTH, window.innerHeight / 320);
  viewport.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", scaleGame);
scaleGame();

/* ================= TYPE ================= */
let typingTimer = null;

function typeText(text, color) {
  clearInterval(typingTimer);
  barResponse.textContent = "";
  barResponse.style.color = color;

  typingSound.currentTime = 0;
  typingSound.play().catch(() => {});

  let i = 0;
  typingTimer = setInterval(() => {
    barResponse.textContent += text[i];
    i++;

    if (i >= text.length) {
      clearInterval(typingTimer);
      typingSound.pause();
      typingSound.currentTime = 0;
    }
  }, 35);
}

/* ================= START ================= */
startBtn.onclick = () => {
  startBtn.disabled = true;
  startBtn.textContent = "Ladataan...";

  preloadImages(imagesToPreload, () => {
    startScreen.classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    clock.play().catch(() => {});
    clock.onended = () => {
      music.play().catch(() => {});
      controls.classList.remove("hidden");
      gameStarted = true;
    };
  });
};

/* ================= CONTROLS ================= */
document.addEventListener("keydown", e => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") movingLeft = true;
  if (e.key === "ArrowRight") movingRight = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") movingLeft = false;
  if (e.key === "ArrowRight") movingRight = false;
});

leftBtn.ontouchstart = () => movingLeft = true;
leftBtn.ontouchend = () => movingLeft = false;
rightBtn.ontouchstart = () => movingRight = true;
rightBtn.ontouchend = () => movingRight = false;

/* ================= PUB ================= */
function enterPub() {
  doorSound.currentTime = 0;
  doorSound.play().catch(() => {});

  fadeOut(() => {
    document.getElementById("game").classList.add("hidden");
    controls.classList.add("hidden");
    barScreen.classList.remove("hidden");

    barImg.src = "images/bar/bar1.png";
    goToCounter.classList.remove("hidden");
    barUI.classList.add("hidden");

    if (!friendsHaveShouted) {
      typeText("Hei, me ollaan täällä! Käy vain ensin tiskillä!", "#3cff3c");
      friendsHaveShouted = true;
    } else {
      barResponse.textContent = "";
    }

    fadeIn();
  });

  gameStarted = false;
}

/* ================= BAR1 → BAR2 ================= */
goToCounter.onclick = () => {
  fadeOut(() => {
    barImg.src = "images/bar/bar2.png";

    goToCounter.classList.add("hidden");
    barUI.classList.remove("hidden");

    submitOrder.style.display = "inline-block";
    submitOrder.textContent = "Tilaa";
    lookAtTableBtn.style.display = "inline-block";
    lookSideBtn.style.display = "inline-block";

    fadeIn(() => {
      typeText("Mitä saisi olla?", "#ffd700");
    });
  });
};

/* ================= KATSO PÖYTÄÄ ================= */
lookAtTableBtn.onclick = () => {
  fadeOut(() => {
    barImg.src = "images/bar/bar1.png";
    barUI.classList.add("hidden");
    goToCounter.classList.remove("hidden");

    fadeIn(() => {
      barResponse.textContent = "";
    });
  });
};

/* ================= KATSO SIVULLE ================= */
lookSideBtn.onclick = () => {
  fadeOut(() => {
    barImg.src = "images/bar/bar4.png";
    orderInput.value = "";

    submitOrder.textContent = "Tarjoa";

    // 🔥 PIILOTA MUUT
    lookAtTableBtn.style.display = "none";
    lookSideBtn.style.display = "none";

    fadeIn(() => {
      typeText(
        "Hei kuule, ei sulla ois autolle tarvetta? Mulla ois juuri sulle passeli kuparinruskea, kompakti hybridi-Kia, eikä maksa paljon. Paljonko tarjoat?",
        "#ffd700"
      );
    });
  });
};

/* ================= VASTAUS ================= */
submitOrder.onclick = () => {
  const t = orderInput.value.toLowerCase();

  /* BAR2 */
  if (barImg.src.includes("bar2")) {
    correctSound.currentTime = 0;
    correctSound.play().catch(() => {});
    typeText("Tuon pöytään.", "#ffd700");
    return;
  }

  /* BAR4 */
  const hasBeer =
    t.includes("4chiefs") ||
    t.includes("lager") ||
    t.includes("olut");

  const numbers = t.match(/\d+/g);
  const amount = numbers ? Math.max(...numbers.map(n => parseInt(n))) : 0;

  if (hasBeer && amount > 1000) {
    typeText("Kiinni veti!", "#3cff3c");

    setTimeout(() => {
      barResponse.textContent = "";
      fadeOut(() => {
        barImg.src = "images/bar/bar3.png";

        // 🔥 PIILOTA KAIKKI
        barUI.classList.add("hidden");
        submitOrder.style.display = "none";

        fadeIn();
      });
    }, 2000);

    return;
  }

  if (!hasBeer && amount <= 1000) {
    typeText("Ei kyllä onnistu!", "#ff4444");
    return;
  }

  if (amount > 1000 && !hasBeer) {
    typeText("Hyvältä kuullostaa, mutta vähän siinä jää kurkkua vielä kuivamaan", "#ffd700");
    return;
  }

  if (hasBeer && amount <= 1000) {
    typeText("Aika hyvä, mutta kyllä siitä pitäisi vähän rahulia enemmän tulla!", "#ffd700");
    return;
  }
};

/* ================= UPDATE ================= */
function update() {
  const speed = 2;
  let walking = false;

  if (gameStarted) {
    if (movingRight) { playerX += speed; facing = "right"; walking = true; }
    if (movingLeft) { playerX -= speed; facing = "left"; walking = true; }

    playerX = Math.max(WORLD_LEFT, Math.min(WORLD_RIGHT, playerX));

    if (playerX >= PUB_DOOR_X && !enteringPub) {
      enteringPub = true;
      enterPub();
    }
  }

  player.style.left = VIEWPORT_WIDTH / 2 - player.width / 2 + "px";
  bgFar.style.backgroundPositionX = -playerX * 0.3 + "px";
  bgMid.style.backgroundPositionX = -playerX * 0.6 + "px";
  bgFront.style.backgroundPositionX = -playerX + "px";
  doorsLayer.style.left = -playerX + "px";

  if (carObj.x > CAR_LEFT_LIMIT) carObj.x -= carObj.speed;
  car.style.left = carObj.x - playerX + VIEWPORT_WIDTH / 2 + "px";

  if (walking) {
    walkFrame++;
    const f = Math.floor(walkFrame / 10) % 4;
    player.src =
      f === 0 ? `images/character/walk_${facing}_1.png` :
      f === 2 ? `images/character/walk_${facing}_2.png` :
      `images/character/idle_${facing}.png`;
  } else {
    player.src = `images/character/idle_${facing}.png`;
    walkFrame = 0;
  }

  requestAnimationFrame(update);
}

update();