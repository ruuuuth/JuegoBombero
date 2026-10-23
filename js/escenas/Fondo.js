// =====================================================================
//  ESCENA FONDO: paisaje con efecto PARALLAX (va detrás del nivel)
//  Las capas lejanas se mueven lento y las cercanas rápido,
//  como cuando miras por la ventana de un carro.
// =====================================================================
class Fondo extends Phaser.Scene {
  constructor() {
    super("Fondo");
  }

  create(datos) {
    const hora = NIVELES[datos.nivel].noche ? "noche" : "dia";
    this.add.image(0, 0, "fondo_" + hora + "_cielo").setOrigin(0).setScale(ZOOM);   // el cielo no se mueve

    // tileSprite = imagen que se repite sin fin; al cambiar tilePositionX se desliza
    this.montes = this.add.tileSprite(0, 0, 320, 180, "fondo_" + hora + "_montes").setOrigin(0).setScale(ZOOM);
    this.selva = this.add.tileSprite(0, 0, 320, 180, "fondo_" + hora + "_selva").setOrigin(0).setScale(ZOOM);
    this.cerca = this.add.tileSprite(0, 0, 320, 180, "fondo_" + hora + "_cerca").setOrigin(0).setScale(ZOOM);
  }

  update() {
    const juego = this.scene.get("Juego");
    if (!juego.jugador) return;   // el nivel todavía no está listo
    // ¿cuánto avanzó la cámara del nivel?
    const camaraX = juego.cameras.main.scrollX;
    this.montes.tilePositionX = camaraX * 0.1;    // lejos: lento
    this.selva.tilePositionX = camaraX * 0.3;
    this.cerca.tilePositionX = camaraX * 0.55;    // cerca: rápido
  }
}
