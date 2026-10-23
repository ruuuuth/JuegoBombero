// =====================================================================
//  ESCENA CARGA: trae las imágenes y sonidos, y arma las animaciones
// =====================================================================
class Carga extends Phaser.Scene {
  constructor() {
    super("Carga");
  }

  preload() {
    const img = "assets/sprites/";
    const son = "assets/sonidos/";

    // --- hojas de sprites: varios dibujos en una tira (para animar) ---
    // se indica el ancho y alto de UN dibujo
    this.load.spritesheet("bombero", img + "bombero.png", { frameWidth: 16, frameHeight: 23 });
    this.load.spritesheet("bombera", img + "bombera.png", { frameWidth: 16, frameHeight: 23 });
    this.load.spritesheet("fuego_s", img + "fuego_s.png", { frameWidth: 8, frameHeight: 10 });
    this.load.spritesheet("fuego_m", img + "fuego_m.png", { frameWidth: 12, frameHeight: 16 });
    this.load.spritesheet("fuego_l", img + "fuego_l.png", { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet("brasa", img + "brasa.png", { frameWidth: 3, frameHeight: 3 });
    this.load.spritesheet("mono", img + "mono.png", { frameWidth: 12, frameHeight: 12 });
    this.load.spritesheet("perezoso", img + "perezoso.png", { frameWidth: 16, frameHeight: 10 });
    this.load.spritesheet("guacamayo", img + "guacamayo.png", { frameWidth: 10, frameHeight: 13 });
    this.load.spritesheet("venado", img + "venado.png", { frameWidth: 16, frameHeight: 13 });
    this.load.spritesheet("comunero", img + "comunero.png", { frameWidth: 12, frameHeight: 18 });
    this.load.spritesheet("comunera", img + "comunera.png", { frameWidth: 12, frameHeight: 18 });
    this.load.spritesheet("nino", img + "nino.png", { frameWidth: 11, frameHeight: 13 });
    this.load.spritesheet("arbol", img + "arbol.png", { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet("suelo", img + "suelo.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("tierra", img + "tierra.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("agua", img + "agua.png", { frameWidth: 16, frameHeight: 16 });

    // --- imágenes de un solo dibujo ---
    const imagenes = ["gota", "madera", "casa", "campamento", "bidon", "botiquin", "tanque", "arbusto", "nube", "humo_nube",
      "fondo_titulo", "fondo_dia_cielo", "fondo_dia_montes", "fondo_dia_selva", "fondo_dia_cerca",
      "fondo_noche_cielo", "fondo_noche_montes", "fondo_noche_selva", "fondo_noche_cerca"];
    for (const nombre of imagenes) {
      this.load.image(nombre, img + nombre + ".png");
    }

    // --- sonidos (carpeta assets/sonidos) ---
    const sonidos = ["musica_titulo", "musica_nivel1", "musica_nivel2", "salto", "chorro", "apagar", "rescate",
      "dano", "recarga", "objeto", "menu", "ganar", "perder", "llamarada"];
    for (const nombre of sonidos) {
      this.load.audio(nombre, son + nombre + ".mp3");
    }
  }

  create() {
    // animaciones que se repiten para siempre (repeat: -1)
    for (const nombre of ["fuego_s", "fuego_m", "fuego_l"]) {
      this.anims.create({ key: nombre, frames: this.anims.generateFrameNumbers(nombre), frameRate: 9, repeat: -1 });
    }
    for (const nombre of ["brasa", "mono", "perezoso", "guacamayo", "venado", "comunero", "comunera", "nino"]) {
      this.anims.create({ key: nombre, frames: this.anims.generateFrameNumbers(nombre), frameRate: 4, repeat: -1 });
    }
    // personaje: dibujo 0 = quieto, 1 y 2 = caminar, 3 = saltar
    for (const nombre of ["bombero", "bombera"]) {
      this.anims.create({ key: nombre + "_quieto", frames: [{ key: nombre, frame: 0 }] });
      this.anims.create({ key: nombre + "_camina", frames: this.anims.generateFrameNumbers(nombre, { frames: [1, 2] }), frameRate: 8, repeat: -1 });
      this.anims.create({ key: nombre + "_salta", frames: [{ key: nombre, frame: 3 }] });
    }

    this.scene.start("Titulo");
  }
}
