// =====================================================================
//  ESCENA HUD: barras y contadores encima del nivel, y la pausa
//  (va en una escena aparte para que no le afecte el zoom de la cámara)
// =====================================================================
class Hud extends Phaser.Scene {
  constructor() {
    super("Hud");
  }

  create() {
    this.add.rectangle(0, 0, ANCHO, 56, 0x1a1c2c, 0.85).setOrigin(0);   // franja de arriba

    // barras: un rectángulo oscuro de fondo y uno de color encima que se achica
    texto(this, 12, 6, "SALUD", 15, COLOR.rojo);
    this.add.rectangle(12, 30, 150, 12, 0x000000).setOrigin(0);
    this.barraSalud = this.add.rectangle(12, 30, 150, 12, 0xe03c32).setOrigin(0);

    texto(this, 180, 6, "AGUA", 15, COLOR.celeste);
    this.add.rectangle(180, 30, 150, 12, 0x000000).setOrigin(0);
    this.barraAgua = this.add.rectangle(180, 30, 150, 12, 0x41a6f6).setOrigin(0);

    this.textoObjetivo = texto(this, 360, 6, "", 15);
    this.textoRescates = texto(this, 360, 30, "", 15);
    this.textoPuntos = texto(this, ANCHO - 12, 6, "", 20, COLOR.amarillo).setOrigin(1, 0);
    this.textoMensaje = texto(this, ANCHO / 2, 130, "", 25).setOrigin(0.5, 0);
    this.textoAviso = texto(this, ANCHO / 2, 100, "", 15, COLOR.celeste).setOrigin(0.5, 0);
    this.textoPausa = texto(this, ANCHO / 2, 230, "PAUSA\n\nP: continuar", 40, COLOR.amarillo).setOrigin(0.5, 0).setAlign("center").setVisible(false);

    // P: pausar o continuar el nivel
    this.input.keyboard.on("keydown-P", () => {
      if (this.scene.isPaused("Juego")) {
        this.scene.resume("Juego");
        this.textoPausa.setVisible(false);
      } else {
        this.scene.pause("Juego");
        this.textoPausa.setVisible(true);
      }
    });
  }

  update() {
    const juego = this.scene.get("Juego");   // leemos los datos de la escena Juego
    if (!juego.jugador) return;               // el nivel todavía no está listo

    this.barraSalud.scaleX = Math.max(0, juego.salud) / 100;
    this.barraAgua.scaleX = Math.max(0, juego.agua) / 100;

    if (juego.nivel === 1) {
      this.textoObjetivo.setText("APAGADOS " + juego.apagados + "/" + juego.totalFuegos);
    } else {
      this.textoObjetivo.setText("CASAS " + juego.casasApagadas + "/" + juego.totalCasas);
    }
    this.textoRescates.setText("RESCATES " + juego.rescatados + "/" + juego.totalRescates);
    this.textoPuntos.setText("PUNTOS " + Estado.puntos);

    // mensaje grande (dura 2.5 segundos)
    if (juego.time.now < juego.mensajeHasta) {
      this.textoMensaje.setText(juego.mensaje).setColor(juego.colorMensaje);
    } else {
      this.textoMensaje.setText("");
    }
    this.textoAviso.setText(juego.agua < 20 ? "¡AGUA BAJA! Recarga en el río o en un bidón" : "");
  }
}
