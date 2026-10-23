// =====================================================================
//  ESCENA INTRO: el jefe de brigada explica la misión del nivel
// =====================================================================
class Intro extends Phaser.Scene {
  constructor() {
    super("Intro");
  }

  create(datos) {
    const nivel = datos.nivel;
    const N = NIVELES[nivel];
    const fondo = N.noche ? "fondo_noche_cielo" : "fondo_dia_cielo";
    this.add.image(0, 0, fondo).setOrigin(0).setScale(ZOOM);

    panel(this, 40, 30, ANCHO - 80, ALTO - 60);
    texto(this, ANCHO / 2, 50, "NIVEL " + nivel, 20, COLOR.celeste).setOrigin(0.5, 0);
    texto(this, ANCHO / 2, 78, N.nombre, 40, COLOR.amarillo).setOrigin(0.5, 0);
    texto(this, ANCHO / 2, 128, N.lugar, 15).setOrigin(0.5, 0);
    texto(this, 90, 175, "Jefe de brigada:", 20, COLOR.amarillo);
    texto(this, 90, 205, '"' + N.jefe + '"', 15).setWordWrapWidth(780);
    texto(this, 90, 310, "OBJETIVO", 20, COLOR.rojo);
    texto(this, 90, 340, N.objetivo, 15).setWordWrapWidth(780);
    texto(this, ANCHO / 2, 450, "ENTER PARA EMPEZAR", 20, COLOR.amarillo).setOrigin(0.5, 0);

    // ENTER: se abren 3 escenas, una encima de otra:
    //   Fondo (paisaje, atrás) + Juego (el nivel) + Hud (barras, adelante)
    this.input.keyboard.once("keydown-ENTER", () => {
      this.scene.start("Fondo", { nivel: nivel });
      this.scene.launch("Juego", { nivel: nivel });
      this.scene.launch("Hud");
    });
    ponerMusica(this, "musica_titulo");
  }
}
