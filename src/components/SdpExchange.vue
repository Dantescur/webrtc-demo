<template>
  <div class="p-2 md:p-0">
    <!-- Mostrar SDP local -->
    <div id="sdp-offer" class="mb-4 md:mb-6">
      <el-text class="text-gray-300 mb-1 md:mb-2 block text-sm md:text-base">
        {{ localSdpLabel }}
      </el-text>
      <el-input
        type="textarea"
        :model-value="sdpData"
        :rows="3"
        :autosize="{ minRows: 3, maxRows: 5 }"
        readonly
        resize="none"
        class="sdp-textarea w-full"
        @click="copyToClipboard"
      >
        <template #append>
          <el-tooltip :content="copyTooltip" placement="top">
            <el-button
              :icon="CopyDocument"
              @click="copyToClipboard"
              plain
              class="hidden sm:inline-flex"
            />
          </el-tooltip>
        </template>
      </el-input>
      <el-text v-if="sdpData" class="text-gray-400 text-xs mt-1 block">
        {{ copyHint }}
      </el-text>
    </div>

    <!-- Entrada de SDP remoto -->
    <div id="sdp-answer" class="mb-4 md:mb-6">
      <el-text class="text-gray-300 mb-1 md:mb-2 block text-sm md:text-base">
        {{ remoteSdpLabel }}
      </el-text>
      <el-input
        type="textarea"
        v-model="remoteSdp"
        :rows="3"
        :autosize="{ minRows: 3, maxRows: 5 }"
        :disabled="loading"
        resize="none"
        class="sdp-textarea w-full"
        :placeholder="remotePlaceholder"
      >
        <template #append>
          <el-tooltip :content="submitTooltip" placement="top">
            <el-button
              :icon="Promotion"
              :disabled="!remoteSdp || loading"
              @click="submitSdp"
              plain
              :type="isViewerRoute ? 'success' : 'primary'"
              class="hidden sm:inline-flex"
            />
          </el-tooltip>
        </template>
      </el-input>
    </div>

    <!-- Botones de accion -->
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
      <el-button
        type="default"
        :icon="CopyDocument"
        :disabled="!sdpData"
        @click="copyToClipboard"
        class="w-full sm:flex-1"
      >
        <span class="hidden sm:inline">{{ copyButtonText }}</span>
        <span class="sm:hidden">Copiar</span>
      </el-button>
      <el-button
        :type="isViewerRoute ? 'success' : 'primary'"
        :icon="Promotion"
        :disabled="!remoteSdp || loading"
        :loading="loading"
        @click="submitSdp"
        class="w-full sm:flex-1"
      >
        <span class="hidden sm:inline">{{ submitButtonText }}</span>
        <span class="sm:hidden">Enviar</span>
      </el-button>
    </div>

    <!-- Notificaciones -->
    <el-dialog
      v-model="showNotification"
      :title="notificationTitle"
      width="90%"
      sm:width="300px"
      center
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <span class="text-gray-300">{{ notificationMessage }}</span>
      <template #footer>
        <el-button
          type="primary"
          @click="showNotification = false"
          class="w-full"
        >
          OK
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { CopyDocument, Promotion } from "@element-plus/icons-vue";

const props = defineProps<{
  sdpData: string;
  loading?: boolean;
  submitText?: string;
}>();

const emit = defineEmits<{
  (e: "submit", value: string): void;
}>();

const route = useRoute();
const remoteSdp = ref("");
const showNotification = ref(false);
const notificationTitle = ref("");
const notificationMessage = ref("");

const isViewerRoute = computed(() => route.path.includes("/live"));

// Contenido basado en ruta
const localSdpLabel = computed(() =>
  isViewerRoute.value ? "Tu respuesta SDP:" : "Tu oferta SDP:",
);

const remoteSdpLabel = computed(() =>
  isViewerRoute.value ? "Oferta SDP recibida:" : "Respuesta SDP recibida:",
);

const remotePlaceholder = computed(() =>
  isViewerRoute.value
    ? "Pega la oferta SDP del transmisor aquí"
    : "Pega la respuesta SDP del espectador aquí",
);

const copyTooltip = computed(() =>
  isViewerRoute.value ? "Copiar tu respuesta SDP" : "Copiar tu oferta SDP",
);

const submitTooltip = computed(() =>
  isViewerRoute.value
    ? "Enviar oferta recibida para conectar"
    : "Enviar respuesta recibida para conectar",
);

const copyButtonText = computed(() =>
  isViewerRoute.value ? "Copiar Respuesta" : "Copiar Oferta",
);

const submitButtonText = computed(
  () =>
    props.submitText || (isViewerRoute.value ? "Conectar" : "Aceptar Conexión"),
);

const copyHint = computed(() =>
  isViewerRoute.value
    ? "Haz clic para copiar tu respuesta SDP"
    : "Haz clic para copiar tu oferta SDP",
);

const copyToClipboard = async () => {
  if (!props.sdpData) return;

  try {
    const textarea = document.querySelector(".sdp-textarea");
    textarea?.classList.add("copied");
    setTimeout(() => textarea?.classList.remove("copied"), 1000);
    await navigator.clipboard.writeText(props.sdpData);
    notificationTitle.value = "¡Copiado!";
    notificationMessage.value = isViewerRoute.value
      ? "Respuesta SDP copiada al portapapeles"
      : "Oferta SDP copiada al portapapeles";
    showNotification.value = true;
  } catch (err) {
    notificationTitle.value = "Error";
    notificationMessage.value = "No se pudo copiar al portapapeles";
    showNotification.value = true;
  }
};

const submitSdp = () => {
  if (remoteSdp.value) {
    emit("submit", remoteSdp.value);
    remoteSdp.value = "";
  }
};

const remoteSdpType = computed(() => {
  try {
    const parsed = JSON.parse(remoteSdp.value);
    return parsed?.sdp?.type;
  } catch {
    return null;
  }
});

const hasValidRemoteSdp = computed(() => {
  try {
    const parsed = JSON.parse(remoteSdp.value);
    return typeof parsed === "object" && parsed.sdp;
  } catch {
    return false;
  }
});

defineExpose({
  remoteSdp,
  remoteSdpType,
  hasValidRemoteSdp,
  isViewerRoute,
  localSdp: computed(() => props.sdpData),
});
</script>

<style scoped>
.sdp-textarea {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.sdp-textarea:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.sdp-textarea:deep(.el-textarea__inner) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-family: monospace;
  font-size: 0.85rem;

  @media (min-width: 640px) {
    font-size: 0.9rem;
  }
}

.sdp-textarea:deep(.el-textarea__inner):focus {
  border-color: var(--el-color-primary);
}

.sdp-textarea:deep(.el-input-group__append) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.sdp-textarea:deep(.el-input-group__append .el-button) {
  color: var(--el-color-primary);
  background-color: transparent;
  border: none;
}
</style>
