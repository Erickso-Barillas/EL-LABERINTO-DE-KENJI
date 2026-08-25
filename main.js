const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pantallas y Controles
const menuScreen = document.getElementById('menu-screen');
const introScreen = document.getElementById('intro-screen');
const touchControls = document.getElementById('touch-controls');

// Botones Menú
const btnPlay = document.getElementById('btn-play');
const btnExit = document.getElementById('btn-exit');
const btnStartGame = document.getElementById('btn-start-game');

// Botones D-Pad Táctil
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

// --- AUDIOS DEL JUEGO (.mpeg) ---
const audioMenu = new Audio('audio/menu_music.mpeg');
audioMenu.loop = true;
audioMenu.volume = 0.4;

const audioIntro = new Audio('audio/introduccion.mpeg');
const audioVictoria = new Audio('audio/victoria.mpeg');
const audioDerrota = new Audio('audio/derrota.mpeg');

// Iniciar música de fondo al primer clic o toque
document.body.addEventListener('click', () => {
  if (audioMenu.paused && !gameActive && !menuScreen.classList.contains('hidden')) {
    audioMenu.play().catch(e => console.log(e));
  }
}, { once: true });

// --- ACCIÓN BOTÓN DE SALIDA ---
btnExit.addEventListener('click', () => {
  audioMenu.pause();
  audioMenu.currentTime = 0;
  window.close();
  setTimeout(() => {
    document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:#fff;font-family:sans-serif;text-align:center;"><h1>¡Gracias por jugar! Puedes cerrar esta pestaña.</h1></div>`;
  }, 200);
});

// --- GRÁFICOS DEL JUEGO ---
const imagenes = {
  nino: new Image(),
  muro: new Image(),
  meta: new Image(),
  trampa: new Image(),
  fondo: new Image(),
  victoria: new Image(),
  derrota: new Image()
};

imagenes.nino.src = 'assets/nino.png';
imagenes.muro.src = 'assets/muro.jpg';
imagenes.meta.src = 'assets/meta.png';
imagenes.trampa.src = 'assets/trampa.png';
imagenes.fondo.src = 'assets/fondo.jpg';
imagenes.victoria.src = 'assets/victoria.png'; 
imagenes.derrota.src = 'assets/derrota.png';

Object.values(imagenes).forEach(img => {
  img.onload = () => { if (gameActive) draw(); };
});

// --- LABERINTOS DINÁMICOS ---
const laberintos = [
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
];

let grid = [];
let player = { x: 1, y: 1 };
let gameActive = false;

function seleccionarMapaAleatorio() {
  const indice = Math.floor(Math.random() * laberintos.length);
  grid = JSON.parse(JSON.stringify(laberintos[indice]));
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (gameActive) draw();
});

// --- NAVEGACIÓN ENTRE PANTALLAS ---
btnPlay.addEventListener('click', () => {
  menuScreen.classList.add('hidden');
  introScreen.classList.remove('hidden');

  if (audioMenu.paused) audioMenu.play().catch(e => console.log(e));
  audioIntro.currentTime = 0;
  audioIntro.play().catch(e => console.log(e));
});

btnStartGame.addEventListener('click', () => {
  audioMenu.pause();
  audioMenu.currentTime = 0;
  audioIntro.pause();
  audioIntro.currentTime = 0;

  introScreen.classList.add('hidden');
  
  // Mostrar controles táctiles al iniciar la partida
  touchControls.classList.remove('hidden');

  resizeCanvas();
  seleccionarMapaAleatorio();
  player = { x: 1, y: 1 };
  
  gameActive = true;
  draw();
});

// --- LÓGICA DE MOVIMIENTO (TECLADO Y TÁCTIL) ---
function moverJugador(dir) {
  if (!gameActive) return;

  let nextX = player.x;
  let nextY = player.y;

  if (dir === 'Up') nextY--;
  if (dir === 'Down') nextY++;
  if (dir === 'Left') nextX--;
  if (dir === 'Right') nextX++;

  if (nextY < 0 || nextY >= grid.length || nextX < 0 || nextX >= grid[0].length) return;

  if (grid[nextY][nextX] !== 1) { 
    player.x = nextX;
    player.y = nextY;
    draw();
    checkTile(grid[nextY][nextX]);
  }
}

// Eventos de teclado
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') moverJugador('Up');
  if (e.key === 'ArrowDown') moverJugador('Down');
  if (e.key === 'ArrowLeft') moverJugador('Left');
  if (e.key === 'ArrowRight') moverJugador('Right');
});

// Eventos táctiles para los botones en pantalla
btnUp.addEventListener('click', () => moverJugador('Up'));
btnDown.addEventListener('click', () => moverJugador('Down'));
btnLeft.addEventListener('click', () => moverJugador('Left'));
btnRight.addEventListener('click', () => moverJugador('Right'));

// --- DIBUJO EN CANVAS ---
function draw() {
  if (!grid || grid.length === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tileWidth = canvas.width / grid[0].length;
  const tileHeight = canvas.height / grid.length;

  if (imagenes.fondo.complete && imagenes.fondo.naturalWidth !== 0) {
    ctx.drawImage(imagenes.fondo, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      let x = c * tileWidth;
      let y = r * tileHeight;

      if (grid[r][c] === 1 && imagenes.muro.complete) {
        ctx.drawImage(imagenes.muro, x, y, tileWidth, tileHeight);
      } else if (grid[r][c] === 2 && imagenes.meta.complete) {
        ctx.drawImage(imagenes.meta, x, y, tileWidth, tileHeight);
      } else if (grid[r][c] === 3 && imagenes.trampa.complete) {
        ctx.drawImage(imagenes.trampa, x, y, tileWidth, tileHeight);
      }
    }
  }

  if (imagenes.nino.complete && imagenes.nino.naturalWidth !== 0) {
    const aspectRatio = imagenes.nino.naturalWidth / imagenes.nino.naturalHeight;
    let targetHeight = tileHeight * 0.75; 
    let targetWidth = targetHeight * aspectRatio;

    if (targetWidth > tileWidth * 0.75) {
      targetWidth = tileWidth * 0.75;
      targetHeight = targetWidth / aspectRatio;
    }

    let xPos = player.x * tileWidth + (tileWidth - targetWidth) / 2;
    let yPos = player.y * tileHeight + (tileHeight - targetHeight) / 2;

    ctx.drawImage(imagenes.nino, xPos, yPos, targetWidth, targetHeight);
  }
}

// --- PANTALLA DE RESULTADOS Y REINICIO ---
function mostrarResultado(imgResultado) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  touchControls.classList.add('hidden'); // Oculta controles al finalizar
  
  if (imgResultado.complete && imgResultado.naturalWidth !== 0) {
    const aspectRatio = imgResultado.naturalWidth / imgResultado.naturalHeight;
    let targetHeight = canvas.height * 0.8;
    let targetWidth = targetHeight * aspectRatio;

    if (targetWidth > canvas.width * 0.8) {
      targetWidth = canvas.width * 0.8;
      targetHeight = targetWidth / aspectRatio;
    }

    let x = (canvas.width - targetWidth) / 2;
    let y = (canvas.height - targetHeight) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgResultado, x, y, targetWidth, targetHeight);
  }
}

function checkTile(tileValue) {
  if (tileValue === 2) {
    gameActive = false;
    audioVictoria.currentTime = 0;
    audioVictoria.play().catch(e => console.log(e));
    mostrarResultado(imagenes.victoria);
    setTimeout(() => { reiniciarJuego(); }, 4000);

  } else if (tileValue === 3) {
    gameActive = false;
    audioDerrota.currentTime = 0;
    audioDerrota.play().catch(e => console.log(e));
    mostrarResultado(imagenes.derrota);
    setTimeout(() => { reiniciarJuego(); }, 4000);
  }
}

function reiniciarJuego() {
  player = { x: 1, y: 1 };
  gameActive = false;
  touchControls.classList.add('hidden');
  menuScreen.classList.remove('hidden');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  audioMenu.currentTime = 0;
  audioMenu.play().catch(e => console.log(e));
}