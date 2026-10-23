// =====================================================================
//  UTILIDADES: constantes y funciones que usan todas las escenas
// =====================================================================

const ANCHO = 960;   // ancho del juego en píxeles
const ALTO = 540;    // alto del juego en píxeles
const ZOOM = 3;      // el nivel se dibuja a 320x180 y se agranda 3 veces
const T = 16;        // tamaño de cada bloque del mapa (16x16)

// colores de los textos
const COLOR = {
  blanco: "#f4f4f4", amarillo: "#ffcd75", naranja: "#ef7d57",
  rojo: "#ff8a9c", verde: "#38b764", celeste: "#73eff7", gris: "#94b0c2",
};

// datos de la partida que se comparten entre escenas
const Estado = {
  genero: null,   // "H" (hombre) o "M" (mujer): lo decide la voz
  puntos: 0,
};

// ¿el personaje es bombero o bombera?
function rol() {
  return Estado.genero === "M" ? "bombera" : "bombero";
}

// escribe un texto con la letra pixel
function texto(escena, x, y, contenido, tamano = 20, color = COLOR.blanco) {
  return escena.add.text(x, y, contenido, {
    fontFamily: "GrauPixel",
    fontSize: tamano + "px",
    color: color,
  }).setShadow(2, 2, "#1a1c2c", 0, false, true);
}

// dibuja un tablero de madera (tablas horizontales con clavos en las esquinas)
function panel(escena, x, y, ancho, alto) {
  const g = escena.add.graphics();
  g.fillStyle(0x24140b).fillRect(x, y, ancho, alto);                  // marco oscuro
  for (let fila = y + 6; fila < y + alto - 6; fila += 30) {           // una tabla cada 30 px
    const altoTabla = Math.min(30, y + alto - 6 - fila);
    g.fillStyle(0x6b4226).fillRect(x + 6, fila, ancho - 12, altoTabla);         // madera
    g.fillStyle(0x432817).fillRect(x + 6, fila + altoTabla - 3, ancho - 12, 3); // raya entre tablas
  }
  g.fillStyle(0xb8b8b8);                                              // clavos
  g.fillRect(x + 12, y + 12, 6, 6).fillRect(x + ancho - 18, y + 12, 6, 6);
  g.fillRect(x + 12, y + alto - 18, 6, 6).fillRect(x + ancho - 18, y + alto - 18, 6, 6);
  return g;
}

// música de fondo: si ya está sonando la misma canción, la deja seguir
let musicaActual = null;
function ponerMusica(escena, nombre) {
  if (musicaActual && musicaActual.key === nombre && musicaActual.isPlaying) return;
  escena.sound.stopAll();
  musicaActual = escena.sound.add(nombre, { loop: true, volume: 0.35 });
  musicaActual.play();
}
