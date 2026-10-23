// =====================================================================
//  ESCENA TEXTO: muestra la historia real o los controles
// =====================================================================
class Texto extends Phaser.Scene {
  constructor() {
    super("Texto");
  }

  create(datos) {
    this.add.image(0, 0, "fondo_titulo").setOrigin(0).setScale(ZOOM);
    panel(this, 30, 24, ANCHO - 60, ALTO - 48);
    texto(this, ANCHO / 2, 45, datos.titulo, 30, COLOR.amarillo).setOrigin(0.5, 0);
    texto(this, 70, 100, datos.contenido, 15).setWordWrapWidth(ANCHO - 140);
    texto(this, ANCHO / 2, ALTO - 70, "ENTER: VOLVER", 15, COLOR.gris).setOrigin(0.5, 0);

    this.input.keyboard.once("keydown-ENTER", () => this.scene.start("Titulo"));
  }
}
