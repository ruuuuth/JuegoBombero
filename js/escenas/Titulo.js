// =====================================================================
//  ESCENA TÍTULO: pantalla de inicio con el menú y los integrantes
// =====================================================================
class Titulo extends Phaser.Scene {
  constructor() {
    super("Titulo");
  }

  create() {
    this.add.image(0, 0, "fondo_titulo").setOrigin(0).setScale(ZOOM);

    // letrero de madera con el título
    panel(this, 70, 12, 820, 150);
    texto(this, ANCHO / 2, 22, CONFIG.titulo, 60, COLOR.amarillo).setOrigin(0.5, 0);
    texto(this, ANCHO / 2, 92, CONFIG.subtitulo.toUpperCase(), 30, COLOR.naranja).setOrigin(0.5, 0);
    texto(this, ANCHO / 2, 130, "Basado en hechos reales · Incendios forestales del Perú · 2024", 20).setOrigin(0.5, 0);

    // personaje grande caminando
    this.add.sprite(110, 290, "bombero").setScale(9).play("bombero_camina");

    // menú: cada opción tiene un texto y lo que hace al elegirla
    this.opciones = [
      { nombre: "JUGAR", accion: () => this.scene.start("Identificar") },
      { nombre: "HISTORIA REAL", accion: () => this.scene.start("Texto", { titulo: "HISTORIA REAL", contenido: HISTORIA }) },
      { nombre: "CONTROLES", accion: () => this.scene.start("Texto", { titulo: "CONTROLES", contenido: CONTROLES }) },
    ];
    this.textosMenu = [];
    for (let i = 0; i < this.opciones.length; i++) {
      const t = texto(this, ANCHO / 2 + 40, 200 + i * 50, this.opciones[i].nombre, 30).setOrigin(0.5, 0);
      this.textosMenu.push(t);
    }
    this.elegida = 0;
    this.marcarOpcion();

    // integrantes del grupo (vienen de config.js)
    panel(this, 12, 384, ANCHO - 24, 144);
    texto(this, ANCHO / 2, 400, "DESARROLLADO POR", 20, COLOR.amarillo).setOrigin(0.5, 0);
    for (let i = 0; i < CONFIG.integrantes.length; i++) {
      texto(this, ANCHO / 2, 435 + i * 26, CONFIG.integrantes[i], 20).setOrigin(0.5, 0);
    }
    texto(this, ANCHO - 30, 500, String(CONFIG.anio), 15, COLOR.gris).setOrigin(1, 0);

    // teclado: flechas para moverse, ENTER para elegir
    this.input.keyboard.on("keydown-UP", () => this.mover(-1));
    this.input.keyboard.on("keydown-DOWN", () => this.mover(1));
    this.input.keyboard.on("keydown-ENTER", () => this.opciones[this.elegida].accion());

    ponerMusica(this, "musica_titulo");
  }

  mover(direccion) {
    // el % hace que dé la vuelta: después de la última opción vuelve a la primera
    this.elegida = (this.elegida + direccion + this.opciones.length) % this.opciones.length;
    this.marcarOpcion();
    this.sound.play("menu");
  }

  marcarOpcion() {
    for (let i = 0; i < this.textosMenu.length; i++) {
      const elegida = i === this.elegida;
      this.textosMenu[i].setColor(elegida ? COLOR.amarillo : COLOR.blanco);
      this.textosMenu[i].setText(elegida ? "> " + this.opciones[i].nombre + " <" : this.opciones[i].nombre);
    }
  }
}
