// =====================================================================
//  ESCENA IDENTIFICAR: escucha tu voz, dice si eres hombre (H) o mujer (M)
//  y repite lo que dijiste con una voz del mismo género.
//  (las funciones de voz están en js/voz.js)
// =====================================================================
class Identificar extends Phaser.Scene {
  constructor() {
    super("Identificar");
  }

  create() {
    this.add.image(0, 0, "fondo_titulo").setOrigin(0).setScale(ZOOM);
    panel(this, 40, 30, ANCHO - 80, ALTO - 60);
    texto(this, ANCHO / 2, 50, "IDENTIFICACIÓN POR VOZ", 30, COLOR.amarillo).setOrigin(0.5, 0);
    texto(this, 90, 110, "Presiona ESPACIO y di una frase en voz alta (tienes 4 segundos).", 15);

    this.personaje = this.add.sprite(150, 300, "bombero", 0).setScale(6).setVisible(false);
    this.textoEstado = texto(this, 270, 170, "Esperando...", 20, COLOR.celeste);
    this.textoFrase = texto(this, 270, 220, "", 20).setWordWrapWidth(600);
    this.textoResultado = texto(this, 270, 300, "", 25, COLOR.amarillo);
    this.textoTono = texto(this, 270, 340, "", 15, COLOR.gris);
    texto(this, ANCHO / 2, 440, "ESPACIO: hablar    H / M: corregir    ENTER: jugar    ESC: volver", 15, COLOR.gris).setOrigin(0.5, 0);

    this.escuchando = false;
    this.frase = null;
    this.resultado = null;

    this.input.keyboard.on("keydown-SPACE", () => this.empezar());
    this.input.keyboard.on("keydown-H", () => this.ponerGenero("H"));
    this.input.keyboard.on("keydown-M", () => this.ponerGenero("M"));
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("Titulo"));
    this.input.keyboard.on("keydown-ENTER", () => {
      if (Estado.genero) {         // solo se puede jugar si ya sabemos H o M
        Estado.puntos = 0;
        this.scene.start("Intro", { nivel: 1 });
      }
    });
  }

  async empezar() {
    if (this.escuchando) return;
    this.frase = null;
    this.resultado = null;
    this.textoFrase.setText("");
    this.textoResultado.setText("");
    this.textoTono.setText("");
    try {
      await empezarAEscuchar();      // prende el micrófono (voz.js)
    } catch (error) {
      this.textoEstado.setText("No se pudo usar el micrófono. Elige H o M con el teclado.");
      return;
    }
    this.escuchando = true;
    this.textoEstado.setText("Escuchando... ¡habla ahora!");

    // a la vez: reconocer QUÉ dices (texto)
    reconocerFrase((frase) => {
      this.frase = frase;
      this.responder();
    });

    // y después de 4 segundos: decidir si la voz es de hombre o de mujer
    this.time.delayedCall(4000, () => {
      this.escuchando = false;
      this.resultado = terminarDeEscuchar();
      if (this.resultado === null) {
        this.textoEstado.setText("No se escuchó bien. Intenta de nuevo o elige H / M.");
        return;
      }
      this.ponerGenero(this.resultado.genero);
    });
  }

  update() {
    // mientras escucha, mide el tono en cada cuadro (unas 60 veces por segundo)
    if (this.escuchando) medirTono();
  }

  ponerGenero(genero) {
    Estado.genero = genero;
    this.personaje.setTexture(rol(), 0).setVisible(true);
    this.textoEstado.setText("¡Listo! Presiona ENTER para jugar.");
    this.textoResultado.setText(genero === "H" ? "VOZ DE HOMBRE (H)" : "VOZ DE MUJER (M)");
    if (this.resultado) this.textoTono.setText("Tono medido: " + this.resultado.tono + " Hz  (límite " + TONO_LIMITE + " Hz)");
    this.responder();
  }

  // repite la frase con voz del mismo género + saludo
  responder() {
    if (this.frase === null || !Estado.genero) return;   // falta la frase o el género
    this.textoFrase.setText(this.frase ? '"' + this.frase + '"' : "(no se entendió la frase)");
    const saludo = Estado.genero === "H" ? "¡Bienvenido, bombero voluntario!" : "¡Bienvenida, bombera voluntaria!";
    hablar(this.frase + ". " + saludo, Estado.genero);
  }
}
