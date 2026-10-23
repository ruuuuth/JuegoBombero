# Bombero Voluntario: Fuego en la Selva (versión simple)

Videojuego web hecho con **JavaScript + Phaser 3**, basado en los incendios forestales del Perú (septiembre de 2024).
El juego escucha tu voz, identifica si es de **hombre (H)** o de **mujer (M)** y repite lo que dijiste con una voz del mismo género.

## Cómo abrirlo
1. Abre la carpeta en Visual Studio Code.
2. Clic derecho en `index.html` → **Open with Live Server**.
3. Usa **Google Chrome o Edge** (el reconocimiento de voz funciona ahí) y permite el micrófono.

Si abres `index.html` con doble clic, no cargan las imágenes ni los sonidos. Hay que usar Live Server.

## Carpetas
```
index.html            la página: carga Phaser y nuestros archivos en orden
css/estilo.css        la letra pixel y el juego a pantalla completa
fonts/                la letra GrauPixel
js/lib/phaser.min.js  la librería Phaser (no se edita)
js/config.js          título e integrantes  ← EDITA AQUÍ SUS NOMBRES
js/voz.js             escuchar, medir el tono (H/M) y hablar
js/utilidades.js      constantes, Estado, texto(), panel(), ponerMusica()
js/niveles.js         los 2 niveles dibujados con letras
js/escenas/           una escena por archivo:
   Carga.js             carga imágenes y sonidos, crea animaciones
   Titulo.js            pantalla de inicio
   Identificar.js       identificación por voz
   Texto.js             historia real y controles
   Intro.js             misión del nivel
   Fondo.js             fondo con parallax
   Juego.js             el nivel
   Hud.js               barras, contadores y pausa
   Fin.js               ganaste / perdiste
js/main.js            crea el juego
assets/sprites/       imágenes PNG que usa el juego
assets/sonidos/       música y efectos en MP3 (puedes cambiarlos por otros con el mismo nombre)
assets/pyxel/         archivos .pyxel para editar en Pyxel Edit
assets/jpg/, assets/png_x8/, assets/hoja_de_sprites.*   imágenes para la entrega
capturas/             capturas de pantalla
```

## Orden de las escenas
`Carga → Titulo → Identificar → Intro → (Fondo + Juego + Hud) → Fin`

## Cómo se arma un nivel
En `js/niveles.js` cada nivel es un dibujo hecho con letras. Cada letra es un bloque de 16×16 píxeles:

| Letra | Qué es | Letra | Qué es |
|---|---|---|---|
| `#` | suelo | `=` | plataforma de madera |
| `~` | agua (recarga) | `f` | fuego |
| `T` | árbol | `*` | arbusto |
| `m` `p` `g` `v` | mono, perezoso, guacamayo, venado | `o` | comunero |
| `C` | casa en llamas (con 2 personas) | `b` | bidón de agua |
| `+` | botiquín | `t` | tanque de agua |
| `z` | zona segura | `M` | meta |
| `J` | inicio del jugador | | |

`Juego.js` recorre las letras una por una (función `leerMapa`) y crea cada cosa en su lugar.
Para mover un fuego, solo cambia la `f` de lugar.

## Cómo funciona la voz (js/voz.js)
1. **SpeechRecognition** convierte lo que dices en texto.
2. El micrófono y un **AnalyserNode** miden el tono de la voz (F0) con autocorrelación.
3. Si el tono es **menor a 165 Hz → H**; si es **165 Hz o más → M**.
4. **SpeechSynthesis** repite tu frase con voz de hombre o de mujer, y el personaje es bombero o bombera.

## Niveles
- **Nivel 1 (día):** apaga los 30 fuegos (no se vuelven a prender), rescata 5 animales y llega a la META.
- **Nivel 2 (noche):** apaga 3 casas (una está arriba del cerro) y lleva a los 7 pobladores a una zona segura. Si no mojas la brasa que queda, el fuego se vuelve a prender.

## Controles
Flechas: caminar · Arriba o Espacio: saltar · Z: echar agua (con Abajo apuntas al suelo) · P: pausa
