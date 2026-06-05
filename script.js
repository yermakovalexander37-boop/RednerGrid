const canvas = document.getElementById("sequence");
const context = canvas.getContext("2d");

const frameCount = 90; // поменяй на своё количество кадров

const currentFrame = index =>
  `Frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const images = [];
let currentIndex = 0;

let isDragging = false;
let startX = 0;
let lastX = 0;
let velocity = 0;
let inertiaId = null;
let lastMoveTime = 0;
let dragAccumulator = 0;

const sensitivity = 5; // чем меньше число, тем быстрее вращение


for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

images[0].onload = () => {
  canvas.width = images[0].naturalWidth;
  canvas.height = images[0].naturalHeight;

  render();
};

function normalizeIndex(index) {
  return ((index % frameCount) + frameCount) % frameCount;
}

function render() {
  const img = images[currentIndex];

  if (!img || !img.complete || img.naturalWidth === 0) {
    console.warn("Frame not loaded:", currentIndex, currentFrame(currentIndex));
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function moveViewer(deltaX) {
  dragAccumulator += deltaX;

  if (Math.abs(dragAccumulator) >= sensitivity) {
    const frameDelta = Math.trunc(dragAccumulator / sensitivity);

    currentIndex = normalizeIndex(currentIndex + frameDelta);
    dragAccumulator = dragAccumulator % sensitivity;

    render();
  }
}

canvas.addEventListener("pointerdown", (e) => {
  isDragging = true;
  startX = e.clientX;
  lastX = e.clientX;
  lastMoveTime = performance.now();
  dragAccumulator = 0;

  if (inertiaId) {
    cancelAnimationFrame(inertiaId);
    inertiaId = null;
  }

  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDragging) return;

  const now = performance.now();
  const deltaX = e.clientX - lastX;
  const deltaTime = now - lastMoveTime || 16;

  velocity = deltaX / deltaTime;

  if (Math.abs(deltaX) >= sensitivity) {
    moveViewer(deltaX);
    lastX = e.clientX;
  }

  lastMoveTime = now;
});

canvas.addEventListener("pointerup", (e) => {
  isDragging = false;
  canvas.releasePointerCapture(e.pointerId);
  startInertia();
});

canvas.addEventListener("pointercancel", () => {
  isDragging = false;
});

function startInertia() {
  let inertiaVelocity = velocity * 10;

  function step() {
    if (Math.abs(inertiaVelocity) < 0.1) {
      inertiaId = null;
      return;
    }

    moveViewer(inertiaVelocity);
    inertiaVelocity *= 0.94;

    inertiaId = requestAnimationFrame(step);
  }

  step();
}

const fullscreenBtn = document.getElementById("fullscreenBtn");
const viewer = document.querySelector(".viewer");

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    viewer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  render();
});
