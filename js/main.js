// =====================================================================
//  MAIN: crea el juego de Phaser con todas sus escenas
//  Orden: Carga -> Titulo -> Identificar -> Intro -> (Fondo + Juego + Hud) -> Fin
// =====================================================================
const configuracion = {
  type: Phaser.AUTO,           // dibuja con WebGL (tarjeta gráfica) o, si no hay, con Canvas
  parent: "juego",             // dentro del <div id="juego"> del index.html
  width: ANCHO,
  height: ALTO,
  backgroundColor: "#1a1c2c",
  pixelArt: true,              // sin borrosidad: el pixel art se ve nítido
  scale: {
    mode: Phaser.Scale.FIT,               // se agranda hasta llenar la ventana sin deformarse
    autoCenter: Phaser.Scale.CENTER_BOTH, // centrado
  },
  physics: {
    default: "arcade",                    // física simple: cajas que chocan
    arcade: { gravity: { y: 640 } },      // gravedad hacia abajo
  },
  scene: [Carga, Titulo, Identificar, Texto, Intro, Fondo, Juego, Hud, Fin],
};

// esperamos a que cargue la letra pixel y recién creamos el juego
document.fonts.load("10px GrauPixel").then(() => {
  window.juego = new Phaser.Game(configuracion);   // window.juego: así se puede revisar desde la consola (F12)
});
