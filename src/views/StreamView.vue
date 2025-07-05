<template>
  <BasePeerView
    title="Compartir Pantalla"
    description="Transmite tu pantalla o ventana a otro participante mediante conexión directa P2P"
    video-title="Vista Previa"
    help-tooltip="Más información sobre cómo compartir pantalla"
    :error="error"
    :success="success"
  >
    <!-- Slot de Controles -->
    <template #controls>
      <el-button
        id="start-btn"
        type="primary"
        size="large"
        :icon="VideoCamera"
        :loading="isLoading"
        :disabled="isStreaming"
        @click="startStreaming"
        class="w-full sm:w-auto"
      >
        Iniciar Transmisión
      </el-button>
      <el-button
        id="stop-btn"
        type="danger"
        size="large"
        :icon="SwitchButton"
        :disabled="!isStreaming"
        @click="stopStreaming"
        class="w-full sm:w-auto"
      >
        Detener Transmisión
      </el-button>

      <el-button type="info" plain @click="showTour = true">
        ¿Cómo funciona?
      </el-button>
    </template>

    <!-- Slot de tag de estado -->
    <template #statusTag>
      <Transition name="fade" mode="out-in">
        <el-tag
          v-if="isStreaming"
          key="streaming"
          type="success"
          effect="dark"
          class="ml-auto"
        >
          <el-icon class="mr-1">
            <CircleCheck />
          </el-icon>
          Transmitiendo
        </el-tag>
        <el-tag v-else key="inactive" type="info" effect="dark" class="ml-auto">
          <el-icon class="mr-1">
            <VideoPause />
          </el-icon>
          Inactivo
        </el-tag>
      </Transition>
    </template>

    <!-- Slot de contenido de video -->
    <template #videoContent>
      <Transition name="fade" mode="out-in">
        <div :key="isStreaming ? 'video' : 'placeholder'">
          <video
            v-if="isStreaming"
            ref="localVideo"
            autoplay
            muted
            playsinline
            class="w-full h-full object-contain"
          />
          <div
            v-else
            class="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
          >
            <el-icon :size="48" class="mb-2">
              <Monitor />
            </el-icon>
            <p class="text-base">Vista previa no disponible</p>
          </div>
        </div>
      </Transition>
    </template>

    <!-- Slot de contenido de conexion -->
    <template #connectionContent>
      <sdp-exchange
        id="sdp-section"
        :sdp-data="offerSdp"
        :loading="isLoading"
        submit-text="Procesar Respuesta"
        @submit="handleRemoteAnswer"
        class="mt-4"
      />
    </template>
  </BasePeerView>

  <el-tour v-model="showTour" type="default">
    <el-tour-step
      v-for="(step, index) in tourSteps"
      :key="index"
      :target="step.target"
      :title="step.title"
    >
      <template #default>
        <div v-html="step.description" />
      </template>
    </el-tour-step>
  </el-tour>
  <WebRTCLogPanel />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import WebRTCLogPanel from "@/components/WebRTCLogPanel.vue";
import {
  VideoCamera,
  SwitchButton,
  CircleCheck,
  VideoPause,
  Monitor,
} from "@element-plus/icons-vue";
import SdpExchange from "@/components/SdpExchange.vue";
import BasePeerView from "@/components/BasePeerView.vue";
import { useWebRTCTourSteps } from "@/composables/useWebRTCTourSteps";
import { iceServers } from "@/iceServers";
import { useAlert } from "@/composables/useAlert";
import { useWebRTCLogger } from "@/composables/useWebRTCLogger";

const { error, showAlert, success } = useAlert();
const { debug, info, warn, error: logError } = useWebRTCLogger();

// Referencias del template
const localVideo = ref<HTMLVideoElement>();

// Estado de la conexión
const pc = ref<RTCPeerConnection>();
const offerSdp = ref("");
const isStreaming = ref(false);
const isLoading = ref(false);
const stream = ref<MediaStream | null>(null);

const showTour = ref(false);
const tourSteps = useWebRTCTourSteps("streamer");

const startStreaming = async () => {
  isLoading.value = true;
  info("Iniciando transmisión de pantalla...");

  try {
    debug("Solicitando acceso a la pantalla...");
    stream.value = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audio: true,
    });
    info("Acceso a pantalla concedido", {
      tracks: stream.value.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
      })),
    });

    if (localVideo.value) {
      localVideo.value.srcObject = stream.value;
      debug("Vista previa configurada");
    }

    isStreaming.value = true;
    showAlert("success", "¡Transmisión iniciada correctamente!");
    info("Transmisión iniciada");

    debug("Configurando RTCPeerConnection...");
    pc.value = new RTCPeerConnection(iceServers);

    // Añadir logs para eventos de ICE
    pc.value.onicecandidate = (event) => {
      if (event.candidate) {
        debug("Nuevo candidato ICE generado", {
          candidate: event.candidate.candidate,
          component: event.candidate.component,
        });
      } else {
        info("Proceso de generación de candidatos ICE completado");
      }

      if (event.candidate && pc.value?.localDescription) {
        offerSdp.value = JSON.stringify({
          sdp: pc.value.localDescription,
          candidate: event.candidate,
        });
      }
    };

    // Log para eventos de conexión
    pc.value.onconnectionstatechange = () => {
      const state = pc.value?.connectionState;
      info(`Estado de conexión cambiado: ${state}`);

      if (state === "failed") {
        logError("Conexión fallida");
      }
    };

    // Añadir pistas
    stream.value.getTracks().forEach((track) => {
      pc.value?.addTrack(track, stream.value!);
      debug(`Pista ${track.kind} añadida a RTCPeerConnection`);
    });

    // Manejar fin de transmisión
    const videoTrack = stream.value.getVideoTracks()[0];
    videoTrack.onended = () => {
      info("Usuario detuvo la compartición de pantalla");
      stopStreaming();
      showAlert("success", "Has detenido la compartición de pantalla");
    };

    // Crear oferta
    debug("Creando oferta SDP...");
    const offer = await pc.value.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });

    await pc.value.setLocalDescription(offer);
    info("Oferta SDP creada y descripción local establecida", {
      type: offer.type,
      sdp: offer.sdp?.substring(0, 50) + "...",
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    logError("Error al iniciar transmisión", {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });

    showAlert("error", errorMessage);
    stopStreaming();
  } finally {
    isLoading.value = false;
  }
};

const stopStreaming = () => {
  if (isStreaming.value === false) {
    debug("Intento de detener transmisión ya detenida");
    return;
  }

  info("Deteniendo transmisión...");

  try {
    // Detener pistas
    if (stream.value) {
      const tracks = stream.value.getTracks();
      debug(`Deteniendo ${tracks.length} pistas multimedia`);

      tracks.forEach((track) => {
        try {
          track.stop();
          debug(`Pista ${track.kind} detenida`);
        } catch (err) {
          warn(`Error al detener pista ${track.kind}`, err);
        }
      });
      stream.value = null;
    }

    // Limpiar video
    if (localVideo.value) {
      localVideo.value.srcObject = null;
      debug("Elemento de video limpiado");
    }

    // Cerrar conexión
    if (pc.value) {
      try {
        const connectionState = pc.value.connectionState;
        if (pc.value.signalingState !== "closed") {
          debug(
            `Cerrando RTCPeerConnection (estado actual: ${connectionState})`,
          );
          pc.value.close();
          info("RTCPeerConnection cerrada correctamente");
        } else {
          debug("RTCPeerConnection ya estaba cerrada");
        }
      } catch (err) {
        logError("Error al cerrar RTCPeerConnection", err);
      } finally {
        pc.value = undefined;
      }
    }

    offerSdp.value = "";
    isStreaming.value = false;
    info("Transmisión detenida completamente");
  } catch (err) {
    logError("Error crítico al detener transmisión", err);
    showAlert("error", "Ocurrió un error al detener la transmisión");
  }
};

const handleRemoteAnswer = async (answer: string) => {
  if (!pc.value) {
    logError("Intento de procesar respuesta sin conexión activa");
    showAlert("error", "Primero debes iniciar la transmisión");
    return;
  }

  try {
    debug("Procesando respuesta remota...");
    const { sdp } = JSON.parse(answer);

    info("Estableciendo descripción remota", {
      type: sdp.type,
      sdp: sdp.sdp.substring(0, 50) + "...",
    });

    await pc.value.setRemoteDescription(new RTCSessionDescription(sdp));
    showAlert("success", "¡Conexión establecida con el espectador!");
    info("Conexión WebRTC establecida correctamente");
  } catch (err) {
    const errorMessage = "Formato de respuesta inválido";
    logError(errorMessage, {
      error: err instanceof Error ? err.message : err,
      answer: answer.length > 100 ? answer.substring(0, 100) + "..." : answer,
    });

    showAlert("error", errorMessage);
  }
};

watch(isStreaming, (newVal) => {
  info(`Estado de transmisión cambiado a: ${newVal ? "ACTIVO" : "INACTIVO"}`);
});

// Watcher para oferta SDP
watch(offerSdp, (newVal) => {
  if (newVal) {
    debug("Oferta SDP actualizada", {
      length: newVal.length,
      preview: newVal.substring(0, 50) + "...",
    });
  }
});

onMounted(() => {
  window.addEventListener("unhandledrejection", (event) => {
    logError("Error no capturado (unhandled rejection)", {
      reason: event.reason,
      promise: event.promise,
    });
  });

  window.addEventListener("error", (event) => {
    logError("Error global capturado", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
