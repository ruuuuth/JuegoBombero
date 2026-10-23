// =====================================================================
//  ESCENA JUEGO: el nivel que se juega
//  - lee el mapa de letras (niveles.js) y crea cada cosa en su lugar
//  - el jugador camina, salta y echa agua con la manguera
//  - las gotas apagan fuegos y casas; los animales y pobladores te siguen
// =====================================================================
class Juego extends Phaser.Scene {
  constructor() {
    super("Juego");
  }

  // ==================================================================
  //  CREATE: se ejecuta UNA vez al empezar el nivel
  // ==================================================================
  create(datos) {
    this.nivel = datos.nivel;
    this.N = NIVELES[this.nivel];

    // --- contadores del nivel ---
    this.salud = 100;
    this.agua = 100;
    this.apagados = 0;
    this.rescatados = 0;
    this.totalFuegos = 0;
    this.totalRescates = 0;
    this.totalCasas = 0;
    this.casasApagadas = 0;
    this.direccion = 1;              // 1 = mira a la derecha, -1 = a la izquierda
    this.terminado = false;
    this.recorrido = [];             // por dónde pasó el jugador (para que lo sigan)
    this.personas = [];              // animales y pobladores
    this.mensaje = "";
    this.mensajeHasta = 0;
    this.esperas = {};               // para que un sonido no se repita muy seguido
    this.quemadoHasta = 0;
    this.puntosAlEmpezar = Estado.puntos;

    // --- GRUPOS de física: cada grupo junta objetos del mismo tipo ---
    this.suelo = this.physics.add.staticGroup();        // static = no se mueven nunca
    this.plataformas = this.physics.add.staticGroup();
    this.aguas = this.physics.add.staticGroup();
    this.bidones = this.physics.add.staticGroup();
    this.objetos = this.physics.add.staticGroup();      // botiquines y tanques
    this.zonas = this.physics.add.staticGroup();        // zonas seguras y meta
    this.casas = this.physics.add.staticGroup();
    this.fuegos = this.physics.add.group({ allowGravity: false });   // no caen
    this.brasas = this.physics.add.group({ allowGravity: false });
    this.gotas = this.physics.add.group();                            // estas sí caen

    // --- construir el nivel leyendo el mapa de letras ---
    this.leerMapa();

    // --- el jugador ---
    this.jugador = this.physics.add.sprite(this.inicioX, this.inicioY, rol());
    this.jugador.body.setSize(10, 21).setOffset(3, 2);   // su "caja de choque"
    this.jugador.setCollideWorldBounds(true);            // no se sale del mapa
    this.jugador.setDepth(7);

    // --- noche: un velo oscuro sobre el nivel (el fuego queda encima y brilla) ---
    if (this.N.noche) {
      this.add.rectangle(0, 0, this.anchoMundo, 12 * T, 0x0f081e, 0.35).setOrigin(0).setDepth(6);
    }

    // --- cámara: zoom x3 y sigue al jugador ---
    this.physics.world.setBounds(0, -100, this.anchoMundo, 12 * T + 200);
    this.cameras.main.setBounds(0, 0, this.anchoMundo, 12 * T);
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.startFollow(this.jugador, true);

    // --- CHOQUES (collider: no se atraviesan) ---
    this.physics.add.collider(this.jugador, this.suelo);
    this.physics.add.collider(this.jugador, this.plataformas);
    this.physics.add.collider(this.gotas, this.suelo, (gota) => gota.destroy());

    // --- TOQUES (overlap: se atraviesan, pero avisan cuando se tocan) ---
    this.physics.add.overlap(this.gotas, this.fuegos, this.mojarFuego, null, this);
    this.physics.add.overlap(this.gotas, this.brasas, this.mojarBrasa, null, this);
    this.physics.add.overlap(this.gotas, this.casas, this.mojarCasa, null, this);
    this.physics.add.overlap(this.jugador, this.fuegos, this.quemarse, null, this);
    this.physics.add.overlap(this.jugador, this.aguas, () => this.recargar(1));
    this.physics.add.overlap(this.jugador, this.bidones, () => this.recargar(1));
    this.physics.add.overlap(this.jugador, this.objetos, this.tomarObjeto, null, this);
    this.physics.add.overlap(this.jugador, this.zonas, this.llegarAZona, null, this);

    // --- teclado ---
    this.teclas = this.input.keyboard.createCursorKeys();   // flechas y espacio
    this.teclaZ = this.input.keyboard.addKey("Z");

    // --- efecto de vapor: un emisor de partículas que "explota" al apagar ---
    this.vapor = this.add.particles(0, 0, "gota", {
      speed: { min: 10, max: 40 }, angle: { min: 230, max: 310 }, lifespan: 600,
      alpha: { start: 1, end: 0 }, emitting: false,
    }).setDepth(9);

    // --- sonidos ---
    ponerMusica(this, this.N.musica);
    this.sonidoChorro = this.sound.add("chorro", { loop: true, volume: 0.25 });
    hablar("¡Vamos, " + rol() + "! " + (this.nivel === 1 ? "Hay focos cerca de las chacras." : "El fuego llegó a la comunidad."), Estado.genero);
    this.mostrarMensaje(this.nivel === 1 ? "¡A APAGAR EL FUEGO!" : "¡PROTEGE LA COMUNIDAD!", COLOR.amarillo);
  }

  // ==================================================================
  //  LEER EL MAPA: recorre cada letra y crea lo que corresponde
  // ==================================================================
  leerMapa() {
    const mapa = this.N.mapa;
    this.anchoMundo = mapa[0].length * T;

    for (let fila = 0; fila < mapa.length; fila++) {
      for (let col = 0; col < mapa[fila].length; col++) {
        const letra = mapa[fila][col];
        const x = col * T + 8;             // centro del cuadrito
        const y = fila * T + 8;
        const abajo = (fila + 1) * T;      // borde de abajo del cuadrito (ahí se paran las cosas)
        const arriba = fila > 0 ? mapa[fila - 1][col] : " ";   // la letra de encima

        switch (letra) {
          case "#": { // suelo: con pasto si es la superficie, si no, tierra
            const esSuperficie = arriba !== "#" && arriba !== "~";
            this.suelo.create(x, y, esSuperficie ? "suelo" : "tierra", col % 2).setDepth(3);
            break;
          }
          case "=": { // plataforma: solo choca por arriba (se atraviesa saltando desde abajo)
            const plataforma = this.plataformas.create(col * T, fila * T, "madera").setOrigin(0).refreshBody().setDepth(3);
            plataforma.body.checkCollision.down = false;
            plataforma.body.checkCollision.left = false;
            plataforma.body.checkCollision.right = false;
            break;
          }
          case "~":
            this.aguas.create(x, y, "agua", arriba === "~" ? 1 : 0).setDepth(7).setAlpha(0.85);
            break;
          case "f":
            this.crearFuego(x, abajo, Phaser.Math.Between(2, 8));
            this.totalFuegos++;
            break;
          case "T":
            this.add.image(x, abajo, "arbol", col % 2).setOrigin(0.5, 1).setDepth(1);
            break;
          case "*":
            this.add.image(x, abajo, "arbusto").setOrigin(0.5, 1).setDepth(1);
            break;
          case "m": this.crearPersona("mono", x, abajo, "espera"); break;
          case "p": this.crearPersona("perezoso", x, abajo, "espera"); break;
          case "g": this.crearPersona("guacamayo", x, abajo, "espera"); break;
          case "v": this.crearPersona("venado", x, abajo, "espera"); break;
          case "o": this.crearPersona("comunero", x, abajo, "espera"); break;
          case "C":
            this.crearCasa(x, abajo);
            break;
          case "b":
            this.bidones.create(x, abajo, "bidon").setOrigin(0.5, 1).refreshBody().setDepth(2);
            this.textoChico(x, abajo - 24, "AGUA", COLOR.celeste);
            break;
          case "+":
            this.objetos.create(x, abajo, "botiquin").setOrigin(0.5, 1).refreshBody().setDepth(4);
            break;
          case "t":
            this.objetos.create(x, abajo, "tanque").setOrigin(0.5, 1).refreshBody().setDepth(4);
            break;
          case "z":
          case "M": {
            const zona = this.zonas.create(x, abajo, "campamento").setOrigin(0.5, 1).refreshBody().setDepth(2);
            zona.esMeta = letra === "M";
            this.textoChico(x, abajo - 30, zona.esMeta ? "META" : "ZONA SEGURA", zona.esMeta ? COLOR.amarillo : COLOR.verde);
            break;
          }
          case "J":
            this.inicioX = x;
            this.inicioY = abajo - 12;
            break;
        }
      }
    }
  }

  // ==================================================================
  //  CREAR COSAS
  // ==================================================================
  crearFuego(x, y, vida) {
    const fuego = this.fuegos.create(x, y, "fuego_s").setOrigin(0.5, 1).setDepth(8);
    fuego.vida = vida;            // fuerza del fuego: crece con el tiempo y baja con el agua
    fuego.tamano = "";
    this.actualizarFuego(fuego);
  }

  // elige el dibujo según la fuerza: chico, mediano o grande
  actualizarFuego(fuego) {
    let tamano = "fuego_s";
    if (fuego.vida > 4) tamano = "fuego_m";
    if (fuego.vida > 9) tamano = "fuego_l";
    if (tamano !== fuego.tamano) {
      fuego.tamano = tamano;
      fuego.setTexture(tamano).play(tamano);
      fuego.body.setSize(fuego.width + 8, fuego.height + 6);   // caja un poco más grande: más fácil de mojar
    }
  }

  crearPersona(tipo, x, y, estado) {   // estado: "espera" -> "sigue" -> "salvado"
    const persona = this.add.sprite(x, y, tipo).setOrigin(0.5, 1).setDepth(4).play(tipo);
    persona.estado = estado;
    if (estado === "espera") {
      persona.alerta = this.textoChico(x, y - persona.height - 4, "!", COLOR.rojo);
      this.tweens.add({ targets: persona.alerta, alpha: 0, duration: 300, yoyo: true, repeat: -1 });
      this.totalRescates++;
    }
    this.personas.push(persona);
  }

  crearCasa(x, y) {
    const casa = this.casas.create(x, y, "casa").setOrigin(0.5, 1).refreshBody().setDepth(2);
    casa.fuego = 20;        // cuánta agua necesita para apagarse
    casa.vida = 100;        // si llega a 0, la casa se quema y pierdes
    casa.apagada = false;
    casa.llamas = [
      this.add.sprite(x - 8, y - 4, "fuego_m").setOrigin(0.5, 1).setDepth(8).play("fuego_m"),
      this.add.sprite(x + 7, y - 4, "fuego_m").setOrigin(0.5, 1).setDepth(8).play("fuego_m"),
      this.add.sprite(x, y - 18, "fuego_l").setOrigin(0.5, 1).setDepth(8).play("fuego_l"),
    ];
    casa.barra = this.add.rectangle(x - 15, y - 44, 30, 3, 0x38b764).setOrigin(0, 0.5).setDepth(10);
    casa.auxilio = this.textoChico(x, y - 50, "¡AUXILIO!", COLOR.rojo);
    this.totalCasas++;
    this.totalRescates += 2;   // en cada casa hay 2 personas
  }

  // texto pequeño dentro del nivel (se achica 3 veces porque el nivel tiene zoom x3)
  textoChico(x, y, contenido, color) {
    return texto(this, x, y, contenido, 15, color).setOrigin(0.5, 1).setScale(1 / ZOOM).setDepth(10);
  }

  // ==================================================================
  //  UPDATE: se repite unas 60 veces por segundo
  // ==================================================================
  update(time, delta) {
    if (this.terminado) return;
    const dt = delta / 1000;   // segundos que pasaron desde el cuadro anterior

    this.moverJugador();
    this.manguera();
    this.crecerFuegos(dt);
    this.moverPersonas();
    this.quemarCasas(dt);

    // si ya no se está quemando, quita el color rojo
    if (time > this.quemadoHasta) this.jugador.clearTint();
  }

  moverJugador() {
    const enSuelo = this.jugador.body.blocked.down;   // ¿está pisando algo?

    if (this.teclas.left.isDown) {
      this.jugador.setVelocityX(-80);
      this.direccion = -1;
    } else if (this.teclas.right.isDown) {
      this.jugador.setVelocityX(80);
      this.direccion = 1;
    } else {
      this.jugador.setVelocityX(0);
    }

    // saltar: solo si está en el suelo (JustDown = "recién apretada")
    const salto = Phaser.Input.Keyboard.JustDown(this.teclas.up) || Phaser.Input.Keyboard.JustDown(this.teclas.space);
    if (salto && enSuelo) {
      this.jugador.setVelocityY(-235);   // negativo = hacia arriba; la gravedad lo baja
      this.sound.play("salto", { volume: 0.5 });
    }

    // animación
    this.jugador.setFlipX(this.direccion < 0);
    if (!enSuelo) this.jugador.play(rol() + "_salta", true);
    else if (this.jugador.body.velocity.x !== 0) this.jugador.play(rol() + "_camina", true);
    else this.jugador.play(rol() + "_quieto", true);

    // guardar dónde está (los que te siguen van por el mismo camino)
    this.recorrido.push({ x: this.jugador.x, y: this.jugador.body.bottom });
    if (this.recorrido.length > 300) this.recorrido.shift();
  }

  // ---------- la manguera: crea una gota en cada cuadro mientras aprietas Z ----------
  manguera() {
    const disparando = this.teclaZ.isDown && this.agua > 0;

    if (disparando) {
      const gota = this.gotas.create(this.jugador.x + this.direccion * 8, this.jugador.y + 2, "gota").setDepth(9);
      gota.body.setGravityY(-400);                    // las gotas caen más lento que el jugador
      const rapidez = Phaser.Math.Between(60, 230);   // unas llegan cerca y otras lejos
      const haciaAbajo = this.teclas.down.isDown || Math.random() < 0.25;
      if (haciaAbajo) gota.setVelocity(this.direccion * rapidez * 0.5, 60);
      else gota.setVelocity(this.direccion * rapidez, Phaser.Math.Between(-60, 0));
      this.time.delayedCall(900, () => gota.destroy());   // cada gota dura 0.9 segundos
      this.agua -= 0.2;
    }

    // sonido del chorro: suena mientras disparas
    if (disparando && !this.sonidoChorro.isPlaying) this.sonidoChorro.play();
    if (!disparando && this.sonidoChorro.isPlaying) this.sonidoChorro.stop();
  }

  // ---------- los fuegos crecen si no los apagas ----------
  crecerFuegos(dt) {
    for (const fuego of this.fuegos.getChildren()) {
      fuego.vida = Math.min(12, fuego.vida + this.N.fuegoCrece * dt);
      this.actualizarFuego(fuego);
    }
  }

  // ---------- animales y pobladores ----------
  moverPersonas() {
    let lugarEnFila = 0;
    for (const persona of this.personas) {
      if (persona.estado === "espera") {
        // si el jugador lo toca, empieza a seguirlo
        const distancia = Phaser.Math.Distance.Between(persona.x, persona.y, this.jugador.x, this.jugador.body.bottom);
        if (distancia < 18) {
          persona.estado = "sigue";
          persona.alerta.destroy();
          this.sound.play("objeto");
        }
      } else if (persona.estado === "sigue") {
        // va a donde estuvo el jugador hace un ratito: así se forma una filita
        lugarEnFila++;
        const punto = this.recorrido[Math.max(0, this.recorrido.length - 1 - lugarEnFila * 12)];
        persona.setFlipX(punto.x < persona.x);
        persona.x += (punto.x - persona.x) * 0.2;
        persona.y += (punto.y - persona.y) * 0.2;
      }
    }
  }

  // ---------- casas en llamas: pierden vida poco a poco ----------
  quemarCasas(dt) {
    for (const casa of this.casas.getChildren()) {
      if (casa.apagada) continue;
      casa.vida -= 0.7 * dt;                  // tarda unos 140 segundos en quemarse
      casa.barra.scaleX = casa.vida / 100;    // la barrita se achica
      if (casa.vida <= 0) this.terminar(false, "Una casa se quemó por completo.");
    }
  }

  // ==================================================================
  //  QUÉ PASA CUANDO DOS COSAS SE TOCAN (los overlap de arriba)
  // ==================================================================
  mojarFuego(gota, fuego) {
    if (!gota.active || !fuego.active) return;   // ya no existe: así no se cuenta dos veces
    gota.destroy();
    fuego.vida -= 1;
    if (fuego.vida <= 0) this.apagarFuego(fuego);
  }

  apagarFuego(fuego) {
    this.apagados++;
    Estado.puntos += 100;
    this.vapor.explode(10, fuego.x, fuego.y - 6);
    this.sound.play("apagar", { volume: 0.6 });
    // nivel 2: queda una brasa; si no la mojas en 7 segundos, el fuego vuelve
    if (this.N.seReaviva) this.crearBrasa(fuego.x, fuego.y);
    fuego.destroy();
    if (this.nivel === 1 && this.apagados === this.totalFuegos) {
      this.mostrarMensaje("¡TODOS LOS FUEGOS APAGADOS!", COLOR.verde);
    }
  }

  crearBrasa(x, y) {
    const brasa = this.brasas.create(x, y, "brasa").setOrigin(0.5, 1).setScale(2).setDepth(8).play("brasa");
    this.time.delayedCall(7000, () => {
      if (!brasa.active) return;   // ya la mojaron
      brasa.destroy();
      this.crearFuego(x, y, 4);
      this.sound.play("llamarada");
      this.mostrarMensaje("¡EL FUEGO SE REAVIVÓ!", COLOR.rojo);
    });
  }

  mojarBrasa(gota, brasa) {
    if (!gota.active || !brasa.active) return;
    gota.destroy();
    brasa.destroy();
    this.vapor.explode(4, brasa.x, brasa.y - 2);
  }

  mojarCasa(gota, casa) {
    if (!gota.active || casa.apagada) return;
    gota.destroy();
    casa.fuego -= 1;
    if (casa.fuego <= 0) this.apagarCasa(casa);
  }

  apagarCasa(casa) {
    casa.apagada = true;
    this.casasApagadas++;
    Estado.puntos += 500;
    casa.llamas.forEach(llama => llama.destroy());
    casa.barra.destroy();
    casa.auxilio.setText("A SALVO").setColor(COLOR.verde);
    this.vapor.explode(20, casa.x, casa.y - 20);
    this.sound.play("apagar");
    // salen 2 personas que ya te siguen
    this.crearPersona("comunera", casa.x, casa.y, "sigue");
    this.crearPersona("nino", casa.x + 6, casa.y, "sigue");
    this.mostrarMensaje("¡LLÉVALOS A UNA ZONA SEGURA!", COLOR.celeste);
    hablar("¡Gracias, " + rol() + "! Sácanos de aquí.", "M");
  }

  quemarse() {
    this.salud -= 0.4;
    this.jugador.setTint(0xff6666);                 // se pinta de rojo
    this.quemadoHasta = this.time.now + 100;
    this.sonarCada("dano", 500);
    if (this.salud <= 0) this.terminar(false, "El calor y el humo te vencieron.");
  }

  recargar(cantidad) {
    if (this.agua >= 100) return;
    this.agua = Math.min(100, this.agua + cantidad);
    this.sonarCada("recarga", 400);
  }

  tomarObjeto(jugador, objeto) {
    if (objeto.texture.key === "botiquin") {
      this.salud = Math.min(100, this.salud + 45);
      this.mostrarMensaje("+45 SALUD", COLOR.rojo);
    } else {
      this.agua = 100;
      this.mostrarMensaje("TANQUE LLENO", COLOR.celeste);
    }
    this.sound.play("objeto");
    objeto.destroy();
  }

  llegarAZona(jugador, zona) {
    // todos los que te siguen quedan a salvo
    for (const persona of this.personas) {
      if (persona.estado === "sigue") {
        persona.estado = "salvado";
        this.rescatados++;
        Estado.puntos += 300;
        this.sound.play("rescate");
        this.tweens.add({ targets: persona, alpha: 0, duration: 1500 });   // desaparece suave
      }
    }
    if (zona.esMeta) this.revisarMeta();
  }

  revisarMeta() {
    const faltan = [];
    if (this.nivel === 1 && this.apagados < this.totalFuegos) faltan.push((this.totalFuegos - this.apagados) + " FUEGOS");
    if (this.casasApagadas < this.totalCasas) faltan.push((this.totalCasas - this.casasApagadas) + " CASAS");
    if (this.rescatados < this.totalRescates) faltan.push((this.totalRescates - this.rescatados) + " RESCATES");

    if (faltan.length === 0) this.terminar(true);
    else if (this.time.now > this.mensajeHasta) this.mostrarMensaje("FALTAN: " + faltan.join(" · "), COLOR.rojo);
  }

  // ==================================================================
  //  AYUDAS
  // ==================================================================
  mostrarMensaje(contenido, color) {   // el Hud lo muestra 2.5 segundos
    this.mensaje = contenido;
    this.colorMensaje = color;
    this.mensajeHasta = this.time.now + 2500;
  }

  sonarCada(nombre, milisegundos) {   // evita que un sonido suene 60 veces por segundo
    if (this.time.now < (this.esperas[nombre] || 0)) return;
    this.esperas[nombre] = this.time.now + milisegundos;
    this.sound.play(nombre, { volume: 0.5 });
  }

  // ==================================================================
  //  FIN DEL NIVEL
  // ==================================================================
  terminar(gano, razon) {
    if (this.terminado) return;
    this.terminado = true;
    this.physics.pause();
    this.sound.stopAll();
    this.sound.play(gano ? "ganar" : "perder");

    if (gano) {
      hablar(this.nivel === 1 ? "¡Buen trabajo, " + rol() + "! Los animales están a salvo." : "¡Lo lograste! Salvaste a la comunidad.", Estado.genero);
    } else {
      Estado.puntos = this.puntosAlEmpezar;   // al reintentar vuelves a los puntos con que empezaste
      hablar(razon + " ¡Inténtalo de nuevo!", Estado.genero);
    }
    this.scene.launch("Fin", { nivel: this.nivel, gano: gano, razon: razon });
  }
}
