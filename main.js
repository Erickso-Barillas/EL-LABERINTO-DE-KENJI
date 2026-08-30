const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos de Interfaz
const menuScreen = document.getElementById('menu-screen');
const introScreen = document.getElementById('intro-screen');
const touchControls = document.getElementById('touch-controls');
const btnReturnMenu = document.getElementById('btn-return-menu');

const btnPlay = document.getElementById('btn-play');
const btnExit = document.getElementById('btn-exit');
const btnStartGame = document.getElementById('btn-start-game');

const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

// Control de temporizadores
let timerTransicion = null;

// --- SISTEMA DE VIDAS ---
const MAX_VIDAS = 2;
let vidasActuales = MAX_VIDAS;

// --- RECURSOS DE AUDIO ---
const audioMenu = new Audio('audio/menu_music.mpeg');
audioMenu.loop = true;
audioMenu.volume = 0.4;

const audioJuegoFondo = new Audio('audio/fondo.mp3');
audioJuegoFondo.loop = true;
audioJuegoFondo.volume = 0.3;

const audioIntro = new Audio('audio/introduccion.mpeg');
const audioVictoria = new Audio('audio/victoria.mpeg');
const audioDerrota = new Audio('audio/derrota.mpeg');
const audioExplosion = new Audio('audio/explosion.mp3');
const audioTrampa = new Audio('audio/trampa.mp3');
const audioLaBomba = new Audio('audio/la_bomba.mpeg');

// Audios de espinas
const audioVozEspinas = new Audio('audio/espinas.MPEG');
const audioFinalEspinas = new Audio('audio/final_espinas.mp3');
audioFinalEspinas.volume = 0.3;

function detenerTodosLosAudios() {
  if (timerTransicion) {
    clearTimeout(timerTransicion);
    timerTransicion = null;
  }

  [
    audioMenu, 
    audioJuegoFondo, 
    audioIntro, 
    audioVictoria, 
    audioDerrota, 
    audioExplosion, 
    audioTrampa, 
    audioLaBomba,
    audioVozEspinas,
    audioFinalEspinas
  ].forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

// --- RECURSOS GRÁFICOS ---
const imagenes = {
  nino: new Image(),
  muro: new Image(),
  meta: new Image(),          // 2: Salida Real
  trampa: new Image(),        // 3: Salida Falsa
  bomba: new Image(),         // 4: Mina/Bomba
  espinas: new Image(),       // 5: Espinas
  fondo: new Image(),
  victoria: new Image(),
  derrota: new Image(),
  fondoVictoria: new Image(),
  fondoDerrota: new Image(),
  fondoExplosion: new Image(),
  caiBomba: new Image(),
  caiEspinas: new Image(),    // Imagen de derrota por espinas
  fondoEspinas: new Image()   // Fondo de derrota por espinas
};

// Registrar listeners onload antes de asignar los src para evitar fallos de caché
Object.values(imagenes).forEach(img => {
  img.onload = () => { if (gameActive) draw(); };
});

imagenes.nino.src = 'assets/nino.png';
imagenes.muro.src = 'assets/muro.jpg';
imagenes.meta.src = 'assets/meta.png';
imagenes.trampa.src = 'assets/trampa.png';
imagenes.bomba.src = 'assets/bomba.png';
imagenes.espinas.src = 'assets/espinas.png';
imagenes.fondo.src = 'assets/fondo.jpg';
imagenes.victoria.src = 'assets/victoria.png'; 
imagenes.derrota.src = 'assets/derrota.png';
imagenes.fondoVictoria.src = 'assets/fondo-victoria.jpg';
imagenes.fondoDerrota.src = 'assets/fondo-derrota.jpg';
imagenes.fondoExplosion.src = 'assets/explosion.jpg';
imagenes.caiBomba.src = 'assets/cai_en_la_bomba.png';
imagenes.caiEspinas.src = 'assets/cai_en_espinas.png';
imagenes.fondoEspinas.src = 'assets/fondo_espinas.jpg';

// --- LABERINTOS ---
// --- CODES DE CASILLA: 0: Camino | 1: Muro | 2: Meta | 3: Trampa | 4: Bomba | 5: Espinas ---
const laberintos = [
  // Nivel 1
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1, 0, 0, 0, 4, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 4, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 2
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 4, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 3
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 4, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 4
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 4, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 4, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 5
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 4, 0, 1, 0, 1, 0, 0, 0, 0, 0, 4, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 5, 1, 4, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 6
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 4, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 4, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1, 4, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 7
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 4, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 5, 0, 0, 1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 4, 1, 0, 1, 0, 1, 4, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 8
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 4, 0, 5, 0, 4, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 5, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 1, 0, 0, 0, 4, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 9
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 4, 1, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 4, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 4, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Nivel 10
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1, 0, 5, 0, 1, 4, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 4, 1, 0, 1, 4, 5, 0, 1, 0, 1, 4, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
];

let nivelActual = 0;
let grid = [];
let player = { x: 1, y: 1 };
let gameActive = false;

// --- AJUSTE ALTA RESOLUCIÓN (HIGH DPI) ---
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  if (gameActive) draw();
});

// --- ACCIONES Y ACTIVACIÓN DIRECTA DE MÚSICA ---
btnPlay.addEventListener('click', () => {
  menuScreen.classList.add('hidden');
  introScreen.classList.remove('hidden');

  audioMenu.currentTime = 0;
  audioMenu.play().catch(e => console.log(e));

  audioIntro.currentTime = 0;
  audioIntro.play().catch(e => console.log(e));
});

btnExit.addEventListener('click', () => {
  detenerTodosLosAudios();
  window.close();
  setTimeout(() => {
    document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:#fff;font-family:sans-serif;text-align:center;"><h1>¡Gracias por jugar! Puedes cerrar esta pestaña.</h1></div>`;
  }, 200);
});

btnReturnMenu.addEventListener('click', () => {
  detenerTodosLosAudios();
  reiniciarAJuegoBase();
});

btnStartGame.addEventListener('click', () => {
  nivelActual = 0;
  iniciarNivel(nivelActual);
});

function iniciarNivel(numeroNivel) {
  detenerTodosLosAudios();
  introScreen.classList.add('hidden');
  
  touchControls.classList.remove('hidden');
  btnReturnMenu.classList.remove('hidden');

  grid = JSON.parse(JSON.stringify(laberintos[numeroNivel]));
  player = { x: 1, y: 1 };
  vidasActuales = MAX_VIDAS; // Reinicia vidas al comenzar un nuevo nivel
  
  resizeCanvas();
  gameActive = true;
  draw();

  audioJuegoFondo.play().catch(e => console.log(e));
}

// --- CONTROLES Y MOVIMIENTO ---
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

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === 'ArrowUp') moverJugador('Up');
  if (e.key === 'ArrowDown') moverJugador('Down');
  if (e.key === 'ArrowLeft') moverJugador('Left');
  if (e.key === 'ArrowRight') moverJugador('Right');
});

// Soporte para evitar scroll y gestos en eventos táctiles
const mapeoBotones = [
  { btn: btnUp, dir: 'Up' },
  { btn: btnDown, dir: 'Down' },
  { btn: btnLeft, dir: 'Left' },
  { btn: btnRight, dir: 'Right' }
];

mapeoBotones.forEach(({ btn, dir }) => {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moverJugador(dir);
  });
  btn.addEventListener('click', () => moverJugador(dir));
});

// --- DIBUJO EN CANVAS ---
function draw() {
  if (!grid || grid.length === 0) return;

  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  ctx.clearRect(0, 0, displayWidth, displayHeight);

  const tileWidth = displayWidth / grid[0].length;
  const tileHeight = displayHeight / grid.length;

  if (imagenes.fondo.complete && imagenes.fondo.naturalWidth !== 0) {
    ctx.drawImage(imagenes.fondo, 0, 0, displayWidth, displayHeight);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, displayWidth, displayHeight);
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
      } else if (grid[r][c] === 4 && imagenes.bomba.complete) {
        let bombaWidth = tileWidth * 0.35;
        let bombaHeight = tileHeight * 0.35;
        let bombaX = x + (tileWidth - bombaWidth) / 2;
        let bombaY = y + (tileHeight - bombaHeight) / 2;
        ctx.drawImage(imagenes.bomba, bombaX, bombaY, bombaWidth, bombaHeight);
      } else if (grid[r][c] === 5 && imagenes.espinas.complete) {
        let espinaWidth = tileWidth * 0.45;
        let espinaHeight = tileHeight * 0.45;
        let espinaX = x + (tileWidth - espinaWidth) / 2;
        let espinaY = y + (tileHeight - espinaHeight) / 2;
        ctx.drawImage(imagenes.espinas, espinaX, espinaY, espinaWidth, espinaHeight);
      }
    }
  }

  if (imagenes.nino.complete && imagenes.nino.naturalWidth !== 0) {
    const aspectRatio = imagenes.nino.naturalWidth / imagenes.nino.naturalHeight;
    let targetHeight = tileHeight * 0.8; 
    let targetWidth = targetHeight * aspectRatio;

    if (targetWidth > tileWidth * 0.8) {
      targetWidth = tileWidth * 0.8;
      targetHeight = targetWidth / aspectRatio;
    }

    let xPos = player.x * tileWidth + (tileWidth - targetWidth) / 2;
    let yPos = player.y * tileHeight + (tileHeight - targetHeight) / 2;

    ctx.drawImage(imagenes.nino, xPos, yPos, targetWidth, targetHeight);
  }

  // Dibujar el HUD de vidas en la parte superior izquierda
  dibujarHUDVidas();
}

// Dibuja los 2 corazones en la esquina superior izquierda
function dibujarHUDVidas() {
  const xInicial = 15;
  const yInicial = 15;
  const tamano = 22;
  const espacio = 10;

  for (let i = 0; i < MAX_VIDAS; i++) {
    const x = xInicial + i * (tamano + espacio);
    const color = (i < vidasActuales) ? "#FF2D55" : "#555555";
    dibujarCorazon(ctx, x, yInicial, tamano, color);
  }
}

function dibujarCorazon(ctx, x, y, size, color) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x + size / 2, y + topCurveHeight);
  
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + size, x + size / 2, y + size);
  ctx.bezierCurveTo(x + size / 2, y + size, x + size, y + (size + topCurveHeight) / 2, x + size, y + topCurveHeight);
  ctx.bezierCurveTo(x + size, y, x + size / 2, y, x + size / 2, y + topCurveHeight);
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// --- PROCESAR RESULTADO DE PERDIDA (REINTENTO O GAME OVER) ---
function procesarResultadoDerrota() {
  if (vidasActuales > 0) {
    // Si aún le quedan vidas, reanuda el juego en el mismo nivel tras ver la animación
    timerTransicion = setTimeout(() => {
      player = { x: 1, y: 1 };
      touchControls.classList.remove('hidden');
      btnReturnMenu.classList.remove('hidden');
      gameActive = true;
      draw();
      audioJuegoFondo.play().catch(e => console.log(e));
    }, 2800);
  } else {
    // Si se quedó sin vidas, regresa al menú principal
    timerTransicion = setTimeout(() => {
      reiniciarAJuegoBase();
    }, 3500);
  }
}

// --- EVALUACIÓN DE CASILLAS Y EVENTOS ---
function checkTile(tileValue) {
  if (tileValue === 2) {
    // Victoria
    gameActive = false;
    detenerTodosLosAudios();
    audioVictoria.play().catch(e => console.log(e));

    mostrarPantallaResultado(imagenes.fondoVictoria, imagenes.victoria);

    timerTransicion = setTimeout(() => { 
      nivelActual++;
      if (nivelActual < laberintos.length) {
        iniciarNivel(nivelActual);
      } else {
        reiniciarAJuegoBase();
      }
    }, 4000);

  } else if (tileValue === 3) {
    // Trampa (Salida Falsa) - Muestra siempre la secuencia completa
    gameActive = false;
    vidasActuales--;
    detenerTodosLosAudios();

    audioDerrota.play().catch(e => console.log(e));
    audioTrampa.currentTime = 0;
    audioTrampa.play().catch(e => console.log(e));

    mostrarPantallaResultado(imagenes.fondoDerrota, imagenes.derrota);
    procesarResultadoDerrota();

  } else if (tileValue === 4) {
    // Mina / Bomba - Muestra siempre la secuencia completa
    gameActive = false;
    vidasActuales--;
    detenerTodosLosAudios();

    audioExplosion.play().catch(e => console.log(e));

    ejecutarAnimacionExplosion(() => {
      audioLaBomba.currentTime = 0;
      audioLaBomba.play().catch(e => console.log(e));

      mostrarPantallaResultado(imagenes.fondoExplosion, imagenes.caiBomba);
      procesarResultadoDerrota();
    });

  } else if (tileValue === 5) {
    // Caída en Espinas - Muestra siempre la secuencia completa
    gameActive = false;
    vidasActuales--;
    detenerTodosLosAudios();

    audioFinalEspinas.play().catch(e => console.log(e));
    audioVozEspinas.currentTime = 0;
    audioVozEspinas.play().catch(e => console.log(e));

    mostrarPantallaResultado(imagenes.fondoEspinas, imagenes.caiEspinas);
    procesarResultadoDerrota();
  }
}

function ejecutarAnimacionExplosion(callback) {
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;
  let contador = 0;

  const intervalo = setInterval(() => {
    ctx.fillStyle = contador % 2 === 0 ? "rgba(255, 69, 0, 0.8)" : "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    contador++;

    if (contador >= 6) {
      clearInterval(intervalo);
      callback();
    }
  }, 100);
}

// --- PANTALLA DE RESULTADOS ---
function mostrarPantallaResultado(imgFondo, imgOverlay) {
  touchControls.classList.add('hidden');
  btnReturnMenu.classList.add('hidden');

  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  ctx.clearRect(0, 0, displayWidth, displayHeight);

  if (imgFondo.complete && imgFondo.naturalWidth !== 0) {
    ctx.drawImage(imgFondo, 0, 0, displayWidth, displayHeight);
  }

  if (imgOverlay.complete && imgOverlay.naturalWidth !== 0) {
    const aspectRatio = imgOverlay.naturalWidth / imgOverlay.naturalHeight;
    let targetHeight = displayHeight * 0.65;
    let targetWidth = targetHeight * aspectRatio;

    if (targetWidth > displayWidth * 0.8) {
      targetWidth = displayWidth * 0.8;
      targetHeight = targetWidth / aspectRatio;
    }

    let x = (displayWidth - targetWidth) / 2;
    let y = (imgOverlay === imagenes.caiBomba || imgOverlay === imagenes.caiEspinas) 
      ? (displayHeight - targetHeight) / 3 
      : (displayHeight - targetHeight) / 2;

    ctx.drawImage(imgOverlay, x, y, targetWidth, targetHeight);
  }
}

function reiniciarAJuegoBase() {
  gameActive = false;
  vidasActuales = MAX_VIDAS;
  touchControls.classList.add('hidden');
  btnReturnMenu.classList.add('hidden');
  menuScreen.classList.remove('hidden');

  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  detenerTodosLosAudios();
  audioMenu.play().catch(e => console.log(e));
}