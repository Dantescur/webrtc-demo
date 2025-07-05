import type { TutorialSection } from "@/components/WebRTCTutorial.vue";
import { highlightCode } from "@/highlight";
import {
  VideoCamera,
  Connection,
  InfoFilled,
  Warning,
  Document,
  Monitor,
} from "@element-plus/icons-vue";
import { ref, markRaw } from "vue";

export function useStreamerTutorialSections() {
  return ref<TutorialSection[]>([
    {
      title: "Conceptos Fundamentales de WebRTC",
      entries: [
        {
          icon: markRaw(VideoCamera),
          title: "¿Qué es WebRTC?",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué es:</h4>
              <p>WebRTC (Web Real-Time Communication) es una API que permite comunicación en tiempo real entre navegadores o aplicaciones, soportando audio, video y datos sin necesidad de plugins. Utiliza protocolos como RTP para streaming y ICE para establecer conexiones P2P.</p>
              
              <h4 class="font-semibold mt-4">Cómo funciona:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" style="color: #4f8df5">RTCPeerConnection</a></strong>: Gestiona la conexión P2P, incluyendo codecs y negociación.</li>
                <li><strong><a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream" target="_blank" style="color: #4f8df5">MediaStream</a></strong>: Representa flujos de audio/video capturados (e.g., pantalla, cámara).</li>
                <li><strong><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event" target="_blank" style="color: #4f8df5">ICE Candidates</a></strong>: Permiten encontrar rutas de red entre peers, usando servidores STUN/TURN.</li>
              </ul>

              <h4 class="font-semibold mt-4">Ejemplo básico:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
const pc = new RTCPeerConnection();
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));
`)}</code></pre>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>Permisos denegados</strong>: Asegúrate de que el usuario acepte los permisos de cámara/pantalla.</li>
                <li><strong>Compatibilidad</strong>: Verifica soporte en navegadores (Chrome, Firefox, Safari).</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API" target="_blank" class="text-blue-400">MDN: WebRTC API</a></p>
              <p><a href="https://webrtc.github.io/samples/" target="_blank" class="text-blue-400">WebRTC Samples</a></p>
            </div>
          `,
        },
        {
          icon: markRaw(Connection),
          title: "Modelo de Conexión P2P",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué es:</h4>
              <p>WebRTC utiliza un modelo de negociación donde un peer (ofertante) crea una oferta SDP (Session Description Protocol) y el otro (respondedor) genera una respuesta SDP. Ambos intercambian esta información y candidatos ICE para establecer una conexión directa.</p>

              <h4 class="font-semibold mt-4">Pasos del proceso:</h4>
              <ol class="list-decimal ml-4 text-sm">
                <li>El ofertante crea una oferta con <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer" target="_blank" style="color: #4f8df5">createOffer</a>.</li>
                <li>El respondedor procesa la oferta y genera una respuesta con <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer" target="_blank" style="color: #4f8df5">createAnswer</a>.</li>
                <li>Ambos intercambian candidatos ICE usando <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event" target="_blank" style="color: #4f8df5">onicecandidate</a>.</li>
                <li>La conexión se establece cuando <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState" target="_blank" style="color: #4f8df5">iceConnectionState</a> es <a style="color: #4f8df5" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState">connected</a>.</li>
              </ol>

              <h4 class="font-semibold mt-4">Ejemplo de oferta:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
const pc = new RTCPeerConnection();
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
pc.onicecandidate = ({ candidate }) => {
  // Enviar candidato al otro peer
};
`)}</code></pre>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>ICE failure</strong>: Si <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState" target="_blank" style="color: #4f8df5">iceConnectionState</a> es <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState" target="_blank" style="color: #4f8df5" >failed</a>, verifica los servidores STUN/TURN.</li>
                <li><strong>SDP inválido</strong>: Usa <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" style="color: #4f8df5" target="_blank" >JSON.parse</a> para validar el SDP antes de procesarlo.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" class="text-blue-400">MDN: RTCPeerConnection</a></p>
            </div>
          `,
        },
      ],
    },
    {
      title: "Implementación Práctica",
      entries: [
        {
          icon: markRaw(VideoCamera),
          title: "Captura de Pantalla con Audio",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué hace:</h4>
              <p>La API <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" style="color: #4f8df5">getDisplayMedia</a> captura la pantalla o una ventana específica, con opción de incluir audio. Devuelve un <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream" target="_blank" style="color: #4f8df5">MediaStream</a> que puedes añadir a una <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" style="color: #4f8df5">RTCPeerConnection</a>.</p>

              <h4 class="font-semibold mt-4">Cómo implementarlo:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'browser', // Puede ser 'window', 'monitor', etc.
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: true
});
const videoElement = document.querySelector('video');
videoElement.srcObject = stream;
`)}</code></pre>

              <h4 class="font-semibold mt-4">Consejos:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Especifica restricciones (e.g., width, frameRate) para optimizar el rendimiento.</li>
                <li>Usa <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getTracks" target="_blank" style="color: #4f8df5">stream.getTracks()</a> para verificar las pistas activas.</li>
              </ul>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>NotAllowedError</strong>: El usuario canceló la selección de pantalla.</li>
                <li><strong>NotFoundError</strong>: No hay dispositivos de captura disponibles.</li>
                <li><strong>Audio ausente</strong>: Algunos navegadores no soportan audio en <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" style="color: #4f8df5">getDisplayMedia</a>.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" class="text-blue-400">MDN: getDisplayMedia</a></p>
            </div>
          `,
        },
        {
          icon: markRaw(Connection),
          title: "Establecer Conexión P2P",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué hace:</h4>
              <p>La <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" style="color: #4f8df5">RTCPeerConnection</a> gestiona la negociación y transmisión de datos entre peers. Necesitas añadir pistas del <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStream" target="_blank" style="color: #4f8df5">MediaStream</a> y manejar eventos como <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event" target="_blank" style="color: #4f8df5">ontrack</a> y <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event" target="_blank" style="color: #4f8df5">onicecandidate</a>.</p>

              <h4 class="font-semibold mt-4">Cómo implementarlo:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});
stream.getTracks().forEach(track => pc.addTrack(track, stream));
pc.onicecandidate = ({ candidate }) => {
  if (candidate) {
    // Enviar candidato al otro peer (e.g., vía WebSocket)
    console.log('ICE Candidate:', candidate);
  }
};
pc.ontrack = (event) => {
  const remoteVideo = document.querySelector('video');
  remoteVideo.srcObject = event.streams[0];
};
`)}</code></pre>

              <h4 class="font-semibold mt-4">Consejos:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Usa <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceconnectionstatechange_event" target="_blank" style="color: #4f8df5">oniceconnectionstatechange</a> para monitorear el estado de la conexión.</li>
                <li>Valida el SDP antes de usar <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription" target="_blank" style="color: #4f8df5">setRemoteDescription</a>.</li>
              </ul>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>ICE connection failed</strong>: Añade servidores TURN para NATs restrictivos.</li>
                <li><strong>ontrack no dispara</strong>: Asegúrate de que el otro peer haya añadido pistas con <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack" target="_blank" style="color: #4f8df5">addTrack</a>.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" class="text-blue-400">MDN: RTCPeerConnection</a></p>
            </div>
          `,
        },
      ],
    },
    {
      title: "Seguridad y Producción",
      entries: [
        {
          icon: markRaw(Warning),
          title: "Requisitos de Seguridad",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué implica:</h4>
              <p>WebRTC requiere un entorno seguro (HTTPS o localhost) para funcionar, ya que APIs como <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia" target="_blank" style="color: #4f8df5">getUserMedia</a> y <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" style="color: #4f8df5">getDisplayMedia</a> están bloqueadas en sitios HTTP.</p>

              <h4 class="font-semibold mt-4">Cómo garantizarlo:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Despliega tu aplicación en HTTPS usando un certificado SSL (e.g., Let's Encrypt).</li>
                <li>Para pruebas locales, usa localhost o túneles como ngrok.</li>
              </ul>

              <h4 class="font-semibold mt-4">Ejemplo de configuración:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  throw new Error('WebRTC requiere HTTPS o localhost');
}
`)}</code></pre>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>SecurityError</strong>: Intenta acceder a WebRTC en un sitio HTTP.</li>
                <li><strong>CORS en servidores STUN/TURN</strong>: Asegúrate de que los servidores no bloqueen las solicitudes.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts" target="_blank" class="text-blue-400">MDN: Secure Contexts</a></p>
            </div>
          `,
        },
        {
          icon: markRaw(InfoFilled),
          title: "Configuración de Servidores STUN/TURN",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué son:</h4>
              <p>Los servidores <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#stun" target="_blank" style="color: #4f8df5">STUN</a> (Session Traversal Utilities for NAT) ayudan a descubrir direcciones públicas, mientras que los servidores <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#turn" target="_blank" style="color: #4f8df5">TURN</a> (Traversal Using Relays around NAT) actúan como relés para conexiones detrás de NATs restrictivos.</p>

              <h4 class="font-semibold mt-4">Cómo configurarlos:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
});
`)}</code></pre>

              <h4 class="font-semibold mt-4">Consejos:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Usa STUN gratuito (e.g., Google's STUN) para pruebas, pero configura TURN para producción.</li>
                <li>Monitorea <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState" target="_blank" style="color: #4f8df5">iceConnectionState</a> para detectar fallos en la recolección de candidatos.</li>
                <li>Prueba con herramientas como <a href="https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/" target="_blank" class="text-blue-400">Trickle ICE</a>.</li>
              </ul>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>ICE gathering lento</strong>: Añade más servidores STUN/TURN.</li>
                <li><strong>Credenciales inválidas</strong>: Verifica username y credential en TURN.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer" target="_blank" class="text-blue-400">MDN: RTCIceServer</a></p>
            </div>
          `,
        },
      ],
    },
    {
      title: "Debugging y Optimización",
      entries: [
        {
          icon: markRaw(Document),
          title: "Monitoreo de la Conexión",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué implica:</h4>
              <p>WebRTC ofrece herramientas para monitorear y depurar conexiones, como <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats" target="_blank" style="color: #4f8df5">getStats</a> y eventos como <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceconnectionstatechange_event" target="_blank" style="color: #4f8df5">oniceconnectionstatechange</a>.</p>

              <h4 class="font-semibold mt-4">Cómo implementarlo:</h4>
              <pre><code class="hljs language-ts">${highlightCode(`
pc.oniceconnectionstatechange = () => {
  console.log('ICE State:', pc.iceConnectionState);
};
pc.getStats().then(stats => {
  stats.forEach(report => {
    if (report.type === 'transport') {
      console.log('Bytes enviados:', report.bytesSent);
    }
  });
});
`)}</code></pre>

              <h4 class="font-semibold mt-4">Consejos:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Usa <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats" target="_blank" style="color: #4f8df5">getStats</a> para medir latencia, pérdida de paquetes y ancho de banda.</li>
                <li>Registra eventos en la consola para identificar cuellos de botella.</li>
              </ul>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>Estado disconnected</strong>: Puede indicar NATs simétricos; usa TURN.</li>
                <li><strong>Latencia alta</strong>: Reduce la resolución del video o ajusta frameRate.</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport" target="_blank" class="text-blue-400">MDN: RTCStatsReport</a></p>
            </div>
          `,
        },
        {
          icon: markRaw(Monitor),
          title: "Optimización de Recursos",
          description: `
            <div class="tutorial-content">
              <h4 class="font-semibold">Qué implica:</h4>
              <p>WebRTC puede consumir muchos recursos (CPU, ancho de banda). Optimizar la captura y transmisión mejora la experiencia.</p>

              <h4 class="font-semibold mt-4">Cómo optimizar:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li>Usa resoluciones más bajas para <a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" style="color: #4f8df5">getDisplayMedia</a>.</li>
                <li>Limita el frameRate para reducir el uso de CPU.</li>
                <li>Libera recursos al cerrar la conexión:</li>
              </ul>
              <pre><code class="hljs language-ts">${highlightCode(`
stream.getTracks().forEach(track => track.stop());
pc.close();
`)}</code></pre>

              <h4 class="font-semibold mt-4">Problemas comunes:</h4>
              <ul class="list-disc ml-4 text-sm">
                <li><strong>Memory leaks</strong>: Asegúrate de detener las pistas y cerrar <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection" target="_blank" style="color: #4f8df5">RTCPeerConnection</a>.</li>
                <li><strong>Alto uso de CPU</strong>: Reduce la calidad del video o usa códecs más eficientes (e.g., VP9).</li>
              </ul>

              <h4 class="font-semibold mt-4">Referencia:</h4>
              <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop" target="_blank" class="text-blue-400">MDN: MediaStreamTrack.stop</a></p>
            </div>
          `,
        },
      ],
    },
    {
      title: "Buenas Prácticas para Producción",
      entries: [
        {
          icon: markRaw(InfoFilled),
          title: "Arquitectura Escalable",
          description: `
        <div class="tutorial-content">
          <h4 class="font-semibold">Patrones recomendados:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><strong>Servidores SFU</strong>: Usa arquitecturas Selective Forwarding Unit (SFU) como Mediasoup o Janus para reducir carga P2P en grupos grandes</li>
            <li><strong>Balanceo de carga</strong>: Distribuye conexiones entre múltiples servidores TURN/STUN</li>
            <li><strong>WebSockets</strong>: Implementa señalización mediante conexiones persistentes para reducir latencia</li>
          </ul>

          <h4 class="font-semibold mt-4">Ejemplo de arquitectura:</h4>
          <pre><code class="hljs language-ts">${highlightCode(`
// Backend Node.js con Socket.IO
io.on('connection', (socket) => {
  socket.on('webrtc-signal', (data) => {
    socket.broadcast.emit('signal', data);
  });
});

// Frontend
const socket = io('https://tu-servidor.com');
socket.on('signal', (data) => {
  if (data.sdp) pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
  if (data.candidate) pc.addIceCandidate(new RTCIceCandidate(data.candidate));
});
`)}</code></pre>
        </div>
      `,
        },
        {
          icon: markRaw(Warning),
          title: "Monitorización y Logging",
          description: `
        <div class="tutorial-content">
          <h4 class="font-semibold">Métricas clave:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><strong>Calidad de red</strong>: Packet loss, jitter, latencia (usando <code>getStats()</code>)</li>
            <li><strong>Uso de recursos</strong>: CPU, memoria y ancho de banda por conexión</li>
            <li><strong>Tasa de éxito</strong>: Porcentaje de conexiones establecidas correctamente</li>
          </ul>

          <h4 class="font-semibold mt-4">Herramientas recomendadas:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><a href="https://grafana.com/" target="_blank" class="text-blue-400">Grafana</a> para visualización de métricas</li>
            <li><a href="https://prometheus.io/" target="_blank" class="text-blue-400">Prometheus</a> para recolección de datos</li>
            <li><a href="https://www.wireshark.org/" target="_blank" class="text-blue-400">Wireshark</a> para análisis de paquetes</li>
          </ul>

          <h4 class="font-semibold mt-4">Ejemplo de monitorización:</h4>
          <pre><code class="hljs language-ts">${highlightCode(`
setInterval(async () => {
  const stats = await pc.getStats();
  stats.forEach(report => {
    if (report.type === 'outbound-rtp') {
      console.log('Bitrate:', report.bitrate);
      console.log('Packets lost:', report.packetsLost);
    }
  });
}, 5000);
`)}</code></pre>
        </div>
      `,
        },
        {
          icon: markRaw(Connection),
          title: "Optimización Avanzada",
          description: `
        <div class="tutorial-content">
          <h4 class="font-semibold">Técnicas de optimización:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><strong>Adaptive Bitrate</strong>: Ajusta calidad basado en condiciones de red</li>
            <li><strong>Simulcast</strong>: Envía múltiples resoluciones simultáneas</li>
            <li><strong>Codecs</strong>: Prefiere VP9/AV1 sobre H.264 para mejor compresión</li>
          </ul>

          <h4 class="font-semibold mt-4">Configuración recomendada:</h4>
          <pre><code class="hljs language-ts">${highlightCode(`
// Habilitar simulcast
const sender = pc.addTrack(track, stream);
const parameters = sender.getParameters();
parameters.encodings = [
  { scaleResolutionDownBy: 4, maxBitrate: 100000 },
  { scaleResolutionDownBy: 2, maxBitrate: 300000 },
  { scaleResolutionDownBy: 1, maxBitrate: 900000 }
];
sender.setParameters(parameters);

// Forzar codec preferido
pc.setCodecPreferences([
  { mimeType: 'video/VP9', clockRate: 90000 },
  { mimeType: 'video/H264', clockRate: 90000 }
]);
`)}</code></pre>

          <h4 class="font-semibold mt-4">Referencias:</h4>
          <p><a href="https://webrtc.org/experiments/rtp-hdrext/abs-send-time/" target="_blank" class="text-blue-400">WebRTC Optimization Guide</a></p>
          <p><a href="https://bloggeek.me/webrtc-server/" target="_blank" class="text-blue-400">Choosing a WebRTC Server</a></p>
        </div>
      `,
        },
        {
          icon: markRaw(Document),
          title: "Pruebas de Estrés y CI/CD",
          description: `
        <div class="tutorial-content">
          <h4 class="font-semibold">Estrategias de testing:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><strong>Pruebas de carga</strong>: Usa herramientas como <a href="https://github.com/webrtc/testrtc" target="_blank" class="text-blue-400">testRTC</a></li>
            <li><strong>NAT traversal</strong>: Verifica con diferentes configuraciones de firewall</li>
            <li><strong>Automatización</strong>: Integra pruebas WebRTC en tu pipeline CI/CD</li>
          </ul>

          <h4 class="font-semibold mt-4">Ejemplo de configuración CI:</h4>
          <pre><code class="hljs language-yaml">${highlightCode(`
# .github/workflows/webrtc-test.yml
name: WebRTC Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:webrtc
      - uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: webrtc-logs
          path: test-results/
`)}</code></pre>

          <h4 class="font-semibold mt-4">Herramientas útiles:</h4>
          <ul class="list-disc ml-4 text-sm">
            <li><a href="https://github.com/webrtc/samples" target="_blank" class="text-blue-400">WebRTC Samples</a> para casos de prueba</li>
            <li><a href="https://github.com/pion/webrtc" target="_blank" class="text-blue-400">Pion WebRTC</a> para testing en backend</li>
          </ul>
        </div>
      `,
        },
      ],
    },
  ]);
}
