import { ref } from "vue";
import { highlightCode } from "@/highlight";

export type WebRTCRole = "streamer" | "viewer";

export function useWebRTCTourSteps(role: WebRTCRole) {
  if (role === "streamer") {
    return ref([
      {
        target: "#start-btn",
        title: "1. Iniciar la transmisión",
        description: `
          <p>Este botón invoca <code>getDisplayMedia()</code>, que abre un diálogo para elegir qué parte de la pantalla compartir.</p>
          <p><a href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia" target="_blank" rel="noopener" style="color:#66b1ff;">Ver documentación en MDN ↗</a></p>
          <pre><code class="hljs language-ts">${highlightCode(`
stream.value = await navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true
})`)}</code></pre>
        `,
      },
      {
        target: "#start-btn",
        title: "¿Qué puede fallar aquí?",
        description: `
          <ul>
            <li>🚫 Si el usuario cancela el diálogo, no se obtiene stream.</li>
            <li>⚠️ Algunos navegadores no permiten compartir audio y pantalla simultáneamente.</li>
            <li>🔒 El sitio debe estar servido desde HTTPS o localhost.</li>
          </ul>
        `,
      },
      {
        target: "video",
        title: "2. Vista previa local",
        description: `
          <p>Una vez aprobado el stream, lo mostramos directamente en un elemento <code>&lt;video&gt;</code>:</p>
          <pre><code class="hljs language-ts">${highlightCode(`
if (localVideo.value) {
  localVideo.value.srcObject = stream.value
}`)}</code></pre>
        `,
      },
      {
        target: "#sdp-section",
        title: "3. Generar la oferta SDP",
        description: `
          <p>La <strong>SDP</strong> (Session Description Protocol) es un bloque de texto que contiene información de la conexión: codecs, puertos, etc.</p>
          <p>Lo generamos con:</p>
          <pre><code class="hljs language-ts">${highlightCode(`
pc = new RTCPeerConnection({ iceServers: [...] })
stream.value.getTracks().forEach(t => pc.addTrack(t, stream.value))
const offer = await pc.createOffer()
await pc.setLocalDescription(offer)`)}
</code></pre>
        `,
      },
      {
        target: "#sdp-section",
        title: "¿Qué contiene la oferta SDP?",
        description: `
          <p>Contiene múltiples líneas como:</p>
          <pre><code class="hljs">${highlightCode(`v=0
o=- 4611736414075311234 2 IN IP4 127.0.0.1
s=-
t=0 0
m=video 9 UDP/TLS/RTP/SAVPF 96`)}</code></pre>
          <p>Estas líneas representan la sesión, medios, transporte, etc.</p>
        `,
      },
      {
        target: "#sdp-section",
        title: "4. Compartir la oferta",
        description: `
          <p>Debes copiar este texto y enviárselo al espectador. Puede hacerse por cualquier medio externo: chat, correo, etc.</p>
          <p><strong>Consejo:</strong> El contenido es sensible. No modificarlo.</p>
        `,
      },
      {
        target: "#sdp-section",
        title: "5. Esperar respuesta",
        description: `
          <p>El espectador debe responder con su SDP. Pégala aquí cuando la tengas.</p>
          <pre><code class="hljs language-ts">${highlightCode(`
await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp))`)}</code></pre>
        `,
      },
      {
        target: "#stop-btn",
        title: "6. Detener la transmisión",
        description: `
          <p>Esto detiene las pistas del stream y cierra la conexión:</p>
          <pre><code class="hljs language-ts">${highlightCode(`
stream.value?.getTracks().forEach(t => t.stop())
pc.close()`)}
</code></pre>
        `,
      },
      {
        target: "#stop-btn",
        title: "¿Qué sucede si no detengo la transmisión?",
        description: `
          <p>Tu navegador seguirá compartiendo hasta que cierres manualmente la pestaña o detengas desde el ícono de pantalla compartida.</p>
        `,
      },
      {
        target: "#help-btn",
        title: "7. Acceder al centro de ayuda",
        description: `
          <p>Haz clic aquí para acceder a una explicación más larga (diálogo expandido).</p>
        `,
      },
    ]);
  }

  // === viewer ===
  return ref([
    {
      target: "#sdp-section",
      title: "1. Pega la oferta recibida",
      description: `
        <p>Pega la oferta que te envió el transmisor. Esto es necesario para crear una respuesta adecuada:</p>
        <pre><code class="hljs language-ts">${highlightCode(`
const { sdp, candidate } = JSON.parse(offer)
await pc.setRemoteDescription(new RTCSessionDescription(sdp))`)}
</code></pre>
      `,
    },
    {
      target: "video",
      title: "2. Vista remota",
      description: `
        <p>Cuando la conexión esté establecida, verás aquí la pantalla remota.</p>
        <pre><code class="hljs language-ts">${highlightCode(`
pc.ontrack = (event) => {
  remoteVideo.value.srcObject = event.streams[0]
}`)}</code></pre>
      `,
    },
    {
      target: "#sdp-section",
      title: "3. Generar y enviar respuesta SDP",
      description: `
        <p>Ahora generas tu propia respuesta:</p>
        <pre><code class="hljs language-ts">${highlightCode(`
const answer = await pc.createAnswer()
await pc.setLocalDescription(answer)
answerSdp.value = JSON.stringify({ sdp: answer, candidate })`)}
</code></pre>
        <p>Debes enviársela al transmisor.</p>
      `,
    },
    {
      target: "#help-btn",
      title: "4. Ayuda y documentación",
      description: `
        <p>Accede nuevamente a este recorrido o consulta más recursos en el <strong>Centro de ayuda WebRTC</strong>.</p>
      `,
    },
  ]);
}
