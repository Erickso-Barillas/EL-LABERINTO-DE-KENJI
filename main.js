const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pantallas
const menuScreen = document.getElementById('menu-screen');
const introScreen = document.getElementById('intro-screen');

// Botones
const btnPlay = document.getElementById('btn-play');
const btnExit = document.getElementById('btn-exit');
const btnStartGame = document.getElementById('btn-start-game');

// --- AUDIOS DEL JUEGO (.mpeg) ---
const audioMenu = new Audio('audio/menu_music.mpeg');
audioMenu.loop = true;
audioMenu.volume = 0.4;

const audioIntro = new Audio('audio/introduccion.mpeg');
const audioVictoria = new Audio('audio/victoria.mpeg');
const audioDerrota = new Audio('audio/derrota.mpeg');

// Iniciar música de fondo al primer clic del usuario
document.body.addEventListener('click', () => {
  if (audioMenu.paused && !gameActive && !menuScreen.classList.contains('hidden')) {
    audioMenu.play().catch(e => console.log("Esperando interacción..."));
  }
}, { once: true });

// --- ACCIÓN BOTÓN DE SALIDA ---
btnExit.addEventListener('click', () => {
  // 1. Detiene la música de fondo
  audioMenu.pause();
  audioMenu.currentTime = 0;

  // 2. Intenta cerrar la ventana/pestaña actual
  window.close();

  // 3. Si el navegador bloquea window.close(), redirige o limpia la pantalla
  setTimeout(() => {
    document.body.innerHTML = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        background-color: #111; 
        color: #fff; 
        font-family: sans-serif;
        text-align: center;">
        <h1>¡Gracias por jugar! Puedes cerrar esta pestaña.</h1>
      </div>
    `;
  }, 200);
});

// --- GRÁFICOS DEL JUEGO ---
const imagenes = {
  nino: new Image(),
  muro: new Image(),
  meta: new Image(),       // Salida Real (2)
  trampa: new Image(),     // Salida Falsa (3)
  fondo: new Image(),
  victoria: new Image(),   // Imagen de celebración
  derrota: new Image()     // Imagen de derrota
};

imagenes.nino.src = 'assets/nino.png';
imagenes.muro.src = 'assets/muro.jpg';
imagenes.meta.src = 'assets/meta.png';
imagenes.trampa.src = 'assets/trampa.png';
imagenes.fondo.src = 'assets/fondo.jpg';
imagenes.victoria.src = 'assets/victoria.png'; 
imagenes.derrota.src = 'assets/derrota.png';

// Redibujar automáticamente al cargar las imágenes
Object.values(imagenes).forEach(img => {
  img.onload = () => {
    if (gameActive) draw();
  };
});

// --- COLECCIÓN DE LABERINTOS DINÁMICOS ---
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

// --- PASO 1: DEL MENÚ A LA INTRODUCCIÓN ---
btnPlay.addEventListener('click', () => {
  menuScreen.classList.add('hidden');
  introScreen.classList.remove('hidden');

  if (audioMenu.paused) {
    audioMenu.play().catch(e => console.log(e));
  }

  audioIntro.currentTime = 0;
  audioIntro.play().catch(e => console.log(e));
});

// --- PASO 2: DE LA INTRODUCCIÓN AL JUEGO ---
btnStartGame.addEventListener('click', () => {
  audioMenu.pause();
  audioMenu.currentTime = 0;

  audioIntro.pause();
  audioIntro.currentTime = 0;

  introScreen.classList.add('hidden');
  
  resizeCanvas();
  seleccionarMapaAleatorio();
  player = { x: 1, y: 1 };
  
  gameActive = true;
  draw();
});

// --- DIBUJO EN CANVAS ---
function draw() {
  if (!grid || grid.length === 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tileWidth = canvas.width / grid[0].length;
  const tileHeight = canvas.height / grid.length;

  // Fondo
  if (imagenes.fondo.complete && imagenes.fondo.naturalWidth !== 0) {
    ctx.drawImage(imagenes.fondo, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Muros y Objetivos
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      let x = c * tileWidth;
      let y = r * tileHeight;

      if (grid[r][c] === 1) {
        if (imagenes.muro.complete && imagenes.muro.naturalWidth !== 0) {
          ctx.drawImage(imagenes.muro, x, y, tileWidth, tileHeight);
        } else {
          ctx.fillStyle = "#555";
          ctx.fillRect(x, y, tileWidth, tileHeight);
        }
      } else if (grid[r][c] === 2) {
        if (imagenes.meta.complete && imagenes.meta.naturalWidth !== 0) {
          ctx.drawImage(imagenes.meta, x, y, tileWidth, tileHeight);
        }
      } else if (grid[r][c] === 3) {
        if (imagenes.trampa.complete && imagenes.trampa.naturalWidth !== 0) {
          ctx.drawImage(imagenes.trampa, x, y, tileWidth, tileHeight);
        }
      }
    }
  }

  // Personaje Niño
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

// --- PANTALLA DE RESULTADOS (VICTORIA / DERROTA) ---
function mostrarResultado(imgResultado) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
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

// --- CONTROLES Y CONDICIONES ---
window.addEventListener('keydown', (e) => {
  if (!gameActive) return;

  let nextX = player.x;
  let nextY = player.y;

  if (e.key === 'ArrowUp') nextY--;
  if (e.key === 'ArrowDown') nextY++;
  if (e.key === 'ArrowLeft') nextX--;
  if (e.key === 'ArrowRight') nextX++;

  if (nextY < 0 || nextY >= grid.length || nextX < 0 || nextX >= grid[0].length) return;

  if (grid[nextY][nextX] !== 1) { 
    player.x = nextX;
    player.y = nextY;
    draw();
    checkTile(grid[nextY][nextX]);
  }
});

function checkTile(tileValue) {
  if (tileValue === 2) {
    gameActive = false;
    audioVictoria.currentTime = 0;
    audioVictoria.play().catch(e => console.log(e));

    mostrarResultado(imagenes.victoria);

    setTimeout(() => { 
      reiniciarJuego(); 
    }, 4000);

  } else if (tileValue === 3) {
    gameActive = false;
    audioDerrota.currentTime = 0;
    audioDerrota.play().catch(e => console.log(e));

    mostrarResultado(imagenes.derrota);

    setTimeout(() => { 
      reiniciarJuego(); 
    }, 4000);
  }
}

function reiniciarJuego() {
  player = { x: 1, y: 1 };
  gameActive = false;
  menuScreen.classList.remove('hidden');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  audioMenu.currentTime = 0;
  audioMenu.play().catch(e => console.log(e));
}