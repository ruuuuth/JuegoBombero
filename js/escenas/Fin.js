// =====================================================================
//  ESCENA FIN: aparece encima del nivel cuando ganas o pierdes
// =====================================================================
class Fin extends Phaser.Scene {
  constructor() {
    super("Fin");
  }

  create(datos) {
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x000000, 0.6).setOrigin(0);   // oscurece el nivel
    panel(this, 130, 90, ANCHO - 260, 360);
    let siguiente;   // a dónde vamos al apretar ENTER

    if (!datos.gano) {
      texto(this, ANCHO / 2, 120, "MISIÓN FALLIDA", 40, COLOR.rojo).setOrigin(0.5, 0);
      texto(this, ANCHO / 2, 200, datos.razon, 20).setOrigin(0.5, 0);
      texto(this, ANCHO / 2, 380, "ENTER: reintentar    ESC: inicio", 20, COLOR.amarillo).setOrigin(0.5, 0);
      siguiente = () => this.irA("Intro", { nivel: datos.nivel });       // se repite el mismo nivel
    } else if (datos.nivel === 1) {
      texto(this, ANCHO / 2, 120, "¡NIVEL COMPLETADO!", 40, COLOR.amarillo).setOrigin(0.5, 0);
      texto(this, ANCHO / 2, 190, "Puntos: " + Estado.puntos, 25).setOrigin(0.5, 0);
      texto(this, 170, 240, "Dato real: en los incendios de 2024 muchos animales perdieron su hogar. Actuar rápido evita que un foco pequeño se vuelva un gran incendio.", 15).setWordWrapWidth(ANCHO - 340);
      texto(this, ANCHO / 2, 380, "ENTER: nivel 2", 20, COLOR.amarillo).setOrigin(0.5, 0);
      siguiente = () => this.irA("Intro", { nivel: 2 });
    } else {
      texto(this, ANCHO / 2, 120, "¡COMUNIDAD A SALVO!", 40, COLOR.amarillo).setOrigin(0.5, 0);
      texto(this, ANCHO / 2, 190, "Puntos finales: " + Estado.puntos, 25).setOrigin(0.5, 0);
      texto(this, 170, 240, "En la vida real, los incendios de 2024 se controlaron gracias a bomberos voluntarios, brigadistas y comuneros.", 15).setWordWrapWidth(ANCHO - 340);
      texto(this, ANCHO / 2, 320, "Si ves humo en el bosque, llama al 116", 20, COLOR.rojo).setOrigin(0.5, 0);
      texto(this, ANCHO / 2, 380, "ENTER: volver al inicio", 20, COLOR.amarillo).setOrigin(0.5, 0);
      siguiente = () => this.irA("Titulo");
    }

    // se espera 1 segundo antes de aceptar teclas (para no saltarse la pantalla sin querer)
    this.time.delayedCall(1000, () => {
      this.input.keyboard.once("keydown-ENTER", siguiente);
      this.input.keyboard.once("keydown-ESC", () => this.irA("Titulo"));
    });
  }

  // cierra el nivel (Juego, Hud y Fondo) y abre otra escena
  irA(escena, datos) {
    this.scene.stop("Juego");
    this.scene.stop("Hud");
    this.scene.stop("Fondo");
    this.scene.start(escena, datos);
  }
}
