gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("sequence");
const context = canvas.getContext("2d");

const frameCount = 53; // поменять на свое количество кадров
const currentFrame = index =>
  `Frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const images = [];
const sequence = { frame: 0 };

canvas.width = 1280;
canvas.height = 720;

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

images[0].onload = render;

gsap.to(sequence, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  },
  onUpdate: render
});

function render() {
  const img = images[sequence.frame];
  if (!img || !img.complete) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  updateHotspots();
}

const hotspotLayer = document.getElementById("hotspots");

function updateHotspots() {
  hotspotLayer.innerHTML = "";

  hotspots.forEach(hotspot => {
    if (sequence.frame >= hotspot.frameStart && sequence.frame <= hotspot.frameEnd) {
      const el = document.createElement("div");
      el.className = "hotspot";
      el.style.left = `${hotspot.x * 100}%`;
      el.style.top = `${hotspot.y * 100}%`;
      el.textContent = hotspot.title;

      hotspotLayer.appendChild(el);
    }
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  console.log({
    frame: sequence.frame,
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3))
  });
});
