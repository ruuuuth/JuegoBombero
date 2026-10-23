// =====================================================================
//  VOZ: escuchar al jugador, saber si es hombre o mujer y hablar
//
//  1) Reconocer la frase   -> SpeechRecognition (convierte voz en texto)
//  2) Medir el tono (F0)   -> micrófono + AnalyserNode (Web Audio)
//       tono menor a 165 Hz = voz grave = HOMBRE (H)
//       tono de 165 Hz o más = voz aguda = MUJER (M)
//  3) Repetir lo dicho     -> SpeechSynthesis (convierte texto en voz)
// =====================================================================

const TONO_LIMITE = 165;   // Hz: la frontera entre voz grave y voz aguda

let contextoAudio = null;  // el "aparato" de audio del navegador
let analizador = null;     // mide la onda del sonido que entra por el micrófono
let microfono = null;
let tonosMedidos = [];     // aquí se guarda cada medición de tono

// ---------- 1) prender el micrófono ----------
async function empezarAEscuchar() {
  tonosMedidos = [];
  microfono = await navigator.mediaDevices.getUserMedia({ audio: true });   // pide permiso
  contextoAudio = new AudioContext();
  analizador = contextoAudio.createAnalyser();
  analizador.fftSize = 2048;                                                // 2048 muestras por medición
  contextoAudio.createMediaStreamSource(microfono).connect(analizador);
}

// ---------- 2) medir el tono (se llama muchas veces mientras hablas) ----------
// Autocorrelación: la voz es una onda que se repite. Comparamos la onda con
// ella misma corrida un poco; cuando más se parecen, encontramos cada cuánto
// se repite (el "desfase"). Frecuencia = muestras por segundo / desfase.
function medirTono() {
  if (!analizador) return;
  const onda = new Float32Array(analizador.fftSize);
  analizador.getFloatTimeDomainData(onda);

  // si casi no hay sonido (silencio), no medimos
  let energia = 0;
  for (let i = 0; i < onda.length; i++) energia += onda[i] * onda[i];
  if (energia / onda.length < 0.0002) return;

  const muestrasPorSegundo = contextoAudio.sampleRate;
  const desfaseMinimo = Math.floor(muestrasPorSegundo / 400);   // 400 Hz: voz más aguda que buscamos
  const desfaseMaximo = Math.floor(muestrasPorSegundo / 70);    // 70 Hz: voz más grave que buscamos
  let mejorDesfase = 0;
  let mejorParecido = 0;
  for (let desfase = desfaseMinimo; desfase <= desfaseMaximo; desfase++) {
    let parecido = 0;
    for (let i = 0; i + desfase < onda.length; i++) parecido += onda[i] * onda[i + desfase];
    if (parecido > mejorParecido) { mejorParecido = parecido; mejorDesfase = desfase; }
  }
  // solo guardamos la medición si la onda se repite con claridad
  if (mejorDesfase > 0 && mejorParecido > energia * 0.3) {
    tonosMedidos.push(muestrasPorSegundo / mejorDesfase);
  }
}

// ---------- 3) apagar el micrófono y decidir H o M ----------
function terminarDeEscuchar() {
  if (microfono) microfono.getTracks().forEach(pista => pista.stop());
  if (contextoAudio) contextoAudio.close();
  analizador = null;
  if (tonosMedidos.length < 5) return null;   // casi no se escuchó voz

  // usamos la MEDIANA (el valor del medio) para que un error suelto no cambie el resultado
  tonosMedidos.sort((a, b) => a - b);
  const tono = Math.round(tonosMedidos[Math.floor(tonosMedidos.length / 2)]);
  return { tono: tono, genero: tono < TONO_LIMITE ? "H" : "M" };
}

// ---------- reconocer la frase (voz -> texto) ----------
function reconocerFrase(alTerminar) {
  const Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Reconocedor) { alTerminar(""); return; }   // Firefox no lo tiene
  const reconocedor = new Reconocedor();
  reconocedor.lang = CONFIG.idiomaVoz;
  reconocedor.onresult = (evento) => alTerminar(evento.results[0][0].transcript);
  reconocedor.onerror = () => alTerminar("");
  reconocedor.start();
}

// ---------- hablar (texto -> voz) con voz de hombre o de mujer ----------
function hablar(frase, genero) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const mensaje = new SpeechSynthesisUtterance(frase);
  mensaje.lang = CONFIG.idiomaVoz;

  // buscamos una voz en español con nombre de hombre o de mujer (si la compu la tiene)
  const nombres = genero === "H" ? ["pablo", "raul", "jorge", "alvaro", "diego"] : ["helena", "laura", "sabina", "elena", "paulina"];
  const voces = speechSynthesis.getVoices().filter(v => v.lang.startsWith("es"));
  const voz = voces.find(v => nombres.some(n => v.name.toLowerCase().includes(n)));
  if (voz) mensaje.voice = voz;

  // además: tono grave para hombre, agudo para mujer
  mensaje.pitch = genero === "H" ? 0.7 : 1.4;
  speechSynthesis.speak(mensaje);
}
