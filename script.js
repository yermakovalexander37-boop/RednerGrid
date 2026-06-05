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
  const frameDelta = Math.round(deltaX / sensitivity);

  if (frameDelta !== 0) {
    currentIndex = normalizeIndex(currentIndex + frameDelta);
    render();
  }
}

canvas.addEventListener("pointerdown", (e) => {
  isDragging = true;
  startX = e.clientX;
  lastX = e.clientX;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - lastX;

  if (Math.abs(deltaX) >= sensitivity) {
    moveViewer(deltaX);
    lastX = e.clientX;
  }
});

canvas.addEventListener("pointerup", (e) => {
  isDragging = false;
  canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener("pointercancel", () => {
  isDragging = false;
});
