<template>
  <BasePeerView
    title="Ver Transmisión en Directo"
    description="Conéctate a una transmisión P2P usando los datos de conexión compartidos"
    video-title="Transmisión Remota"
    help-tooltip="Más información sobre cómo ver transmisiones"
    :error="error"
    :success="success"
  >
    <template #controls>
      <el-button type="info" plain @click="showTour = true">
        ¿Cómo funciona?
      </el-button>
    </template>

    <!-- Status Tag Slot -->
    <template #statusTag>
      <Transition name="fade" mode="out-in">
        <el-tag v-if="isConnected" type="success" effect="dark" class="ml-auto">
          <el-icon class="mr-1">
            <CircleCheck />
          </el-icon>
          <span class="hidden sm:inline">Conectado</span>
          <span class="sm:hidden">OK</span>
        </el-tag>
        <el-tag v-else type="info" effect="dark" class="ml-auto">
          <el-icon class="mr-1">
            <Clock />
          </el-icon>
          <span class="hidden sm:inline">Esperando conexión</span>
          <span class="sm:hidden">Esperando</span>
        </el-tag>
      </Transition>
    </template>

    <!-- Video Content Slot -->
    <template #videoContent>
      <video
        ref="remoteVideo"
        autoplay
        playsinline
        class="w-full h-full object-contain"
      />
      <div
        v-if="!isConnected"
        class="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
      >
        <el-icon :size="40" class="md:size-16 mb-2 md:mb-4">
          <Monitor />
        </el-icon>
        <p class="text-sm md:text-lg">Esperando transmisión...</p>
      </div>
    </template>

    <!-- Connection Content Slot -->
    <template #connectionContent>
      <sdp-exchange
        id="sdp-section"
        :sdp-data="answerSdp"
        :loading="isLoading"
        @submit="handleRemoteOffer"
        class="mt-3 md:mt-4"
      />
    </template>
  </BasePeerView>

  <el-tour v-model="showTour" type="default">
    <el-tour-step
      v-for="(step, index) in tourSteps"
      :key="index"
      :target="step.target"
      :title="step.title"
      placement="top-start"
    >
      <template #default>
        <div v-html="step.description" />
      </template>
    </el-tour-step>
  </el-tour>
  <WebRTCLogPanel />
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import WebRTCLogPanel from "@/components/WebRTCLogPanel.vue";
import { CircleCheck, Monitor, Clock } from "@element-plus/icons-vue";
import SdpExchange from "@/components/SdpExchange.vue";
import BasePeerView from "@/components/BasePeerView.vue";
import { useWebRTCTourSteps } from "@/composables/useWebRTCTourSteps";
import { iceServers } from "@/iceServers";
import { useAlert } from "@/composables/useAlert";
import { useWebRTCLogger } from "@/composables/useWebRTCLogger";

const { error, success, showAlert } = useAlert();
const { debug, info, warn, error: logError } = useWebRTCLogger();

// Referencias del template
const remoteVideo = ref<HTMLVideoElement>();

// Estado de la conexión
const pc = ref<RTCPeerConnection | null>(null);
const answerSdp = ref("");
const isConnected = ref(false);
const isLoading = ref(false);
const showTour = ref(false);
const tourSteps = useWebRTCTourSteps("viewer");

// Manejador de oferta SDP
const handleRemoteOffer = async (offer: string) => {
  info("Iniciando manejo de oferta remota...");
  isLoading.value = true;

  // Limpiar conexión previa si existe
  if (pc.value) {
    debug("Cerrando conexión previa");
    pc.value.close();
    pc.value = null;
  }

  try {
    debug("Creando nueva conexión RTCPeerConnection...");
    pc.value = new RTCPeerConnection(iceServers);
    info("Conexión creada", { iceServers });

    const { sdp, candidate } = JSON.parse(offer);
    debug("Oferta parseada", {
      type: sdp.type,
      sdp: sdp.sdp?.substring(0, 50) + "...",
      candidate,
    });

    debug("Estableciendo descripción remota...");
    await pc.value.setRemoteDescription(new RTCSessionDescription(sdp));
    info("Descripción remota establecida");

    debug("Creando respuesta SDP...");
    const answer = await pc.value.createAnswer();
    debug("Respuesta creada", {
      type: answer.type,
      sdp: answer.sdp?.substring(0, 50) + "...",
    });

    debug("Estableciendo descripción local...");
    await pc.value.setLocalDescription(answer);
    info("Descripción local establecida");

    answerSdp.value = JSON.stringify({ sdp: answer, candidate });
    info("Respuesta SDP generada", {
      sdp: answerSdp.value.substring(0, 50) + "...",
    });

    if (candidate) {
      debug("Agregando candidato ICE...");
      await pc.value.addIceCandidate(new RTCIceCandidate(candidate));
      info("Candidato ICE agregado", { candidate: candidate.candidate });
    }

    showAlert("success", "Oferta procesada correctamente");
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Error desconocido al procesar la oferta SDP";
    logError("Error al procesar oferta remota", {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      offer: offer.length > 100 ? offer.substring(0, 100) + "..." : offer,
    });
    showAlert(
      "error",
      "Error al procesar la oferta SDP. Verifica que los datos sean correctos.",
    );
  } finally {
    isLoading.value = false;
    info("Finalizando manejo de oferta remota");
  }
};

// Watcher para cambios en el estado de conexión
watchEffect(() => {
  if (pc.value) {
    debug("Configurando manejadores de eventos para RTCPeerConnection");
    pc.value.oniceconnectionstatechange = () => {
      const iceState = pc.value?.iceConnectionState;
      info(`Estado ICE cambiado: ${iceState}`);

      isConnected.value = iceState === "connected" || iceState === "completed";

      if (iceState === "disconnected" || iceState === "failed") {
        warn("Conexión perdida", { iceState });
        if (remoteVideo.value) {
          remoteVideo.value.srcObject = null;
          debug("Elemento de video limpiado debido a conexión perdida");
        }
        showAlert("error", "Conexión perdida. Intenta reconectarte.");
      }
    };

    pc.value.onconnectionstatechange = () => {
      const connState = pc.value?.connectionState;
      info(`Estado de conexión cambiado: ${connState}`);

      if (connState === "failed") {
        logError("Conexión fallida", { connectionState: connState });
        showAlert("error", "Conexión fallida. Intenta reconectarte.");
      }
    };

    pc.value.onicecandidate = (event) => {
      if (event.candidate) {
        debug("Nuevo candidato ICE generado", {
          candidate: event.candidate.candidate,
          component: event.candidate.component,
        });
      } else {
        info("Proceso de generación de candidatos ICE completado");
      }
    };

    pc.value.ontrack = (event) => {
      if (remoteVideo.value && event.streams.length) {
        debug("Evento ontrack recibido", {
          streams: event.streams.length,
          tracks: event.streams[0].getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
          })),
        });
        remoteVideo.value.srcObject = event.streams[0];
        isConnected.value = true;
        info("Stream remoto asignado al elemento de video");
        showAlert("success", "¡Conexión establecida correctamente!");
      }
    };
  }
});

// Watcher para cambios en el stream remoto
watch(remoteVideo, (newVal) => {
  debug("Referencia de video cambiada", { videoElement: newVal });
  if (newVal && pc.value) {
    const receivers = pc.value.getReceivers();
    debug("Verificando receivers activos", {
      receivers: receivers.map((r) => ({
        kind: r.track?.kind,
        readyState: r.track?.readyState,
      })),
    });

    const streams = receivers.map((r) => {
      const state = r.track?.readyState;
      debug(`Estado de pista del receiver: ${state}`, { kind: r.track?.kind });
      return state === "live";
    });

    if (streams.some(Boolean)) {
      info("Streams activos detectados, marcando como conectado");
      isConnected.value = true;
    }
  }
});

// Watcher para isConnected
watch(isConnected, (newVal) => {
  info(
    `Estado de conexión cambiado a: ${newVal ? "CONECTADO" : "DESCONECTADO"}`,
  );
});

// Watcher para answerSdp
watch(answerSdp, (newVal) => {
  if (newVal) {
    debug("Respuesta SDP actualizada", {
      length: newVal.length,
      preview: newVal.substring(0, 50) + "...",
    });
  }
});

// Manejadores de errores globales
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

// Limpieza al desmontar
onUnmounted(() => {
  if (pc.value) {
    debug("Cerrando RTCPeerConnection al desmontar componente");
    pc.value.close();
    pc.value = null;
    info("RTCPeerConnection cerrada correctamente");
  }
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null;
    debug("Elemento de video limpiado al desmontar componente");
  }
});
</script>
