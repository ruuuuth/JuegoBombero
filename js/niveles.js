// =====================================================================
//  NIVELES: cada nivel se dibuja con letras, como en un cuaderno cuadriculado.
//  Cada letra es un bloque de 16x16 píxeles. Así se ve el nivel "a ojo".
//
//    #  suelo                 =  plataforma de madera   ~  agua (recarga)
//    f  fuego                 T  árbol                  *  arbusto
//    m  mono   p  perezoso    g  guacamayo              v  venado
//    o  comunero (espera ayuda)                          C  casa en llamas
//    b  bidón de agua         +  botiquín               t  tanque de agua
//    z  zona segura           M  meta (campamento final) J  inicio del jugador
// =====================================================================
const NIVELES = {
  1: {
    nombre: "LOS PRIMEROS FOCOS",
    lugar: "Amazonas · septiembre de 2024",
    noche: false,
    musica: "musica_nivel1",
    fuegoCrece: 0.35,      // cuánto crece cada fuego por segundo
    seReaviva: false,      // nivel 1: un fuego apagado NO se vuelve a prender
    jefe: "Hay focos activos cerca de las chacras. Apágalos antes de que crezcan y lleva a los animales atrapados al campamento.",
    objetivo: "Apaga TODOS los fueguitos, rescata a los 5 animales y llega a la META.",
    mapa: [
      "                                                                                                                                                                ",
      "                                                                                                                                                                ",
      "                                                                                                                                                                ",
      "                                                                                                                                                                ",
      "                                               f                                                                                                                ",
      "                                            ====                                                      ff                                                        ",
      "          ff        ===          ===    t*f    T                    ff        ===  T T  f           ====                      ===              f                ",
      "        ====    T*ff        m fffT  TT  ########                  ====     ff   T  ########~~~~g    t   fff     ===   Tffv *T               ====                ",
      "  JT T  T T TT##########~~~~####################T*z ff      p   fff+   * ##################~~~~############  Tz      ########~~~~~+T T*fff  T    m      T**M*   ",
      "########################~~~~##########################~~~~~##################################################################~~~~~##############################",
      "######################################################~~~~~#####################################################################################################",
      "################################################################################################################################################################",
    ],
  },
  2: {
    nombre: "SALVAR LA COMUNIDAD",
    lugar: "San Martín · de noche",
    noche: true,
    musica: "musica_nivel2",
    fuegoCrece: 0.5,
    seReaviva: true,       // nivel 2: si no mojas la brasa, el fuego vuelve a prenderse
    jefe: "El fuego llegó a la comunidad. Hay tres casas ardiendo con familias atrapadas. La segunda está en lo alto del cerro: sube por las plataformas.",
    objetivo: "Apaga las 3 casas, lleva a los 7 pobladores a una ZONA SEGURA y llega a la META. Recarga agua en los bidones.",
    mapa: [
      "                                                                                                                                        ",
      "                                                                                                                                        ",
      "                                                                                                                                        ",
      "                                                     b* T C  tfb                                                                        ",
      "                                                  ################                                                                      ",
      "                   f                           ===################ T                                                                    ",
      "                ====                              ##################                    f       ===                                     ",
      "             T T  T f      b TCT T**+T      ===   ##################*                ====    * f * To                                   ",
      "  J     z*  ##########~~~~############  f         ####################   Tz       fT   T*T+T##########Tb *  z t  f* b  TC ** +  TT *M   ",
      "######################~~~~##################################################~~~~########################################################",
      "############################################################################~~~~########################################################",
      "########################################################################################################################################",
    ],
  },
};

const HISTORIA =
  "En septiembre de 2024, incendios forestales afectaron varias regiones del Perú, como Amazonas, San Martín y Ucayali. " +
  "Hubo decenas de focos activos al mismo tiempo y, según la agencia Andina, 15 personas fallecidas y 98 heridas en lo que iba del año.\n\n" +
  "Muchos incendios empiezan por quemas agrícolas que se salen de control; el viento y la sequía los hacen crecer rápido.\n\n" +
  "Bomberos voluntarios, brigadistas y comuneros trabajaron para apagarlos. En el Perú los bomberos son voluntarios: no cobran por su labor.\n\n" +
  "Si ves humo en el bosque, avisa a los bomberos al 116.";

const CONTROLES =
  "FLECHAS: caminar          ARRIBA o ESPACIO: saltar\n\n" +
  "Z (mantener): echar agua.  Con FLECHA ABAJO apuntas al suelo.\n\n" +
  "El agua se acaba: recarga en el RÍO o en los BIDONES azules.\n\n" +
  "Toca a los animales y pobladores para que te sigan y llévalos a una ZONA SEGURA.\n\n" +
  "P: pausa";
